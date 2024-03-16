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
import ListSubheader from '@mui/material/ListSubheader';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { MetadataServerSettingKeys, MetadataServerSettings, ServerSettings } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloadAheadSetting } from '@/components/settings/downloads/DownloadAheadSetting.tsx';
import { convertSettingsToMetadata, useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { requestUpdateServerMetadata } from '@/util/metadata.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { DeleteChaptersWhileReadingSetting } from '@/components/settings/downloads/DeleteChaptersWhileReadingSetting.tsx';
import { CategoriesInclusionSetting } from '@/components/settings/CategoriesInclusionSetting.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';

type DownloadSettingsType = Pick<
    ServerSettings,
    | 'downloadAsCbz'
    | 'downloadsPath'
    | 'autoDownloadNewChapters'
    | 'autoDownloadNewChaptersLimit'
    | 'excludeEntryWithUnreadChapters'
>;

const extractDownloadSettings = (settings: ServerSettings): DownloadSettingsType => ({
    downloadAsCbz: settings.downloadAsCbz,
    downloadsPath: settings.downloadsPath,
    autoDownloadNewChapters: settings.autoDownloadNewChapters,
    autoDownloadNewChaptersLimit: settings.autoDownloadNewChaptersLimit,
    excludeEntryWithUnreadChapters: settings.excludeEntryWithUnreadChapters,
});

export const DownloadSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('download.settings.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const { data } = requestManager.useGetServerSettings();
    const downloadSettings = data ? extractDownloadSettings(data.settings) : undefined;
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const { metadata, settings: metadataSettings } = useMetadataServerSettings();

    const updateSetting = <Setting extends keyof DownloadSettingsType>(
        setting: Setting,
        value: DownloadSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch(() =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
        );
    };

    const updateMetadataSetting = <Setting extends MetadataServerSettingKeys>(
        setting: Setting,
        value: MetadataServerSettings[Setting],
    ) => {
        if (!metadata) {
            return;
        }

        requestUpdateServerMetadata([[setting, convertSettingsToMetadata({ [setting]: value })[setting]]]).catch(() =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
        );
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
                <Switch
                    edge="end"
                    checked={!!downloadSettings?.downloadAsCbz}
                    onChange={(e) => updateSetting('downloadAsCbz', e.target.checked)}
                />
            </ListItem>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-auto-delete-downloads">
                        {t('download.settings.delete_chapters.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('download.settings.delete_chapters.label.manually_marked_as_read')} />
                    <Switch
                        edge="end"
                        checked={metadataSettings.deleteChaptersManuallyMarkedRead}
                        onChange={(e) => updateMetadataSetting('deleteChaptersManuallyMarkedRead', e.target.checked)}
                    />
                </ListItem>
                <DeleteChaptersWhileReadingSetting
                    chapterToDelete={metadataSettings.deleteChaptersWhileReading}
                    handleChange={(chapterToDelete) =>
                        updateMetadataSetting('deleteChaptersWhileReading', chapterToDelete)
                    }
                />
                <ListItem>
                    <ListItemText primary={t('download.settings.delete_chapters.label.allow_deletion_of_bookmarked')} />
                    <Switch
                        edge="end"
                        checked={metadataSettings.deleteChaptersWithBookmark}
                        onChange={(e) => updateMetadataSetting('deleteChaptersWithBookmark', e.target.checked)}
                    />
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-auto-download">
                        {t('download.settings.auto_download.title')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('download.settings.auto_download.label.new_chapters')} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.autoDownloadNewChapters}
                        onChange={(e) => updateSetting('autoDownloadNewChapters', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    disabled={!downloadSettings?.autoDownloadNewChapters}
                    settingTitle={t('download.settings.auto_download.download_limit.label.title')}
                    dialogDescription={t('download.settings.auto_download.download_limit.label.description')}
                    value={downloadSettings?.autoDownloadNewChaptersLimit ?? 0}
                    settingValue={
                        // eslint-disable-next-line no-nested-ternary
                        downloadSettings?.autoDownloadNewChaptersLimit !== undefined
                            ? !downloadSettings.autoDownloadNewChaptersLimit
                                ? t('global.label.none')
                                : t('download.settings.download_ahead.label.value', {
                                      chapters: downloadSettings.autoDownloadNewChaptersLimit,
                                      count: downloadSettings.autoDownloadNewChaptersLimit,
                                  })
                            : undefined
                    }
                    defaultValue={0}
                    minValue={0}
                    maxValue={20}
                    showSlider
                    valueUnit={t('chapter.title')}
                    handleUpdate={(autoDownloadNewChaptersLimit) =>
                        updateSetting('autoDownloadNewChaptersLimit', autoDownloadNewChaptersLimit)
                    }
                />
                <ListItem disabled={!downloadSettings?.autoDownloadNewChapters}>
                    <ListItemText primary={t('download.settings.auto_download.label.ignore_with_unread_chapters')} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.excludeEntryWithUnreadChapters}
                        onChange={(e) => updateSetting('excludeEntryWithUnreadChapters', e.target.checked)}
                        disabled={!downloadSettings?.autoDownloadNewChapters}
                    />
                </ListItem>
                <CategoriesInclusionSetting
                    includeField="includeInDownload"
                    dialogText={t('download.settings.auto_download.categories.label.include_in_download')}
                />
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
