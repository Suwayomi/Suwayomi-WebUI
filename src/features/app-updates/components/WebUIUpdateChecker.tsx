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
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { UpdateState, WebUiChannel, WebUiUpdateStatus } from '@/lib/graphql/generated/graphql.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { ABOUT_WEBUI, WEBUI_UPDATE_CHECK } from '@/lib/graphql/fragments/InfoFragments.ts';
import { VersionUpdateInfoDialog } from '@/features/app-updates/components/VersionUpdateInfoDialog.tsx';
import { useUpdateChecker } from '@/features/app-updates/hooks/useUpdateChecker.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

const disabledUpdateCheck = () => Promise.resolve();

export const WebUIUpdateChecker = () => {
    const { t } = useTranslation();

    const [webUIVersion, setWebUIVersion] = useLocalStorage<string>('webUIVersion');
    const [open, setOpen] = useState(false);

    const {
        settings: { webUIInformAvailableUpdate },
    } = useMetadataServerSettings();
    const serverSettings = requestManager.useGetServerSettings();
    const isAutoUpdateEnabled = !!serverSettings.data?.settings.webUIUpdateCheckInterval;

    const shouldCheckForUpdate = !isAutoUpdateEnabled && webUIInformAvailableUpdate;

    const { data: aboutData } = requestManager.useGetAbout();
    const { aboutWebUI } = aboutData ?? {};

    const { data: webUIUpdateData, refetch: checkForUpdate } = requestManager.useCheckForWebUIUpdate({
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-only',
    });

    const { data: webUIUpdateStatusData } = requestManager.useGetWebUIUpdateStatus();
    const { state: webUIUpdateState, ...updateStatus } = (webUIUpdateStatusData?.getWebUIUpdateStatus ?? {
        state: UpdateState.Idle,
        progress: 0,
        info: undefined,
    }) satisfies OptionalProperty<WebUiUpdateStatus, 'info'>;

    const updateChecker = useUpdateChecker(
        'webUI',
        shouldCheckForUpdate ? checkForUpdate : disabledUpdateCheck,
        webUIUpdateData?.checkForWebUIUpdate.tag,
    );

    const changelogUrl =
        updateStatus.info?.channel === WebUiChannel.Stable
            ? `https://github.com/Suwayomi/Suwayomi-WebUI/releases/latest`
            : `https://github.com/Suwayomi/Suwayomi-WebUI/issues/749`;

    const newVersion = aboutWebUI?.tag;
    const isSameAsCurrent = !newVersion || !webUIVersion || webUIVersion === newVersion;

    const saveInitialVersion = !webUIVersion && !!newVersion;
    if (saveInitialVersion) {
        setWebUIVersion(newVersion);
    }

    if (!isSameAsCurrent && !open) {
        setOpen(true);
    }

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
    }, [webUIUpdateState]);

    const isUpdateAvailable =
        shouldCheckForUpdate && updateChecker.handleUpdate && webUIUpdateData?.checkForWebUIUpdate.updateAvailable;
    if (isUpdateAvailable) {
        const isUpdateInProgress = webUIUpdateState === UpdateState.Downloading;

        return (
            <VersionUpdateInfoDialog
                info={t('settings.about.webui.label.info', {
                    version: webUIUpdateData?.checkForWebUIUpdate.tag,
                    channel: webUIUpdateData?.checkForWebUIUpdate.channel,
                })}
                changelogUrl={changelogUrl}
                disabled={isUpdateInProgress}
                onAction={() =>
                    requestManager
                        .updateWebUI()
                        .response.catch((e) =>
                            makeToast(t('settings.about.webui.label.update_failure'), 'error', getErrorMessage(e)),
                        )
                }
                actionTitle={
                    isUpdateInProgress
                        ? t('global.update.label.updating', { progress: updateStatus.progress })
                        : t('extension.action.label.update')
                }
                updateCheckerProps={[
                    'webUI',
                    isAutoUpdateEnabled ? disabledUpdateCheck : checkForUpdate,
                    webUIUpdateData?.checkForWebUIUpdate.tag,
                ]}
            />
        );
    }

    if (!open) {
        return null;
    }

    return (
        <Dialog open={open}>
            <DialogTitle>{t('settings.about.webui.label.updated')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('global.update.label.update_success', {
                        name: t('settings.webui.title.webui'),
                        version: newVersion,
                        channel: aboutWebUI?.channel,
                    })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button href={changelogUrl} target="_blank" rel="noreferrer">
                    {t('global.button.changelog')}
                </Button>
                <Button
                    onClick={() => {
                        setWebUIVersion(newVersion);
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
