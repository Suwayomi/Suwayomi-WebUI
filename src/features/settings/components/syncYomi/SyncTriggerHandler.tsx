/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import CircularProgress from '@mui/material/CircularProgress';
import { closeSnackbar } from 'notistack';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { SyncState } from '@/lib/graphql/generated/graphql-base.types.ts';

const READER_PATH_PATTERN = /^\/manga\/\d+\/chapter\//;
export const SYNC_PROGRESS_TOAST_KEY = 'syncyomi-in-progress';

export const SyncTriggerHandler = () => {
    const { t } = useLingui();
    const { pathname } = useLocation();
    const { data } = requestManager.useGetServerSettings();
    const settings = data?.settings;

    const syncYomiEnabled = settings?.syncYomiEnabled ?? false;
    const syncOnWebUIStart = settings?.syncOnWebUIStart ?? false;
    const syncOnWebUIResume = settings?.syncOnWebUIResume ?? false;

    const isOnReader = READER_PATH_PATTERN.test(pathname);

    const { data: syncStatusData } = requestManager.useSyncStatusSubscription({
        skip: !syncYomiEnabled,
    });

    useEffect(() => {
        if (!syncStatusData || isOnReader) {
            return;
        }

        const { state, errorMessage } = syncStatusData.syncStatusChanged;

        const MIN_TOAST_MS = 800;
        const timer = setTimeout(() => {
            closeSnackbar(SYNC_PROGRESS_TOAST_KEY);

            if (state === SyncState.Success) {
                makeToast(t`Sync completed successfully`, 'success');
            } else if (state === SyncState.Error) {
                makeToast(t`Sync failed`, 'error', errorMessage ?? undefined);
            }
        }, MIN_TOAST_MS);

        return () => clearTimeout(timer);
    }, [syncStatusData, isOnReader, t]);

    const triggerSync = (source: string) => {
        if (!isOnReader) {
            makeToast(t`Syncing library...`, {
                variant: 'info',
                persist: true,
                key: SYNC_PROGRESS_TOAST_KEY,
                action: (
                    <CircularProgress size={20} thickness={4} sx={{ color: 'warning.main', mr: 1, flexShrink: 0 }} />
                ),
            });
        }

        requestManager.startSync().response.catch(defaultPromiseErrorHandler(`SyncTriggerHandler::${source}`));
    };

    useEffect(() => {
        if (!syncYomiEnabled || !syncOnWebUIStart) {
            return;
        }

        triggerSync('syncOnWebUIStart');
    }, [syncYomiEnabled, syncOnWebUIStart]);

    useEffect(() => {
        if (!syncYomiEnabled || !syncOnWebUIResume) {
            return undefined;
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            triggerSync('syncOnWebUIResume');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [syncYomiEnabled, syncOnWebUIResume]);

    return null;
};
