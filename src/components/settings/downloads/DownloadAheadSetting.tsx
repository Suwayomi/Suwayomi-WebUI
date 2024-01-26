/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { List, ListItem, ListItemText, Switch } from '@mui/material';
import { useCallback } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { getPersistedServerSetting, usePersistedValue } from '@/util/usePersistedValue.tsx';

const MIN_LIMIT = 2;
const MAX_LIMIT = 10;
const DEFAULT_LIMIT = MIN_LIMIT;

export const DownloadAheadSetting = () => {
    const { t } = useTranslation();

    const { data } = requestManager.useGetServerSettings();
    const downloadAheadLimit = data?.settings.autoDownloadAheadLimit;
    const shouldDownloadAhead = !!downloadAheadLimit;
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const [currentDownloadAheadLimit, persistDownloadAheadLimit] = usePersistedValue(
        'lastDownloadAheadLimit',
        DEFAULT_LIMIT,
        downloadAheadLimit,
        getPersistedServerSetting,
    );

    const updateSetting = useCallback(
        (autoDownloadAheadLimit: number) => {
            persistDownloadAheadLimit(
                autoDownloadAheadLimit === 0 ? currentDownloadAheadLimit : autoDownloadAheadLimit,
            );
            mutateSettings({ variables: { input: { settings: { autoDownloadAheadLimit } } } });
        },
        [currentDownloadAheadLimit],
    );

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? currentDownloadAheadLimit : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('download.settings.download_ahead.label.while_reading')} />
                <Switch edge="end" checked={shouldDownloadAhead} onChange={(e) => setDoAutoUpdates(e.target.checked)} />
            </ListItem>
            <NumberSetting
                settingTitle={t('download.settings.download_ahead.label.unread_chapters_to_download')}
                settingValue={
                    downloadAheadLimit !== undefined
                        ? t('download.settings.download_ahead.label.value', {
                              chapters: currentDownloadAheadLimit,
                              count: currentDownloadAheadLimit,
                          })
                        : undefined
                }
                value={currentDownloadAheadLimit}
                minValue={MIN_LIMIT}
                maxValue={MAX_LIMIT}
                defaultValue={DEFAULT_LIMIT}
                showSlider
                dialogDescription={t('download.settings.download_ahead.label.description')}
                dialogDisclaimer={t('download.settings.download_ahead.label.disclaimer')}
                valueUnit={t('chapter.title')}
                handleUpdate={updateSetting}
                disabled={!shouldDownloadAhead}
            />
        </List>
    );
};
