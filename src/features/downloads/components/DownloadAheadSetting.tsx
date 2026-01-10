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
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { getPersistedServerSetting, usePersistedValue } from '@/base/hooks/usePersistedValue.tsx';
import { updateMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MetadataDownloadSettings } from '@/features/downloads/Downloads.types.ts';
import { MetadataServerSettings } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { DOWNLOAD_AHEAD } from '@/features/downloads/Downloads.constants.ts';

export const DownloadAheadSetting = ({
    downloadAheadLimit,
}: {
    downloadAheadLimit: MetadataServerSettings['downloadAheadLimit'];
}) => {
    const { t } = useLingui();

    const shouldDownloadAhead = !!downloadAheadLimit;
    const [currentDownloadAheadLimit, persistDownloadAheadLimit] = usePersistedValue(
        'lastDownloadAheadLimit',
        DOWNLOAD_AHEAD.default,
        downloadAheadLimit,
        getPersistedServerSetting,
    );

    const updateSetting = (value: MetadataDownloadSettings['downloadAheadLimit']) => {
        persistDownloadAheadLimit(value === 0 ? currentDownloadAheadLimit : value);
        updateMetadataServerSettings('downloadAheadLimit', value).catch((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
    };

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? currentDownloadAheadLimit : 0;
        updateSetting(globalUpdateInterval);
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary={t`Auto download while reading`} />
                <Switch edge="end" checked={shouldDownloadAhead} onChange={(e) => setDoAutoUpdates(e.target.checked)} />
            </ListItem>
            <NumberSetting
                settingTitle={t`Number of unread chapters to download`}
                settingValue={plural(currentDownloadAheadLimit, {
                    one: '# Chapter',
                    other: '# Chapters',
                })}
                value={currentDownloadAheadLimit}
                minValue={DOWNLOAD_AHEAD.min}
                maxValue={DOWNLOAD_AHEAD.max}
                defaultValue={DOWNLOAD_AHEAD.default}
                stepSize={DOWNLOAD_AHEAD.step}
                showSlider
                dialogDescription={t`How many chapters should get downloaded while reading.`}
                dialogDisclaimer={t`Only works if the current chapter plus the next chapter are already downloaded.`}
                valueUnit={t`Chapter`}
                handleUpdate={updateSetting}
                disabled={!shouldDownloadAhead}
            />
        </List>
    );
};
