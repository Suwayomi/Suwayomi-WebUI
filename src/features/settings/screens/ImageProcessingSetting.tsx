/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { d } from 'koration';
import Collapse from '@mui/material/Collapse';
import { useElementSize } from '@mantine/hooks';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import {
    Maybe,
    SettingsDownloadConversion,
    SettingsDownloadConversionHeader,
    SettingsDownloadConversionType,
} from '@/lib/graphql/generated/graphql.ts';
import { SelectSettingValue, SelectSettingValueDisplayInfo } from '@/base/components/settings/SelectSetting.tsx';
import { Select } from '@/base/components/inputs/Select.tsx';
import { TranslationKey } from '@/base/Base.types.ts';
import {
    IMAGE_PROCESSING_CALL_TIMEOUT,
    IMAGE_PROCESSING_COMPRESSION,
    IMAGE_PROCESSING_CONNECT_TIMEOUT,
} from '@/features/settings/Settings.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export type TSettingsDownloadConversionHeader = SettingsDownloadConversionHeader & {
    /**
     * The conversion object does not have a stable key, which causes issues when editing the settings
     */
    id: number;
};

export type TSettingsDownloadConversion = Omit<SettingsDownloadConversion, 'headers'> & {
    /**
     * The conversion object does not have a stable key, which causes issues when editing the settings
     */
    id: number;
    mode: TargetMode;
    headers?: Maybe<TSettingsDownloadConversionHeader[]>;
};

let COUNTER = 0;

const INPUT_WIDTH = 250;

const DEFAULT_MIME_TYPE = 'default';
const MIME_TYPE_PREFIX = 'image/';

enum TargetMode {
    IMAGE = 'image',
    URL = 'url',
}

const TARGET_MODES = Object.values(TargetMode);
const TARGET_MODES_TO_TRANSLATION_KEY: { [flavor in TargetMode]: SelectSettingValueDisplayInfo } = {
    [TargetMode.IMAGE]: {
        text: 'download.settings.conversion.target_modes.image.title',
        description: 'download.settings.conversion.target_modes.image.description',
    },
    [TargetMode.URL]: {
        text: 'download.settings.conversion.target_modes.url.title',
        description: 'download.settings.conversion.target_modes.image.description',
    },
};
export const TARGET_MODES_SELECT_VALUES: SelectSettingValue<TargetMode>[] = TARGET_MODES.map((mode) => [
    mode,
    TARGET_MODES_TO_TRANSLATION_KEY[mode],
]);

const normalizeMimeType = (mimeType: string): string => mimeType.replace(MIME_TYPE_PREFIX, '');

const isDefaultMimeType = (mimeType: string): boolean =>
    normalizeMimeType(mimeType.toLowerCase().trim()) === DEFAULT_MIME_TYPE;

const isDuplicateHeader = (
    header: string,
    index: number,
    headers: SettingsDownloadConversionType['headers'],
): boolean => headers?.slice(0, index).some(({ name }) => name === header) ?? false;

const hasDuplicateHeaders = (headers: SettingsDownloadConversionType['headers']): boolean =>
    headers?.some((header, index) => isDuplicateHeader(header.name, index, headers)) ?? false;

const isDuplicateConversion = (mimeType: string, index: number, conversions: SettingsDownloadConversion[]): boolean =>
    conversions.slice(0, index).some((conversion) => conversion.mimeType === mimeType);

export const isUrlTargetMode = (target: string): boolean => target !== '' && !!target.match(/^https?:\/\//);

const isValidNumberSetting = (value: number | null | undefined, min: number, max: number): boolean =>
    value == null || (value >= min && value <= max);

const isValidCallTimeoutSetting = (timeout: string | null | undefined): boolean =>
    isValidNumberSetting(
        timeout ? d(timeout).seconds.inWholeSeconds : null,
        IMAGE_PROCESSING_CALL_TIMEOUT.min,
        IMAGE_PROCESSING_CALL_TIMEOUT.max,
    );

const isValidConnectTimeoutSetting = (timeout: string | null | undefined): boolean =>
    isValidNumberSetting(
        timeout ? d(timeout).seconds.inWholeSeconds : null,
        IMAGE_PROCESSING_CONNECT_TIMEOUT.min,
        IMAGE_PROCESSING_CONNECT_TIMEOUT.max,
    );

const isValidCompressionLevel = (compression: number | null | undefined): boolean =>
    isValidNumberSetting(compression, IMAGE_PROCESSING_COMPRESSION.min, IMAGE_PROCESSING_COMPRESSION.max);

const isUnsetConversion = (mimeType: string, target: string): boolean => mimeType === '' && target === '';

const isInvalidTarget = (target: string, mode: TargetMode, mimeType: string): boolean => {
    if (isDefaultMimeType(mimeType) && !target) {
        return false;
    }

    return mode === TargetMode.URL && !isUrlTargetMode(target);
};

const containsInvalidConversion = (conversions: TSettingsDownloadConversion[]): boolean =>
    conversions.some(
        ({ mimeType, compressionLevel, target, callTimeout, connectTimeout, headers, mode }, index) =>
            isUnsetConversion(mimeType, target) ||
            isInvalidTarget(target, mode, mimeType) ||
            !isValidCompressionLevel(compressionLevel) ||
            !isValidCallTimeoutSetting(callTimeout) ||
            !isValidConnectTimeoutSetting(connectTimeout) ||
            isDuplicateConversion(mimeType, index, conversions) ||
            hasDuplicateHeaders(headers),
    );

const getTargetMode = (target: string): TargetMode => {
    if (isUrlTargetMode(target)) {
        return TargetMode.URL;
    }

    return TargetMode.IMAGE;
};

export const addStableIdToHeaders = (
    headers: (SettingsDownloadConversionHeader | TSettingsDownloadConversionHeader)[],
): TSettingsDownloadConversionHeader[] =>
    headers.map((header) => ({
        // eslint-disable-next-line no-plusplus
        id: (header as TSettingsDownloadConversionHeader).id ?? COUNTER++,
        ...header,
    }));

export const addStableIdToConversions = (
    conversions: (SettingsDownloadConversion | TSettingsDownloadConversion)[],
): TSettingsDownloadConversion[] =>
    conversions.map((conversion) => ({
        // eslint-disable-next-line no-plusplus
        id: (conversion as TSettingsDownloadConversion).id ?? COUNTER++,
        ...conversion,
        mode: getTargetMode(conversion.target),
        headers: conversion.headers ? addStableIdToHeaders(conversion.headers) : null,
    }));

const normalizeConversions = (conversions: TSettingsDownloadConversion[]): TSettingsDownloadConversion[] =>
    conversions.map((conversion) => ({
        ...conversion,
        mimeType: normalizeMimeType(conversion.mimeType),
        target: normalizeMimeType(conversion.target),
    }));

const toValidServerMimeType = (mimeType: string): string => {
    if (isDefaultMimeType(mimeType)) {
        return DEFAULT_MIME_TYPE;
    }

    return `${MIME_TYPE_PREFIX}${mimeType}`;
};

const toValidServerConversions = (conversions: TSettingsDownloadConversion[]): SettingsDownloadConversion[] =>
    conversions
        .filter(({ mimeType, target }) => !!mimeType && !!target)
        .map(({ id, mode, ...conversion }) => ({
            ...conversion,
            mimeType: toValidServerMimeType(conversion.mimeType),
            target: isUrlTargetMode(conversion.target) ? conversion.target : `${MIME_TYPE_PREFIX}${conversion.target}`,
            headers: conversion.headers?.map(({ id: headerId, ...header }) => header) ?? null,
        }));

const maybeAddDefault = (conversions: TSettingsDownloadConversion[]): TSettingsDownloadConversion[] => {
    const isDefaultDefined = conversions.some(({ mimeType }) => isDefaultMimeType(mimeType));

    return [
        ...(isDefaultDefined
            ? []
            : [
                  {
                      id: -1,
                      mode: TargetMode.IMAGE,
                      mimeType: DEFAULT_MIME_TYPE,
                      target: '',
                      compressionLevel: null,
                      headers: null,
                      callTimeout: null,
                      connectTimeout: null,
                  },
              ]),
        ...conversions,
    ];
};

const normalizeHeaders = (
    headers: SettingsDownloadConversionType['headers'],
): SettingsDownloadConversionType['headers'] => headers?.filter(({ name }) => name !== '');

const didUpdateConversions = (
    conversions: TSettingsDownloadConversion[],
    tmpConversions: TSettingsDownloadConversion[],
): boolean => {
    if (conversions.length !== tmpConversions.length) {
        return true;
    }

    return conversions.some(({ mimeType, target, compressionLevel, callTimeout, connectTimeout, headers }, index) => {
        const tmpConversion = tmpConversions[index];

        const orgHeaders = normalizeHeaders(headers);
        const tmpHeaders = normalizeHeaders(tmpConversion.headers);

        return (
            normalizeMimeType(mimeType) !== tmpConversion.mimeType ||
            normalizeMimeType(target) !== tmpConversion.target ||
            compressionLevel !== tmpConversion.compressionLevel ||
            callTimeout !== tmpConversion.callTimeout ||
            connectTimeout !== tmpConversion.connectTimeout ||
            (orgHeaders?.length ?? 0) !== (tmpHeaders?.length ?? 0) ||
            !!orgHeaders?.some(
                (header, headerIndex) =>
                    header.name !== tmpHeaders?.[headerIndex]?.name ||
                    header.value !== tmpHeaders?.[headerIndex]?.value,
            )
        );
    });
};

const MimeTypeTextField = ({
    shouldAutoFocus,
    isDefault,
    isDuplicate,
    label,
    value,
    onUpdate,
    mode,
}: {
    shouldAutoFocus: boolean;
    isDefault: boolean;
    isDuplicate: boolean;
    label: string;
    value: string;
    onUpdate: (value: string) => void;
    mode: TargetMode;
}) => {
    const { t } = useTranslation();

    const isImageMode = mode === TargetMode.IMAGE;
    const isValidUrl = value === '' || isUrlTargetMode(value);
    const isValid = !isDuplicate && (isImageMode || isValidUrl);

    return (
        <TextField
            sx={{ width: INPUT_WIDTH }}
            autoFocus={shouldAutoFocus}
            label={label}
            value={value}
            disabled={isDefault}
            error={!isValid}
            helperText={!isValid && t('global.error.label.invalid_input')}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">{isImageMode ? MIME_TYPE_PREFIX : null}</InputAdornment>
                    ),
                },
            }}
            onChange={(e) => onUpdate(e.target.value.trim())}
        />
    );
};

const Header = ({
    id,
    name,
    value,
    onChange,
    isDuplicate,
}: {
    isDuplicate: boolean;
    onChange: (header: TSettingsDownloadConversionHeader | null) => void;
} & TSettingsDownloadConversionHeader) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Stack
            sx={{
                gap: 1,
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
            }}
        >
            <Stack
                sx={{
                    flexDirection: 'row',
                    gap: 2,
                    [theme.breakpoints.down('md')]: {
                        flexDirection: 'column',
                        width: '100%',
                    },
                }}
            >
                <TextField
                    autoFocus
                    sx={{ width: INPUT_WIDTH }}
                    label={t('download.settings.conversion.headers.name')}
                    value={name}
                    error={isDuplicate}
                    helperText={isDuplicate && t('global.error.label.invalid_input')}
                    onChange={(e) =>
                        onChange({
                            id,
                            name: e.target.value,
                            value,
                        })
                    }
                />
                <TextField
                    sx={{ width: INPUT_WIDTH }}
                    label={t('download.settings.conversion.headers.value')}
                    value={value}
                    onChange={(e) =>
                        onChange({
                            id,
                            name,
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <CustomTooltip disabled={false} title={t('chapter.action.download.delete.label.action')}>
                <IconButton
                    onClick={() => {
                        onChange(null);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </CustomTooltip>
        </Stack>
    );
};

const Headers = ({
    open,
    headers,
    onChange,
}: {
    open: boolean;
    headers: Maybe<TSettingsDownloadConversionHeader[]> | undefined;
    onChange: (headers: Maybe<TSettingsDownloadConversionHeader[]>) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Collapse in={open}>
            <Stack sx={{ justifyContent: 'start', gap: 2 }}>
                <Typography>{t('download.settings.conversion.headers.title')}</Typography>
                {headers?.map((header, index) => (
                    <Header
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        {...header}
                        isDuplicate={isDuplicateHeader(header.name, index, headers)}
                        onChange={(updatedHeader) => {
                            const isDeletion = updatedHeader == null;
                            if (isDeletion) {
                                onChange(headers?.toSpliced(index, 1));
                                return;
                            }

                            onChange((headers ?? []).toSpliced(index, 1, updatedHeader));
                        }}
                    />
                ))}
                <Button
                    onClick={() => onChange([...(headers ?? []), ...addStableIdToHeaders([{ name: '', value: '' }])])}
                    variant="contained"
                    sx={{ width: 'fit-content' }}
                >
                    Add
                </Button>
            </Stack>
        </Collapse>
    );
};

const Conversion = ({
    conversion,
    conversion: { mimeType, target, compressionLevel, headers, callTimeout, connectTimeout },
    onChange,
    isDuplicate,
}: {
    conversion: TSettingsDownloadConversion;
    onChange: (newConversion: TSettingsDownloadConversion | null) => void;
    isDuplicate: boolean;
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const { ref: textFieldRef, height: textFieldHeight } = useElementSize();

    const [targetMode, setTargetMode] = useState(getTargetMode(target));
    const [areHeadersCollapsed, setAreHeadersCollapsed] = useState(true);

    const isImageMode = targetMode === TargetMode.IMAGE;

    const isCallTimeoutValid = isValidCallTimeoutSetting(callTimeout);
    const isConnectTimeoutValid = isValidConnectTimeoutSetting(connectTimeout);
    const isCompressionLevelValid = isValidCompressionLevel(compressionLevel);
    const isDefault = isDefaultMimeType(mimeType) && !isDuplicate;
    const isDisabled = isDefault && !target && compressionLevel == null;

    return (
        <Stack sx={{ gap: 2 }}>
            <Stack
                sx={{
                    gap: 1,
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    pt: 1,
                }}
            >
                <Stack
                    sx={{
                        gap: 1,
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                        [theme.breakpoints.down('md')]: {
                            flexDirection: 'column',
                            width: '100%',
                        },
                    }}
                >
                    <MimeTypeTextField
                        mode={TargetMode.IMAGE}
                        shouldAutoFocus
                        isDefault={isDefault}
                        isDuplicate={isDuplicate}
                        label={t('download.settings.conversion.mime_type')}
                        value={mimeType}
                        onUpdate={(value) => {
                            onChange({
                                ...conversion,
                                mimeType: value,
                            });
                        }}
                    />
                    <TypographyMaxLines sx={{ mx: 1 }}>→</TypographyMaxLines>
                    <FormControl sx={{ minWidth: '100px' }}>
                        <InputLabel id="image-conversion-target-mode-label">
                            {t('download.settings.conversion.target_modes.title')}
                        </InputLabel>
                        <Select
                            ref={textFieldRef}
                            id="image-conversion-target-mode"
                            labelId="image-conversion-target-mode-label"
                            label={t('download.settings.conversion.target_modes.title')}
                            value={targetMode}
                            onChange={(e) => setTargetMode(e.target.value)}
                        >
                            {TARGET_MODES_SELECT_VALUES.map(([selectValue, { text: selectText }]) => (
                                <MenuItem key={selectValue} value={selectValue}>
                                    {t(selectText as TranslationKey)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <MimeTypeTextField
                        mode={targetMode}
                        shouldAutoFocus={false}
                        isDefault={false}
                        isDuplicate={false}
                        label={t('download.settings.conversion.target')}
                        value={target}
                        onUpdate={(value) =>
                            onChange({
                                ...conversion,
                                target: value,
                            })
                        }
                    />
                    {isImageMode ? (
                        <TextField
                            sx={{ width: INPUT_WIDTH }}
                            label={t('download.settings.conversion.compression_level')}
                            value={compressionLevel ?? ''}
                            type="number"
                            error={!isCompressionLevelValid}
                            helperText={!isCompressionLevelValid ? t('global.error.label.invalid_input') : ''}
                            slotProps={{
                                input: {
                                    inputProps: IMAGE_PROCESSING_COMPRESSION,
                                },
                            }}
                            onChange={(e) => {
                                onChange({
                                    ...conversion,
                                    compressionLevel: e.target.value ? Number(e.target.value) : null,
                                });
                            }}
                        />
                    ) : (
                        <>
                            <TextField
                                sx={{ width: INPUT_WIDTH }}
                                label={t('download.settings.conversion.call_timeout')}
                                value={callTimeout ? d(callTimeout).seconds.inWholeSeconds : ''}
                                type="number"
                                error={!isCallTimeoutValid}
                                helperText={!isCallTimeoutValid ? t('global.error.label.invalid_input') : ''}
                                slotProps={{
                                    input: {
                                        inputProps: IMAGE_PROCESSING_CALL_TIMEOUT,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {t('global.date.label.second_other')}
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                onChange={(e) => {
                                    onChange({
                                        ...conversion,
                                        callTimeout: e.target.value
                                            ? d(Number(e.target.value)).seconds.toISOString()
                                            : null,
                                    });
                                }}
                            />
                            <TextField
                                sx={{ width: INPUT_WIDTH }}
                                label={t('download.settings.conversion.connect_timeout')}
                                value={connectTimeout ? d(connectTimeout).seconds.inWholeSeconds : ''}
                                type="number"
                                error={!isConnectTimeoutValid}
                                helperText={!isConnectTimeoutValid ? t('global.error.label.invalid_input') : ''}
                                slotProps={{
                                    input: {
                                        inputProps: IMAGE_PROCESSING_CONNECT_TIMEOUT,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {t('global.date.label.second_other')}
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                onChange={(e) => {
                                    onChange({
                                        ...conversion,
                                        connectTimeout: e.target.value
                                            ? d(Number(e.target.value)).seconds.toISOString()
                                            : null,
                                    });
                                }}
                            />
                            <Button
                                onClick={() => setAreHeadersCollapsed(!areHeadersCollapsed)}
                                variant={areHeadersCollapsed ? 'outlined' : 'contained'}
                                sx={{ height: textFieldHeight }}
                            >
                                {t('download.settings.conversion.headers.button', {
                                    count: headers?.length ?? 0,
                                })}
                            </Button>
                        </>
                    )}
                </Stack>
                <CustomTooltip disabled={isDisabled} title={t('chapter.action.download.delete.label.action')}>
                    <IconButton
                        disabled={isDisabled}
                        onClick={() => {
                            onChange(null);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </CustomTooltip>
            </Stack>
            <Headers
                open={!areHeadersCollapsed}
                headers={headers}
                onChange={(updatedHeaders) =>
                    onChange({
                        ...conversion,
                        headers: updatedHeaders,
                    })
                }
            />
        </Stack>
    );
};

export const ImageProcessingSetting = () => {
    const { t } = useTranslation();

    useAppTitle(t('download.settings.conversion.title'));

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadConversionSetting::refetch'))}
            />
        );
    }

    assertIsDefined(data?.settings?.downloadConversions);

    const conversions = data?.settings?.downloadConversions;

    const [tmpConversions, setTmpConversions] = useState(
        normalizeConversions(maybeAddDefault(addStableIdToConversions(conversions))),
    );

    const hasInvalidConversion = containsInvalidConversion(tmpConversions);
    const hasChanged = didUpdateConversions(
        normalizeConversions(maybeAddDefault(addStableIdToConversions(conversions))),
        tmpConversions,
    );

    const updateSetting = (value: ServerSettings['downloadConversions']): Promise<any> => {
        const mutation = mutateSettings({ variables: { input: { settings: { downloadConversions: value } } } });
        mutation.catch((e) => makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)));

        return mutation;
    };

    const onSubmit = async () => {
        try {
            await updateSetting(toValidServerConversions(tmpConversions));
        } catch (e) {
            // ignore error
        }
    };

    return (
        <Stack sx={{ p: 2, gap: 3 }}>
            <Typography>{t('download.settings.conversion.description', { value: 'none' })}</Typography>
            <Stack sx={{ flexDirection: 'column', gap: 5 }}>
                {tmpConversions.map((conversion, index) => {
                    const { mimeType } = conversion;

                    const isDuplicate = isDuplicateConversion(mimeType, index, tmpConversions);

                    return (
                        <Conversion
                            key={conversion.id}
                            conversion={conversion}
                            isDuplicate={isDuplicate}
                            onChange={(newConversion) => {
                                setTmpConversions((prev) =>
                                    maybeAddDefault(
                                        prev.toSpliced(index, 1, ...(newConversion ? [newConversion] : [])),
                                    ),
                                );
                            }}
                        />
                    );
                })}
            </Stack>
            <Stack
                direction="row"
                sx={{
                    gap: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => {
                        setTmpConversions((prev) => [
                            ...prev,
                            ...addStableIdToConversions([{ mimeType: '', target: '' }]),
                        ]);
                    }}
                >
                    {t('global.button.add')}
                </Button>
                <Button variant="contained" disabled={hasInvalidConversion || !hasChanged} onClick={onSubmit}>
                    {t('global.button.save')}
                </Button>
            </Stack>
        </Stack>
    );
};
