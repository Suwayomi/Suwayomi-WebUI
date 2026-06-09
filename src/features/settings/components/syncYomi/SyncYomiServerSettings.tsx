/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react/macro';
import { closeSnackbar } from 'notistack';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { StartSyncResult } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { ServerSettings as ServerSettingsType, ServerSettings } from '@/features/settings/Settings.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { SYNC_PROGRESS_TOAST_KEY } from '@/features/settings/components/syncYomi/SyncTriggerHandler.tsx';

const SYNC_INTERVAL_VALUES: [string, { text: string }][] = [
    ['PT0S', { text: 'Disabled' }],
    ['PT15M', { text: '15 minutes' }],
    ['PT30M', { text: '30 minutes' }],
    ['PT1H', { text: '1 hour' }],
    ['PT2H', { text: '2 hours' }],
    ['PT6H', { text: '6 hours' }],
    ['PT12H', { text: '12 hours' }],
    ['PT24H', { text: '24 hours' }],
];

const normalizeSyncInterval = (value: string): string => {
    const knownValues = SYNC_INTERVAL_VALUES.map(([v]) => v);
    return knownValues.includes(value) ? value : 'PT0S';
};

export const SyncYomiServerSettings = ({
    settings,
    updateSetting,
}: {
    settings: ServerSettings;
    updateSetting: <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
        onCompletion?: (success: boolean) => void,
    ) => Promise<void>;
}) => {
    const { t } = useLingui();
    const [isSyncing, setIsSyncing] = useState(false);

    const {
        syncYomiEnabled,
        syncYomiHost,
        syncYomiApiKey,
        syncDataManga,
        syncDataChapters,
        syncDataTracking,
        syncDataHistory,
        syncDataCategories,
        syncInterval,
    } = settings;

    const handleSyncNow = async () => {
        setIsSyncing(true);
        try {
            makeToast(t`Syncing library...`, {
                variant: 'info',
                persist: true,
                key: SYNC_PROGRESS_TOAST_KEY,
                action: (
                    <CircularProgress size={20} thickness={4} sx={{ color: 'warning.main', mr: 1, flexShrink: 0 }} />
                ),
            });
            const { data } = await requestManager.startSync().response;
            const result = data?.startSync.result;
            if (result === StartSyncResult.SyncInProgress) {
                closeSnackbar(SYNC_PROGRESS_TOAST_KEY);
                makeToast(t`Sync is already in progress`, 'info');
            } else if (result === StartSyncResult.SyncDisabled) {
                closeSnackbar(SYNC_PROGRESS_TOAST_KEY);
                makeToast(t`SyncYomi is disabled`, 'warning');
            }
        } catch (e) {
            closeSnackbar(SYNC_PROGRESS_TOAST_KEY);
            makeToast(t`Failed to start sync`, 'error', getErrorMessage(e));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <List
            subheader={
                <ListSubheader component="div" id="syncyomi-server-settings">
                    {t`SyncYomi`}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText primary={t`Enable SyncYomi`} />
                <Switch
                    edge="end"
                    checked={syncYomiEnabled}
                    onChange={(e) => updateSetting('syncYomiEnabled', e.target.checked)}
                />
            </ListItem>
            <TextSetting
                settingName={t`Server address`}
                value={syncYomiHost}
                handleChange={(host) => updateSetting('syncYomiHost', host)}
                disabled={!syncYomiEnabled}
            />
            <TextSetting
                settingName={t`API key`}
                value={syncYomiApiKey}
                handleChange={(apiKey) => updateSetting('syncYomiApiKey', apiKey)}
                isPassword
                disabled={!syncYomiEnabled}
            />
            <ListItemButton onClick={handleSyncNow} disabled={!syncYomiEnabled || isSyncing}>
                <ListItemText primary={t`Sync now`} />
                {isSyncing && <CircularProgress size={24} />}
            </ListItemButton>
            <SelectSetting<string>
                settingName={t`Auto-sync interval`}
                value={normalizeSyncInterval(syncInterval)}
                values={SYNC_INTERVAL_VALUES}
                handleChange={(value) => updateSetting('syncInterval', value)}
                disabled={!syncYomiEnabled}
            />
            <ListItem>
                <ListItemText primary={t`Manga`} />
                <Switch
                    edge="end"
                    checked={syncDataManga}
                    onChange={(e) => updateSetting('syncDataManga', e.target.checked)}
                    disabled={!syncYomiEnabled}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t`Chapters`} secondary={t`Reading progress and bookmarks`} />
                <Switch
                    edge="end"
                    checked={syncDataChapters}
                    onChange={(e) => updateSetting('syncDataChapters', e.target.checked)}
                    disabled={!syncYomiEnabled}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t`Tracking`} />
                <Switch
                    edge="end"
                    checked={syncDataTracking}
                    onChange={(e) => updateSetting('syncDataTracking', e.target.checked)}
                    disabled={!syncYomiEnabled}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t`History`} />
                <Switch
                    edge="end"
                    checked={syncDataHistory}
                    onChange={(e) => updateSetting('syncDataHistory', e.target.checked)}
                    disabled={!syncYomiEnabled}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t`Categories`} />
                <Switch
                    edge="end"
                    checked={syncDataCategories}
                    onChange={(e) => updateSetting('syncDataCategories', e.target.checked)}
                    disabled={!syncYomiEnabled}
                />
            </ListItem>
            <ListItemLink to={AppRoutes.settings.children.syncyomi.children.triggers.path}>
                <ListItemText
                    primary={t`Sync triggers`}
                    secondary={t`Define when synchronization is triggered automatically`}
                />
            </ListItemLink>
        </List>
    );
};
