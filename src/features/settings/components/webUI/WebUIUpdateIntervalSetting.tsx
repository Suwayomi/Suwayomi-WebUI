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
import { makeToast } from '@/base/utils/Toast.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { WEB_UI_UPDATE_INTERVAL } from '@/features/settings/Settings.constants.ts';

export const WebUIUpdateIntervalSetting = ({
    disabled = false,
    updateCheckInterval,
}: {
    disabled?: boolean;
    updateCheckInterval: ServerSettings['webUIUpdateCheckInterval'];
}) => {
    const { t } = useLingui();

    const shouldAutoUpdate = !!updateCheckInterval;
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const [currentUpdateCheckInterval, persistUpdateCheckInterval] = usePersistedValue(
        'lastUpdateCheckInterval',
        WEB_UI_UPDATE_INTERVAL.default,
        updateCheckInterval,
        getPersistedServerSetting,
    );

    const updateSetting = useCallback(
        (webUIUpdateCheckInterval: number) => {
            persistUpdateCheckInterval(
                webUIUpdateCheckInterval === 0 ? currentUpdateCheckInterval : webUIUpdateCheckInterval,
            );
            mutateSettings({ variables: { input: { settings: { webUIUpdateCheckInterval } } } }).catch((e) =>
                makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
            );
        },
        [currentUpdateCheckInterval],
    );

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? currentUpdateCheckInterval : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t`Automatically download the latest version`} />
                <Switch
                    disabled={disabled}
                    edge="end"
                    checked={shouldAutoUpdate}
                    onChange={(e) => setDoAutoUpdates(e.target.checked)}
                />
            </ListItem>
            <NumberSetting
                settingTitle={t`Update interval`}
                settingValue={`${currentUpdateCheckInterval}${t`h`}`}
                value={currentUpdateCheckInterval}
                minValue={WEB_UI_UPDATE_INTERVAL.min}
                maxValue={WEB_UI_UPDATE_INTERVAL.max}
                defaultValue={WEB_UI_UPDATE_INTERVAL.default}
                showSlider
                valueUnit={t`h`}
                handleUpdate={updateSetting}
                disabled={disabled || !shouldAutoUpdate}
            />
        </List>
    );
};
