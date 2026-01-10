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
import Switch from '@mui/material/Switch';
import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { getPersistedServerSetting, usePersistedValue } from '@/base/hooks/usePersistedValue.tsx';
import { ServerSettings } from '@/features/settings/Settings.types.ts';

import { GLOBAL_UPDATE_INTERVAL } from '@/features/settings/Settings.constants.ts';

export const GlobalUpdateSettingsInterval = ({
    globalUpdateInterval,
}: {
    globalUpdateInterval: ServerSettings['globalUpdateInterval'];
}) => {
    const { t } = useLingui();

    const autoUpdateIntervalHours = globalUpdateInterval;
    const doAutoUpdates = !!autoUpdateIntervalHours;
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const [currentAutoUpdateIntervalHours, persistAutoUpdateIntervalHours] = usePersistedValue(
        'lastGlobalUpdateInterval',
        GLOBAL_UPDATE_INTERVAL.default,
        autoUpdateIntervalHours,
        getPersistedServerSetting,
    );

    const updateSetting = useCallback(
        (newGlobalUpdateInterval: number) => {
            persistAutoUpdateIntervalHours(
                newGlobalUpdateInterval === 0 ? currentAutoUpdateIntervalHours : newGlobalUpdateInterval,
            );
            mutateSettings({ variables: { input: { settings: { globalUpdateInterval: newGlobalUpdateInterval } } } });
        },
        [currentAutoUpdateIntervalHours],
    );

    const setDoAutoUpdates = (enable: boolean) => {
        const newGlobalUpdateInterval = enable ? currentAutoUpdateIntervalHours : 0;
        updateSetting(newGlobalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t`Automatic updates`} />
                <Switch edge="end" checked={doAutoUpdates} onChange={(e) => setDoAutoUpdates(e.target.checked)} />
            </ListItem>
            <NumberSetting
                settingTitle={t`Automatic update interval`}
                settingValue={t`${currentAutoUpdateIntervalHours}h`}
                value={currentAutoUpdateIntervalHours}
                minValue={GLOBAL_UPDATE_INTERVAL.min}
                maxValue={GLOBAL_UPDATE_INTERVAL.max}
                defaultValue={GLOBAL_UPDATE_INTERVAL.default}
                showSlider
                valueUnit={t`h`}
                handleUpdate={updateSetting}
                disabled={!doAutoUpdates}
            />
        </List>
    );
};
