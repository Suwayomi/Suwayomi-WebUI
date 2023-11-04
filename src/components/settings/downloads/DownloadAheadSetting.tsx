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

const DEFAULT_LIMIT = 5;
const MIN_LIMIT = 2;
const MAX_LIMIT = 10;

export const DownloadAheadSetting = () => {
    const { t } = useTranslation();

    const { data } = requestManager.useGetServerSettings();
    const downloadAheadLimit = data?.settings.autoDownloadAheadLimit ?? 0;
    const shouldDownloadAhead = !!downloadAheadLimit;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = useCallback((autoDownloadAheadLimit: number) => {
        mutateSettings({ variables: { input: { settings: { autoDownloadAheadLimit } } } });
    }, []);

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? DEFAULT_LIMIT : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('download.settings.download_ahead.label.while_reading')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={shouldDownloadAhead}
                        onChange={(e) => setDoAutoUpdates(e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            {shouldDownloadAhead ? (
                <NumberSetting
                    settingTitle={t('download.settings.download_ahead.label.unread_chapters_to_download')}
                    settingValue={t('download.settings.download_ahead.label.value', {
                        chapters: downloadAheadLimit,
                        count: downloadAheadLimit,
                    })}
                    value={downloadAheadLimit}
                    minValue={MIN_LIMIT}
                    maxValue={MAX_LIMIT}
                    defaultValue={DEFAULT_LIMIT}
                    showSlider
                    dialogTitle={t('download.settings.download_ahead.label.unread_chapters_to_download')}
                    valueUnit={t('chapter.title')}
                    handleUpdate={updateSetting}
                />
            ) : null}
        </List>
    );
};
