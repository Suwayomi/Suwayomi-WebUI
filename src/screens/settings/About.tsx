/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { t as translate } from 'i18next';
import DownloadingIcon from '@mui/icons-material/Downloading';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListItemLink } from '@/components/util/ListItemLink';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { GetAboutQuery, UpdateState } from '@/lib/graphql/generated/graphql.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { epochToDate } from '@/util/date.ts';

type AboutServer = GetAboutQuery['aboutServer'];

export const getVersion = (aboutServer: AboutServer) => {
    if (aboutServer.buildType === 'Stable') return `${aboutServer.version}`;
    return `${aboutServer.version}-${aboutServer.revision}`;
};

const getBuildTime = (aboutServer: AboutServer) => epochToDate(Number(aboutServer.buildTime)).toString();

const getUpdateCheckButtonIcon = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    updateState?: UpdateState,
    asLink: boolean = false,
) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;
    if (isUpdateInProgress) {
        return <DownloadingIcon />;
    }

    if (isLoading) {
        return <CircularProgress size={15} />;
    }

    const isRefreshRequired = !isUpdateAvailable || updateState === UpdateState.Error;
    if (isRefreshRequired) {
        return <RefreshIcon />;
    }

    return asLink ? <OpenInNewIcon /> : <DownloadIcon />;
};

const getUpdateCheckButtonText = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    error: any,
    updateState?: UpdateState,
    progress: number = 0,
) => {
    const isUpdating = updateState === UpdateState.Downloading;
    if (isUpdating) {
        return translate('global.update.label.updating', { progress });
    }

    const didUpdateFail = updateState === UpdateState.Error;
    if (didUpdateFail) {
        return translate('global.update.label.update_failure');
    }

    if (isLoading) {
        return translate('global.update.label.checking');
    }

    if (error) {
        return translate('global.update.label.check_failure');
    }

    if (isUpdateAvailable) {
        return translate('global.update.label.available');
    }

    return translate('global.update.label.up_to_date');
};

type BaseVersionInfoProps = {
    version: string;
    isCheckingForUpdate: boolean;
    isUpdateAvailable: boolean;
    updateCheckError: any;
    checkForUpdate: () => void;
};

type LinkVersionInfoProps = {
    downloadAsLink: true;
    url: string;
};

type TriggerVersionInfoProps = {
    triggerUpdate: () => void;
    updateState: UpdateState;
    progress: number;
};

type VersionInfoProps =
    | (BaseVersionInfoProps & PropertiesNever<TriggerVersionInfoProps> & LinkVersionInfoProps)
    | (BaseVersionInfoProps & TriggerVersionInfoProps & PropertiesNever<LinkVersionInfoProps>);

const VersionInfo = ({
    version,
    isCheckingForUpdate,
    isUpdateAvailable,
    updateCheckError,
    checkForUpdate,
    triggerUpdate,
    updateState,
    progress,
    downloadAsLink,
    url,
}: VersionInfoProps) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;

    const onClick = () => {
        if (isUpdateInProgress) {
            return;
        }

        const shouldCheckForUpdate = !isUpdateAvailable || updateCheckError || updateState === UpdateState.Error;
        if (shouldCheckForUpdate) {
            checkForUpdate();
            return;
        }

        if (isUpdateAvailable) {
            triggerUpdate?.();
        }
    };

    return (
        <Stack alignItems="start">
            <Typography component="span" variant="body2">
                {version}
            </Typography>
            <Button
                sx={{
                    marginTop: '5px',
                    backgroundColor: 'transparent',
                    pointerEvents: isUpdateInProgress ? 'none' : 'unset',
                }}
                size="small"
                variant="outlined"
                startIcon={getUpdateCheckButtonIcon(
                    isCheckingForUpdate,
                    isUpdateAvailable,
                    updateState,
                    downloadAsLink,
                )}
                onClick={onClick}
                {...(!!url && isUpdateAvailable
                    ? {
                          href: url,
                          target: '_blank',
                      }
                    : undefined)}
            >
                {getUpdateCheckButtonText(
                    isCheckingForUpdate,
                    isUpdateAvailable,
                    updateCheckError,
                    updateState,
                    progress,
                )}
            </Button>
        </Stack>
    );
};

export function About() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('settings.about.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    useSetDefaultBackTo('settings');

    const { data, loading, error, refetch } = requestManager.useGetAbout({ notifyOnNetworkStatusChange: true });

    const {
        data: serverUpdateCheckData,
        loading: isCheckingForServerUpdate,
        refetch: checkForServerUpdate,
        error: serverUpdateCheckError,
    } = requestManager.useCheckForServerUpdate({ notifyOnNetworkStatusChange: true });
    const {
        data: webUIUpdateData,
        loading: isCheckingForWebUIUpdate,
        refetch: checkForWebUIUpdate,
        error: orgWebUIUpdateCheckError,
    } = requestManager.useCheckForWebUIUpdate({ notifyOnNetworkStatusChange: true });
    const webUIUpdateCheckError = orgWebUIUpdateCheckError || webUIUpdateData?.checkForWebUIUpdate.tag === '';

    const { data: webUIUpdateStatusData } = requestManager.useGetWebUIUpdateStatus();
    const { state: webUIUpdateState, progress: webUIUpdateProgress } = webUIUpdateStatusData?.getWebUIUpdateStatus ?? {
        state: UpdateState.Idle,
        progress: 0,
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('About::refetch'))}
            />
        );
    }

    const { aboutServer, aboutWebUI } = data!;
    const selectedServerChannelInfo = serverUpdateCheckData?.checkForServerUpdates?.find(
        (channel) => channel.channel === aboutServer.buildType,
    );
    const isServerUpdateAvailable =
        !!selectedServerChannelInfo?.tag && selectedServerChannelInfo.tag !== getVersion(aboutServer);
    const isWebUIUpdateAvailable = !!webUIUpdateData?.checkForWebUIUpdate.updateAvailable;

    return (
        <List>
            <List
                sx={{ padding: 0 }}
                subheader={
                    <ListSubheader component="div" id="about-server-info">
                        {t('settings.server.title.server')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.title.server')}
                        secondary={`${aboutServer.name} ${aboutServer.buildType}`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.server.label.version')}
                        secondary={
                            <VersionInfo
                                version={getVersion(aboutServer)}
                                isCheckingForUpdate={isCheckingForServerUpdate}
                                isUpdateAvailable={isServerUpdateAvailable}
                                updateCheckError={serverUpdateCheckError}
                                checkForUpdate={checkForServerUpdate}
                                downloadAsLink
                                url={selectedServerChannelInfo?.url ?? ''}
                            />
                        }
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.server.label.build_time')}
                        secondary={getBuildTime(aboutServer)}
                    />
                </ListItem>
            </List>
            <Divider />
            <List
                sx={{ padding: 0 }}
                subheader={
                    <ListSubheader component="div" id="about-webui-info">
                        {t('settings.webui.title.webui')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.webui.label.channel')}
                        secondary={aboutWebUI.channel.toLocaleUpperCase()}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.webui.label.version')}
                        secondary={
                            <VersionInfo
                                version={aboutWebUI.tag}
                                isCheckingForUpdate={isCheckingForWebUIUpdate}
                                isUpdateAvailable={isWebUIUpdateAvailable}
                                updateCheckError={webUIUpdateCheckError}
                                checkForUpdate={checkForWebUIUpdate}
                                triggerUpdate={() =>
                                    requestManager
                                        .updateWebUI()
                                        .response.catch(defaultPromiseErrorHandler('About::updateWebUI'))
                                }
                                progress={webUIUpdateProgress}
                                updateState={webUIUpdateState}
                            />
                        }
                    />
                </ListItem>
            </List>
            <Divider />
            <List
                subheader={
                    <ListSubheader component="div" id="about-links">
                        {t('global.label.links')}
                    </ListSubheader>
                }
            >
                <ListItemLink to={aboutServer.github} target="_blank" rel="noreferrer">
                    <ListItemText primary={t('settings.about.server.label.github')} secondary={aboutServer.github} />
                </ListItemLink>
                <ListItemLink to="https://github.com/Suwayomi/Suwayomi-WebUI" target="_blank" rel="noreferrer">
                    <ListItemText
                        primary={t('settings.about.webui.label.github')}
                        secondary="https://github.com/Suwayomi/Suwayomi-WebUI"
                    />
                </ListItemLink>
                <ListItemLink to={aboutServer.discord} target="_blank" rel="noreferrer">
                    <ListItemText primary={t('global.label.discord')} secondary={aboutServer.discord} />
                </ListItemLink>
            </List>
        </List>
    );
}
