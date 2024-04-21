/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { UpdateState, WebUiChannel, WebUiUpdateStatus } from '@/lib/graphql/generated/graphql.ts';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { ABOUT_WEBUI, WEBUI_UPDATE_CHECK } from '@/lib/graphql/Fragments.ts';
import { useUpdateChecker } from '@/util/useUpdateChecker.tsx';

export const WebUIUpdateChecker = () => {
    const { t } = useTranslation();

    const [webUIVersion, setWebUIVersion] = useLocalStorage<string>('webUIVersion');
    const [open, setOpen] = useState(false);

    const serverSettings = requestManager.useGetServerSettings();
    const isAutoUpdateEnabled = !serverSettings.data?.settings.webUIUpdateCheckInterval;

    const { data: webUIUpdateData, refetch: checkForUpdate } = requestManager.useCheckForWebUIUpdate({
        skip: isAutoUpdateEnabled,
        notifyOnNetworkStatusChange: true,
    });

    const { data: webUIUpdateStatusData } = requestManager.useGetWebUIUpdateStatus();
    const { state: webUIUpdateState, ...updateStatus } = (webUIUpdateStatusData?.getWebUIUpdateStatus ?? {
        state: UpdateState.Idle,
        progress: 0,
        info: undefined,
    }) satisfies OptionalProperty<WebUiUpdateStatus, 'info'>;

    const updateChecker = useUpdateChecker('webUI', checkForUpdate, webUIUpdateData?.checkForWebUIUpdate.tag);

    const changelogUrl =
        updateStatus.info?.channel === WebUiChannel.Stable
            ? `https://github.com/Suwayomi/Suwayomi-WebUI/releases/tag/${updateStatus.info?.tag}`
            : `https://github.com/Suwayomi/Suwayomi-WebUI/issues/749`;

    useEffect(() => {
        const isError = webUIUpdateState === UpdateState.Error;
        if (isError) {
            makeToast(t('settings.about.webui.label.update_failure'), 'error');
        }

        const updateFinished = webUIUpdateState === UpdateState.Finished;

        const resetUpdateStatus = isError || updateFinished;
        if (resetUpdateStatus) {
            requestManager
                .resetWebUIUpdateStatus()
                .response.catch(defaultPromiseErrorHandler('WebUIUpdateChecker::resetWebUIUpdateStatus'));
        }

        if (!updateFinished) {
            return;
        }

        if (!updateStatus.info) {
            return;
        }
        requestManager.graphQLClient.client.cache.writeFragment({
            fragment: ABOUT_WEBUI,
            data: {
                __typename: 'AboutWebUI',
                channel: webUIUpdateStatusData!.getWebUIUpdateStatus.info.channel,
                tag: webUIUpdateStatusData!.getWebUIUpdateStatus.info.tag,
            },
        });
        requestManager.graphQLClient.client.cache.writeFragment({
            fragment: WEBUI_UPDATE_CHECK,
            data: {
                __typename: 'WebUIUpdateCheck',
                channel: webUIUpdateStatusData!.getWebUIUpdateStatus.info.channel,
                tag: webUIUpdateStatusData!.getWebUIUpdateStatus.info.tag,
                updateAvailable: false,
            },
        });

        const newVersion = updateStatus.info.tag;
        const isSameAsCurrent = webUIVersion === newVersion;

        setWebUIVersion(newVersion);

        if (isSameAsCurrent) {
            return;
        }

        setOpen(true);
    }, [webUIUpdateState]);

    const isUpdateAvailable = updateChecker.handleUpdate && webUIUpdateData?.checkForWebUIUpdate.updateAvailable;
    if (isUpdateAvailable) {
        const isUpdateInProgress = webUIUpdateState === UpdateState.Downloading;

        return (
            <Dialog open>
                <DialogTitle>{t('global.update.label.available')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('settings.about.webui.label.info', {
                            version: webUIUpdateData.checkForWebUIUpdate.tag,
                            channel: webUIUpdateData.checkForWebUIUpdate.channel,
                        })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between">
                        <Button href={changelogUrl} target="_blank">
                            {t('global.button.changelog')}
                        </Button>
                        <Stack direction="row">
                            <Button
                                disabled={isUpdateInProgress}
                                onClick={() => {
                                    updateChecker.remindLater();
                                    setOpen(false);
                                }}
                            >
                                {t('global.button.remind_later')}
                            </Button>
                            <Button
                                disabled={isUpdateInProgress}
                                onClick={() => {
                                    updateChecker.ignoreUpdate();
                                    setOpen(false);
                                }}
                            >
                                {t('global.button.ignore')}
                            </Button>
                            <Button
                                disabled={isUpdateInProgress}
                                onClick={() => {
                                    requestManager
                                        .updateWebUI()
                                        .response.catch(() =>
                                            makeToast(t('settings.about.webui.label.update_failure'), 'error'),
                                        );
                                }}
                                variant="contained"
                            >
                                {isUpdateInProgress
                                    ? t('global.update.label.updating', { progress: updateStatus.progress })
                                    : t('extension.action.label.update')}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>
        );
    }

    const handleUpdate = open && webUIUpdateState === UpdateState.Idle;
    if (!handleUpdate) {
        return null;
    }

    return (
        <Dialog open={open}>
            <DialogTitle>{t('settings.about.webui.label.updated')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('settings.about.webui.label.update_success', {
                        version: webUIVersion,
                    })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button href={changelogUrl} target="_blank">
                    {t('global.button.changelog')}
                </Button>
                <Button
                    onClick={() => {
                        setOpen(false);
                        window.location.reload();
                    }}
                    variant="contained"
                >
                    {t('global.button.refresh')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
