/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { List, ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useCallback } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';

const DEFAULT_INTERVAL_HOURS = 12;
const MIN_INTERVAL_HOURS = 6;
const MAX_INTERVAL_HOURS = 24 * 7 * 4; // 1 month

export const GlobalUpdateSettingsInterval = () => {
    const { t } = useTranslation();

    const { data } = requestManager.useGetServerSettings();
    const autoUpdateIntervalHours = data?.settings.globalUpdateInterval;
    const doAutoUpdates = !!autoUpdateIntervalHours;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = useCallback((globalUpdateInterval: number) => {
        mutateSettings({ variables: { input: { settings: { globalUpdateInterval } } } });
    }, []);

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? DEFAULT_INTERVAL_HOURS : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('library.settings.global_update.auto_update.label.title')} />
                <ListItemSecondaryAction>
                    <Switch edge="end" checked={doAutoUpdates} onChange={(e) => setDoAutoUpdates(e.target.checked)} />
                </ListItemSecondaryAction>
            </ListItem>
            <NumberSetting
                settingTitle={t('library.settings.global_update.auto_update.interval.label.title')}
                settingValue={
                    autoUpdateIntervalHours !== undefined
                        ? t('library.settings.global_update.auto_update.interval.label.value', {
                              hours: autoUpdateIntervalHours,
                          })
                        : undefined
                }
                value={autoUpdateIntervalHours ?? DEFAULT_INTERVAL_HOURS}
                minValue={MIN_INTERVAL_HOURS}
                maxValue={MAX_INTERVAL_HOURS}
                defaultValue={DEFAULT_INTERVAL_HOURS}
                showSlider
                dialogTitle={t('library.settings.global_update.auto_update.interval.label.title')}
                valueUnit={t('global.time.hour_short')}
                handleUpdate={updateSetting}
                disabled={!doAutoUpdates}
            />
        </List>
    );
};
