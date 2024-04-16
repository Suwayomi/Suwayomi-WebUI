/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { useCallback } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { getPersistedServerSetting, usePersistedValue } from '@/util/usePersistedValue.tsx';

const DEFAULT_VALUE = 23;
const MIN_VALUE = 1;
const MAX_VALUE = 23; // 1 month

export const WebUIUpdateIntervalSetting = ({ disabled = false }: { disabled?: boolean }) => {
    const { t } = useTranslation();

    const { data } = requestManager.useGetServerSettings();
    const updateCheckInterval = data?.settings.webUIUpdateCheckInterval;
    const shouldAutoUpdate = !!updateCheckInterval;
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const [currentUpdateCheckInterval, persistUpdateCheckInterval] = usePersistedValue(
        'lastUpdateCheckInterval',
        DEFAULT_VALUE,
        updateCheckInterval,
        getPersistedServerSetting,
    );

    const updateSetting = useCallback(
        (webUIUpdateCheckInterval: number) => {
            persistUpdateCheckInterval(
                webUIUpdateCheckInterval === 0 ? currentUpdateCheckInterval : webUIUpdateCheckInterval,
            );
            mutateSettings({ variables: { input: { settings: { webUIUpdateCheckInterval } } } });
        },
        [currentUpdateCheckInterval],
    );

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? currentUpdateCheckInterval : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem disabled={disabled}>
                <ListItemText primary={t('settings.webui.auto_update.label.title')} />
                <Switch
                    disabled={disabled}
                    edge="end"
                    checked={shouldAutoUpdate}
                    onChange={(e) => setDoAutoUpdates(e.target.checked)}
                />
            </ListItem>
            <NumberSetting
                settingTitle={t('settings.webui.auto_update.label.interval')}
                settingValue={
                    updateCheckInterval !== undefined
                        ? t('library.settings.global_update.auto_update.interval.label.value', {
                              hours: currentUpdateCheckInterval,
                          })
                        : undefined
                }
                value={currentUpdateCheckInterval}
                minValue={MIN_VALUE}
                maxValue={MAX_VALUE}
                defaultValue={DEFAULT_VALUE}
                showSlider
                valueUnit={t('global.time.hour_short')}
                handleUpdate={updateSetting}
                disabled={disabled || !shouldAutoUpdate}
            />
        </List>
    );
};
