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
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import type { ServerSettings as ServerSettingsType } from '@/features/settings/Settings.types.ts';

export const SyncYomiTriggerSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Sync triggers`);

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

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SyncYomiTriggerSettings::refetch'))}
            />
        );
    }

    const {settings} = data!;
    const disabled = !settings.syncYomiEnabled;

    return (
        <List sx={{ pt: 0 }}>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-triggers">
                        {t`Sync triggers`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`On chapter read`}
                        secondary={t`Triggers sync when a chapter is marked as read`}
                    />
                    <Switch
                        edge="end"
                        checked={settings.syncOnChapterRead}
                        onChange={(e) => updateSetting('syncOnChapterRead', e.target.checked)}
                        disabled={disabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`On chapter open`}
                        secondary={t`Triggers sync when a chapter is opened for reading`}
                    />
                    <Switch
                        edge="end"
                        checked={settings.syncOnChapterOpen}
                        onChange={(e) => updateSetting('syncOnChapterOpen', e.target.checked)}
                        disabled={disabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`On client start`}
                        secondary={t`Triggers sync when the client interface is loaded`}
                    />
                    <Switch
                        edge="end"
                        checked={settings.syncOnWebUIStart}
                        onChange={(e) => updateSetting('syncOnWebUIStart', e.target.checked)}
                        disabled={disabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`On client resume`}
                        secondary={t`Triggers sync when the client interface regains focus`}
                    />
                    <Switch
                        edge="end"
                        checked={settings.syncOnWebUIResume}
                        onChange={(e) => updateSetting('syncOnWebUIResume', e.target.checked)}
                        disabled={disabled}
                    />
                </ListItem>
            </List>
        </List>
    );
};
