/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { UpdateState } from '@/lib/graphql/generated/graphql.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { VersionInfo } from '@/features/app-updates/components/VersionInfo.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { epochToDate } from '@/base/utils/DateHelper.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export function About() {
    const { t } = useTranslation();

    useAppTitle(t('settings.about.title'));

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
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('About::refetch'))}
            />
        );
    }

    const { aboutServer, aboutWebUI } = data!;
    const selectedServerChannelInfo = serverUpdateCheckData?.checkForServerUpdates?.find(
        (channel) => channel.channel === aboutServer.buildType,
    );
    const isServerUpdateAvailable =
        !!selectedServerChannelInfo?.tag && selectedServerChannelInfo.tag !== aboutServer.version;
    const isWebUIUpdateAvailable = !!webUIUpdateData?.checkForWebUIUpdate.updateAvailable;

    return (
        <List sx={{ pt: 0 }}>
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
                        secondary={`${aboutServer.name} (${aboutServer.buildType})`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.server.label.version')}
                        secondary={
                            <VersionInfo
                                version={aboutServer.version}
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
                        secondary={epochToDate(Number(aboutServer.buildTime)).toString()}
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
