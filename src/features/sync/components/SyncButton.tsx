/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { StartSyncResult, SyncState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { SYNC_START_RESULT_TRANSLATION, SYNC_STATE_TRANSLATION } from '@/features/settings/Settings.constants.ts';

export function SyncButton() {
    const { t } = useLingui();

    const { data: settingsData } = requestManager.useGetServerSettings();
    const { data: syncStatusData } = requestManager.useGetSyncStatus();

    const syncState = syncStatusData?.lastSyncStatus?.state;
    const isSyncing = !!syncState && ![SyncState.Success, SyncState.Error].includes(syncState);

    if (!settingsData?.settings.syncYomiEnabled) {
        return null;
    }

    const startSync = async () => {
        try {
            const response = await requestManager.startSync().response;
            const result = response.data?.startSync.result;
            if (result) {
                makeToast(
                    t(SYNC_START_RESULT_TRANSLATION[result]),
                    result === StartSyncResult.Success ? 'success' : 'warning',
                );
            }
        } catch (e) {
            makeToast(t`Could not start sync`, 'error', getErrorMessage(e));
        }
    };

    return (
        <CustomTooltip title={isSyncing ? t(SYNC_STATE_TRANSLATION[syncState]) : t`Sync now`}>
            <IconButton onClick={startSync} disabled={isSyncing} color="inherit">
                {isSyncing ? <CircularProgress size={24} color="inherit" /> : <CloudSyncIcon />}
            </IconButton>
        </CustomTooltip>
    );
}
