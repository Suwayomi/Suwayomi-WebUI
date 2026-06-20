/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { StartSyncResult } from '@/lib/graphql/generated/graphql-base.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import type { ServerSettings as ServerSettingsType } from '@/features/settings/Settings.types.ts';

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

export const SyncYomiSettings = () => {
    const { t } = useLingui();
    const [isSyncing, setIsSyncing] = useState(false);

    useAppTitle(t`SyncYomi`);

    const { data, loading, error, refetch } = requestManager.useGetServerSettings();
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = async <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
    ) => {
        try {
            await mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
        } catch (e) {
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e));
        }
    };

    const handleSyncNow = async () => {
        setIsSyncing(true);
        try {
            const { data: syncData } = await requestManager.startSync().response;
            const result = syncData?.startSync.result;
            if (result === StartSyncResult.Success) {
                makeToast(t`Sync started successfully`, 'success');
            } else if (result === StartSyncResult.SyncInProgress) {
                makeToast(t`Sync is already in progress`, 'info');
            } else if (result === StartSyncResult.SyncDisabled) {
                makeToast(t`SyncYomi is disabled`, 'warning');
            }
        } catch (e) {
            makeToast(t`Failed to start sync`, 'error', getErrorMessage(e));
        } finally {
            setIsSyncing(false);
        }
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SyncYomiSettings::refetch'))}
            />
        );
    }

    const {settings} = data!;

    return (
        <List sx={{ pt: 0 }}>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-connection">
                        {t`Connection`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`Enable SyncYomi`}
                        secondary={t`Sync your library with other devices via SyncYomi`}
                    />
                    <Switch
                        edge="end"
                        checked={settings.syncYomiEnabled}
                        onChange={(e) => updateSetting('syncYomiEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t`Server address`}
                    dialogDescription={t`SyncYomi server URL (e.g., https://sync.example.com)`}
                    value={settings.syncYomiHost}
                    handleChange={(host) => updateSetting('syncYomiHost', host)}
                    disabled={!settings.syncYomiEnabled}
                />
                <TextSetting
                    settingName={t`API key`}
                    dialogDescription={t`API key generated on the SyncYomi server`}
                    value={settings.syncYomiApiKey}
                    handleChange={(apiKey) => updateSetting('syncYomiApiKey', apiKey)}
                    isPassword
                    disabled={!settings.syncYomiEnabled}
                />
                <ListItemButton onClick={handleSyncNow} disabled={!settings.syncYomiEnabled || isSyncing}>
                    <ListItemText primary={t`Sync now`} secondary={t`Start a manual sync with the server`} />
                    {isSyncing && <CircularProgress size={24} />}
                </ListItemButton>
                <SelectSetting<string>
                    settingName={t`Auto-sync interval`}
                    value={normalizeSyncInterval(settings.syncInterval)}
                    values={SYNC_INTERVAL_VALUES}
                    handleChange={(value) => updateSetting('syncInterval', value)}
                    disabled={!settings.syncYomiEnabled}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-data">
                        {t`Synced data`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Manga`} />
                    <Switch
                        edge="end"
                        checked={settings.syncDataManga}
                        onChange={(e) => updateSetting('syncDataManga', e.target.checked)}
                        disabled={!settings.syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Chapters`} secondary={t`Reading progress and bookmarks`} />
                    <Switch
                        edge="end"
                        checked={settings.syncDataChapters}
                        onChange={(e) => updateSetting('syncDataChapters', e.target.checked)}
                        disabled={!settings.syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Tracking`} />
                    <Switch
                        edge="end"
                        checked={settings.syncDataTracking}
                        onChange={(e) => updateSetting('syncDataTracking', e.target.checked)}
                        disabled={!settings.syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`History`} />
                    <Switch
                        edge="end"
                        checked={settings.syncDataHistory}
                        onChange={(e) => updateSetting('syncDataHistory', e.target.checked)}
                        disabled={!settings.syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Categories`} />
                    <Switch
                        edge="end"
                        checked={settings.syncDataCategories}
                        onChange={(e) => updateSetting('syncDataCategories', e.target.checked)}
                        disabled={!settings.syncYomiEnabled}
                    />
                </ListItem>
            </List>
            <List>
                <ListItemLink to={AppRoutes.settings.children.syncyomi.children.triggers.path}>
                    <ListItemText
                        primary={t`Sync triggers`}
                        secondary={t`Define when synchronization is triggered automatically`}
                    />
                </ListItemLink>
            </List>
        </List>
    );
};
