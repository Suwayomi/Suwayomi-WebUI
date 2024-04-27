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
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { getPersistedServerSetting, usePersistedValue } from '@/util/usePersistedValue.tsx';
import { updateMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataDownloadSettings, MetadataServerSettings } from '@/typings.ts';
import { makeToast } from '@/components/util/Toast.tsx';

const MIN_LIMIT = 2;
const MAX_LIMIT = 10;
const DEFAULT_LIMIT = MIN_LIMIT;

export const DownloadAheadSetting = ({
    downloadAheadLimit,
}: {
    downloadAheadLimit: MetadataServerSettings['downloadAheadLimit'];
}) => {
    const { t } = useTranslation();

    const shouldDownloadAhead = !!downloadAheadLimit;
    const [currentDownloadAheadLimit, persistDownloadAheadLimit] = usePersistedValue(
        'lastDownloadAheadLimit',
        DEFAULT_LIMIT,
        downloadAheadLimit,
        getPersistedServerSetting,
    );

    const updateSetting = (value: MetadataDownloadSettings['downloadAheadLimit']) => {
        persistDownloadAheadLimit(value === 0 ? currentDownloadAheadLimit : value);
        updateMetadataServerSettings('downloadAheadLimit', value).catch(() =>
            makeToast(t('search.error.label.failed_to_save_settings'), 'warning'),
        );
    };

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
