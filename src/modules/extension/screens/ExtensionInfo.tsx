/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { ComponentProps, useMemo } from 'react';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import CardActionArea from '@mui/material/CardActionArea';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { Metadata } from '@/modules/core/components/texts/Metadata.tsx';
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { ExtensionAction, InstalledState, TExtension } from '@/modules/extension/Extensions.types.ts';
import { languageCodeToName, languageSortComparator } from '@/modules/core/utils/Languages.ts';
import { assertIsDefined } from '@/Asserts.ts';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { ListCardContent } from '@/modules/core/components/lists/cards/ListCardContent.tsx';
import {
    getInstalledState,
    translateExtensionLanguage,
    updateExtension,
} from '@/modules/extension/Extensions.utils.ts';
import { Sources } from '@/modules/source/services/Sources.ts';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { SourceConfigurableInfo, SourceIdInfo, SourceLanguageInfo } from '@/modules/source/Source.types.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { createUpdateSourceMetadata, useGetSourceMetadata } from '@/modules/source/services/SourceMetadata.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { INSTALLED_STATE_TO_TRANSLATION_KEY_MAP } from '@/modules/extension/Extensions.constants.ts';

const Header = ({ name, pkgName, iconUrl, repo }: TExtension) => (
    <Stack sx={{ alignItems: 'center' }}>
        <SpinnerImage alt={name} src={requestManager.getValidImgUrlFor(iconUrl)} />
        <Typography variant="h5" component="h2">
            {name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
            {pkgName.replace('eu.kanade.tachiyomi.extension.', '')}
        </Typography>
        {repo && (
            <Typography variant="body2" color="textSecondary">
                {repo}
            </Typography>
        )}
    </Stack>
);

const ExtensionMetadata = ({
    addDivider = true,
    ...props
}: ComponentProps<typeof Metadata> & { addDivider?: boolean }) => (
    <>
        <Metadata
            {...props}
            stackProps={{
                // eslint-disable-next-line react/destructuring-assignment
                ...props.stackProps,
                sx: {
                    // eslint-disable-next-line react/destructuring-assignment
                    ...props.stackProps?.sx,
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    flexGrow: 1,
                },
            }}
            titleProps={{
                // eslint-disable-next-line react/destructuring-assignment
                ...props.titleProps,
                variant: 'body2',
            }}
        />
        {addDivider && <Divider orientation="vertical" sx={{ height: '25px' }} />}
    </>
);

const Meta = ({ versionName, lang, isNsfw }: TExtension) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ExtensionMetadata title={t('global.label.version')} value={versionName} />
            <ExtensionMetadata title={t('global.language.label.language')} value={languageCodeToName(lang)} />
            {isNsfw && (
                <ExtensionMetadata
                    title={t('extension.label.age_rating')}
                    value="18+"
                    valueProps={{ color: 'error' }}
                />
            )}
        </Stack>
    );
};

const ActionButton = ({ pkgName, isInstalled, isObsolete, hasUpdate }: TExtension) => {
    const handleBack = useBackButton();
    const { t } = useTranslation();

    const installedState = getInstalledState(isInstalled, isObsolete, hasUpdate);

    return (
        <Box sx={{ px: 1 }}>
            <Button
                sx={{
                    width: '100%',
                    color: installedState === InstalledState.OBSOLETE ? 'red' : 'inherit',
                }}
                variant="outlined"
                size="large"
                onClick={async () => {
                    const action = hasUpdate ? ExtensionAction.UPDATE : ExtensionAction.UNINSTALL;
                    try {
                        await updateExtension(pkgName, isObsolete, action);

                        if (action === ExtensionAction.UNINSTALL) {
                            handleBack();
                        }
                    } catch (e) {
                        defaultPromiseErrorHandler('ExtensionInfo::ActionButton::onClick');
                    }
                }}
            >
                {t(INSTALLED_STATE_TO_TRANSLATION_KEY_MAP[installedState])}
            </Button>
        </Box>
    );
};

const SourceCard = (source: SourceIdInfo & SourceLanguageInfo & SourceConfigurableInfo) => {
    const { id, isConfigurable } = source;

    const { t } = useTranslation();
    const { isEnabled } = useGetSourceMetadata(source);

    const updateSetting = createUpdateSourceMetadata(source, (e) =>
        makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
    );

    return (
        <StyledGroupItemWrapper key={id} sx={{ px: 0 }}>
            <Card>
                <CardActionArea onClick={() => updateSetting('isEnabled', !isEnabled)}>
                    <ListCardContent>
                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                            {translateExtensionLanguage(Sources.getLanguage(source))}
                        </Typography>
                        {isConfigurable && (
                            <CustomTooltip title={t('settings.title')}>
                                <IconButton
                                    component={Link}
                                    to={AppRoutes.sources.childRoutes.configure.path(id)}
                                    color="inherit"
                                    onClick={(e) => e.stopPropagation()}
                                    {...MUIUtil.preventRippleProp()}
                                >
                                    <SettingsIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        <Switch checked={isEnabled} />
                    </ListCardContent>
                </CardActionArea>
            </Card>
        </StyledGroupItemWrapper>
    );
};

const SourceList = ({ sources }: { sources: (SourceIdInfo & SourceLanguageInfo & SourceConfigurableInfo)[] }) => (
    <Box sx={{ px: 1 }}>
        {sources.map((source) => (
            <SourceCard key={source.id} {...source} />
        ))}
    </Box>
);

export const ExtensionInfo = () => {
    const { t } = useTranslation();
    const { pkgName } = useParams<{ pkgName: string }>();

    useAppTitle(t('source.extension_info.title'));

    const extensionResponse = requestManager.useGetExtension(pkgName);
    const sourcesResponse = requestManager.useGetSourceList();

    const { extension } = extensionResponse.data ?? {};
    const sources = useMemo(() => {
        if (!sourcesResponse.data?.sources) {
            return [];
        }

        return sourcesResponse.data.sources.nodes
            .filter((source) => source.extension.pkgName === extension?.pkgName)
            .sort((a, b) => languageSortComparator(Sources.getLanguage(a), Sources.getLanguage(b)));
    }, [extension?.pkgName, sourcesResponse.data]);

    const isLoading = extensionResponse.loading || sourcesResponse.loading;
    const error = extensionResponse.error || sourcesResponse.error;

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(extensionResponse.error)}
                retry={() => {
                    if (extensionResponse.error) {
                        extensionResponse
                            .refetch()
                            .catch(defaultPromiseErrorHandler('ExtensionInfo::extension::refetch'));
                    }

                    if (sourcesResponse.error) {
                        sourcesResponse.refetch().catch(defaultPromiseErrorHandler('ExtensionInfo::sources::refetch'));
                    }
                }}
            />
        );
    }

    assertIsDefined(extension);

    return (
        <Stack sx={{ gap: 2 }}>
            <Header {...extension} />
            <Meta {...extension} />
            <ActionButton {...extension} />
            <SourceList sources={sources} />
        </Stack>
    );
};
