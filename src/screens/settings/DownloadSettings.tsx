/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import { ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListSubheader from '@mui/material/ListSubheader';
import { TextSetting } from '@/components/settings/TextSetting.tsx';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { ServerSettings } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloadAheadSetting } from '@/components/settings/downloads/DownloadAheadSetting.tsx';

type DownloadSettingsType = Pick<
    ServerSettings,
    | 'downloadAsCbz'
    | 'downloadsPath'
    | 'autoDownloadNewChapters'
    | 'autoDownloadAheadLimit'
    | 'excludeEntryWithUnreadChapters'
>;

const extractDownloadSettings = (settings: ServerSettings): DownloadSettingsType => ({
    downloadAsCbz: settings.downloadAsCbz,
    downloadsPath: settings.downloadsPath,
    autoDownloadNewChapters: settings.autoDownloadNewChapters,
    autoDownloadAheadLimit: settings.autoDownloadAheadLimit,
    excludeEntryWithUnreadChapters: settings.excludeEntryWithUnreadChapters,
});

export const DownloadSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('download.settings.title'));
        setAction(null);
    }, [t]);

    const { data } = requestManager.useGetServerSettings();
    const downloadSettings = data ? extractDownloadSettings(data.settings) : undefined;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = <Setting extends keyof DownloadSettingsType>(
        setting: Setting,
        value: DownloadSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
    };

    return (
        <List>
            <TextSetting
                settingName={t('download.settings.download_path.label.title')}
                dialogDescription={t('download.settings.download_path.label.description')}
                value={downloadSettings?.downloadsPath}
                handleChange={(path) => updateSetting('downloadsPath', path)}
            />
            <ListItem>
                <ListItemText primary={t('download.settings.file_type.label.cbz')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.downloadAsCbz}
                        onChange={(e) => updateSetting('downloadAsCbz', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-auto-download">
                        {t('download.settings.auto_download.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('download.settings.auto_download.label.new_chapters')} />
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            checked={!!downloadSettings?.autoDownloadNewChapters}
                            onChange={(e) => updateSetting('autoDownloadNewChapters', e.target.checked)}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem disabled={!downloadSettings?.autoDownloadNewChapters}>
                    <ListItemText primary={t('download.settings.auto_download.label.ignore_with_unread_chapters')} />
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            checked={!!downloadSettings?.excludeEntryWithUnreadChapters}
                            onChange={(e) => updateSetting('excludeEntryWithUnreadChapters', e.target.checked)}
                            disabled={!downloadSettings?.autoDownloadNewChapters}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-download-ahead">
                        {t('download.settings.download_ahead.title')}
                    </ListSubheader>
                }
            >
                <DownloadAheadSetting />
            </List>
        </List>
    );
};
