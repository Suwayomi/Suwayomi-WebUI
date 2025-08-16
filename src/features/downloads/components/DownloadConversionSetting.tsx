/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import { SettingsDownloadConversion } from '@/lib/graphql/generated/graphql.ts';
import { DOWNLOAD_CONVERSION_COMPRESSION } from '@/features/downloads/Downloads.constants.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';

const DEFAULT_MIME_TYPE = 'default';
const MIME_TYPE_PREFIX = 'image/';
const DEFAULT_FOCUS_INDEX = -1;

const normalizeMimeType = (mimeType: string): string => mimeType.replace(MIME_TYPE_PREFIX, '');

const isDefaultMimeType = (mimeType: string): boolean =>
    normalizeMimeType(mimeType.toLowerCase().trim()) === DEFAULT_MIME_TYPE;

const isDuplicateConversion = (mimeType: string, index: number, conversions: SettingsDownloadConversion[]): boolean =>
    conversions.slice(0, index).some((conversion) => conversion.mimeType === mimeType);

const isValidCompressionLevel = (compression: number | null | undefined): boolean =>
    compression == null ||
    (compression >= DOWNLOAD_CONVERSION_COMPRESSION.min && compression <= DOWNLOAD_CONVERSION_COMPRESSION.max);

const containsInvalidConversion = (conversions: SettingsDownloadConversion[]): boolean =>
    conversions.some(
        ({ mimeType, compressionLevel }, index) =>
            !isValidCompressionLevel(compressionLevel) || isDuplicateConversion(mimeType, index, conversions),
    );

const normalizeConversions = (conversions: SettingsDownloadConversion[]): SettingsDownloadConversion[] =>
    conversions.map((conversion) => ({
        ...conversion,
        mimeType: normalizeMimeType(conversion.mimeType),
        target: normalizeMimeType(conversion.target),
    }));

const toValidServerConversions = (conversions: SettingsDownloadConversion[]): SettingsDownloadConversion[] =>
    conversions
        .filter(({ mimeType, target }) => !!mimeType && !!target)
        .map((conversion) => ({
            ...conversion,
            mimeType: `${MIME_TYPE_PREFIX}${conversion.mimeType}`,
            target: `${MIME_TYPE_PREFIX}${conversion.target}`,
        }));

const maybeAddDefault = (conversions: SettingsDownloadConversion[]) => {
    const isDefaultDefined = conversions.some(({ mimeType }) => isDefaultMimeType(mimeType));

    return [
        ...(isDefaultDefined
            ? []
            : [
                  {
                      mimeType: DEFAULT_MIME_TYPE,
                      target: '',
                      compressionLevel: null,
                  },
              ]),
        ...conversions,
    ];
};

const didUpdateConversions = (
    conversions: SettingsDownloadConversion[],
    tmpConversions: SettingsDownloadConversion[],
): boolean => {
    if (conversions.length !== tmpConversions.length) {
        return true;
    }

    return conversions.some(({ mimeType, target, compressionLevel }, index) => {
        const tmpConversion = tmpConversions[index];

        return (
            normalizeMimeType(mimeType) !== tmpConversion.mimeType ||
            normalizeMimeType(target) !== tmpConversion.target ||
            compressionLevel !== tmpConversion.compressionLevel
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
}: {
    shouldAutoFocus: boolean;
    isDefault: boolean;
    isDuplicate: boolean;
    label: string;
    value: string;
    onUpdate: (value: string) => void;
}) => {
    const { t } = useTranslation();

    return (
        <TextField
            sx={{ maxWidth: 150 }}
            autoFocus={shouldAutoFocus}
            label={label}
            value={value}
            disabled={isDefault}
            error={isDuplicate}
            helperText={isDuplicate && t('global.error.label.invalid_input')}
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">{MIME_TYPE_PREFIX}</InputAdornment>,
                },
            }}
            onChange={(e) => onUpdate(e.target.value.trim())}
        />
    );
};

const Conversion = ({
    shouldAutoFocusMimeTypeTextField,
    conversion: { mimeType, target, compressionLevel },
    setFocusMimeTypeTextField,
    onChange,
    isDuplicate,
}: {
    shouldAutoFocusMimeTypeTextField: boolean;
    conversion: SettingsDownloadConversion;
    setFocusMimeTypeTextField: (focus: boolean) => void;
    onChange: (newConversion: SettingsDownloadConversion | null) => void;
    isDuplicate: boolean;
}) => {
    const { t } = useTranslation();

    const isCompressionLevelValid = isValidCompressionLevel(compressionLevel);
    const isDefault = isDefaultMimeType(mimeType) && !isDuplicate;
    const isDisabled = isDefault && !target && compressionLevel == null;

    return (
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
                }}
            >
                <MimeTypeTextField
                    shouldAutoFocus={shouldAutoFocusMimeTypeTextField}
                    isDefault={isDefault}
                    isDuplicate={isDuplicate}
                    label={t('download.settings.conversion.mime_type')}
                    value={mimeType}
                    onUpdate={(value) => {
                        setFocusMimeTypeTextField(true);

                        onChange({
                            mimeType: value,
                            target,
                            compressionLevel,
                        });
                    }}
                />
                <TypographyMaxLines sx={{ mx: 1 }}>→</TypographyMaxLines>
                <MimeTypeTextField
                    shouldAutoFocus={false}
                    isDefault={false}
                    isDuplicate={false}
                    label={t('download.settings.conversion.target')}
                    value={target}
                    onUpdate={(value) =>
                        onChange({
                            mimeType,
                            target: value,
                            compressionLevel,
                        })
                    }
                />
                <TextField
                    label={t('download.settings.conversion.compression_level')}
                    value={compressionLevel ?? ''}
                    type="number"
                    error={!isCompressionLevelValid}
                    helperText={!isCompressionLevelValid ? t('global.error.label.invalid_input') : ''}
                    slotProps={{
                        input: {
                            inputProps: DOWNLOAD_CONVERSION_COMPRESSION,
                        },
                    }}
                    onChange={(e) => {
                        onChange({
                            mimeType,
                            target,
                            compressionLevel: e.target.value ? Number(e.target.value) : undefined,
                        });
                    }}
                />
            </Stack>
            <CustomTooltip disabled={isDisabled} title={t('chapter.action.download.delete.label.action')}>
                <IconButton
                    disabled={isDisabled}
                    onClick={() => {
                        setFocusMimeTypeTextField(false);
                        onChange(null);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </CustomTooltip>
        </Stack>
    );
};

export const DownloadConversionSetting = ({
    conversions,
    updateSetting,
}: {
    conversions: SettingsDownloadConversion[];
    updateSetting: (conversions: SettingsDownloadConversion[]) => Promise<void>;
}) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [tmpConversions, setTmpConversions] = useState(normalizeConversions(maybeAddDefault(conversions)));
    const [focusedMimeTypeTextFieldIndex, setFocusedMimeTypeTextFieldIndex] = useState(DEFAULT_FOCUS_INDEX);

    const hasInvalidConversion = containsInvalidConversion(tmpConversions);

    const hasChanged = didUpdateConversions(normalizeConversions(maybeAddDefault(conversions)), tmpConversions);

    const onClose = (newConversions: SettingsDownloadConversion[] = conversions) => {
        setTmpConversions(normalizeConversions(maybeAddDefault(newConversions)));
        setIsDialogOpen(false);
    };

    const onCancel = () => {
        onClose(conversions);
    };

    return (
        <>
            <ListItemButton disabled={false} onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={t('download.settings.conversion.title')}
                    secondary={conversions
                        .map((conversion) => `${conversion.mimeType} → ${conversion.target}`)
                        .join('; ')}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>
            <Dialog open={isDialogOpen} onClose={onCancel}>
                <DialogTitle>{t('download.settings.conversion.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                        {t('download.settings.conversion.description', { value: 'none' })}
                    </DialogContentText>
                    <Stack sx={{ flexDirection: 'column', gap: 3 }}>
                        {tmpConversions.map((conversion, index) => {
                            const { mimeType } = conversion;

                            const isDuplicate = isDuplicateConversion(mimeType, index, tmpConversions);
                            const shouldAutoFocusMimeTypeTextField = index === focusedMimeTypeTextFieldIndex;

                            return (
                                <Conversion
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${mimeType}-${index}`}
                                    conversion={conversion}
                                    isDuplicate={isDuplicate}
                                    setFocusMimeTypeTextField={(focus) =>
                                        setFocusedMimeTypeTextFieldIndex(focus ? index : DEFAULT_FOCUS_INDEX)
                                    }
                                    shouldAutoFocusMimeTypeTextField={shouldAutoFocusMimeTypeTextField}
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
                </DialogContent>
                <DialogActions>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setTmpConversions((prev) => [
                                    ...prev,
                                    { mimeType: '', target: '', compressionLevel: null },
                                ]);
                            }}
                        >
                            {t('global.button.add')}
                        </Button>
                        <Stack direction="row">
                            <Button onClick={onCancel}>{t('global.button.cancel')}</Button>
                            <Button
                                disabled={hasInvalidConversion || !hasChanged}
                                onClick={() =>
                                    updateSetting(toValidServerConversions(tmpConversions)).then(() =>
                                        onClose(toValidServerConversions(tmpConversions)),
                                    )
                                }
                            >
                                {t('global.button.ok')}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};
