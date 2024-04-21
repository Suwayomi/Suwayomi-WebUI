/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getVersion } from '@/screens/settings/About.tsx';
import { useUpdateChecker } from '@/util/useUpdateChecker.tsx';

export const ServerUpdateChecker = () => {
    const { t } = useTranslation();

    const {
        data: serverUpdateCheckData,
        loading: isCheckingForServerUpdate,
        error: serverUpdateCheckError,
        refetch: checkForUpdate,
    } = requestManager.useCheckForServerUpdate({ notifyOnNetworkStatusChange: true, fetchPolicy: 'cache-only' });

    const { data } = requestManager.useGetAbout();
    const { aboutServer } = data ?? {};

    const [open, setOpen] = useState(true);

    const selectedServerChannelInfo = serverUpdateCheckData?.checkForServerUpdates?.find(
        (channel) => channel.channel === aboutServer?.buildType,
    );
    const version = aboutServer ? getVersion(aboutServer) : undefined;
    const isServerUpdateAvailable = !!selectedServerChannelInfo?.tag && selectedServerChannelInfo.tag !== version;

    const handleClose = () => {
        setOpen(false);
    };

    useUpdateChecker('server', checkForUpdate);

    if (isCheckingForServerUpdate) {
        return null;
    }

    if (serverUpdateCheckError) {
        return null;
    }

    if (!isServerUpdateAvailable) {
        return null;
    }

    const isAboutPage = window.location.pathname === '/settings/about';
    if (isAboutPage) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{t('global.update.label.available')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t('global.update.label.info', {
                        channel: selectedServerChannelInfo.channel,
                        version: selectedServerChannelInfo.tag,
                    })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('global.label.close')}</Button>
                <Button onClick={handleClose} variant="contained" href={selectedServerChannelInfo.url} target="_blank">
                    {t('chapter.action.download.add.label.action')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
