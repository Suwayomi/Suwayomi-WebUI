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
import ListSubheader from '@mui/material/ListSubheader';
import { TextSetting } from '@/modules/core/components/settings/text/TextSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloadAheadSetting } from '@/modules/downloads/components/DownloadAheadSetting.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { DeleteChaptersWhileReadingSetting } from '@/modules/downloads/components/DeleteChaptersWhileReadingSetting.tsx';
import { CategoriesInclusionSetting } from '@/modules/category/components/CategoriesInclusionSetting.tsx';
import { NumberSetting } from '@/modules/core/components/settings/NumberSetting.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_SETTINGS } from '@/lib/graphql/queries/CategoryQuery.ts';
import { MetadataDownloadSettings } from '@/modules/downloads/Downloads.types.ts';
import { ServerSettings } from '@/modules/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';
import { DownloadConversionSetting } from '@/modules/downloads/components/DownloadConversionSetting.tsx';

type DownloadSettingsType = Pick<
    ServerSettings,
    | 'downloadAsCbz'
    | 'downloadsPath'
    | 'autoDownloadNewChapters'
    | 'autoDownloadNewChaptersLimit'
    | 'excludeEntryWithUnreadChapters'
    | 'autoDownloadIgnoreReUploads'
    | 'downloadConversions'
>;

const extractDownloadSettings = (settings: ServerSettings): DownloadSettingsType => ({
    downloadAsCbz: settings.downloadAsCbz,
    downloadsPath: settings.downloadsPath,
    autoDownloadNewChapters: settings.autoDownloadNewChapters,
    autoDownloadNewChaptersLimit: settings.autoDownloadNewChaptersLimit,
    excludeEntryWithUnreadChapters: settings.excludeEntryWithUnreadChapters,
    autoDownloadIgnoreReUploads: settings.autoDownloadIgnoreReUploads,
    downloadConversions: settings.downloadConversions,
});

export const DownloadSettings = () => {
    const { t } = useTranslation();

    useAppTitle(t('download.title.download'));

    const categories = requestManager.useGetCategories<GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables>(
        GET_CATEGORIES_SETTINGS,
    );
    const serverSettings = requestManager.useGetServerSettings({ notifyOnNetworkStatusChange: true });
    const [mutateSettings] = requestManager.useUpdateServerSettings();
    const {
        settings: metadataSettings,
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchMetadataServerSettings },
    } = useMetadataServerSettings();

    const loading = serverSettings.loading || areMetadataServerSettingsLoading || categories.loading;
    if (loading) {
        return <LoadingPlaceholder />;
    }

    const error = serverSettings.error ?? metadataServerSettingsError ?? categories.error;
    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (serverSettings.error) {
                        serverSettings
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DownloadSettings::refetchServerSettings'));
                    }

                    if (metadataServerSettingsError) {
                        refetchMetadataServerSettings().catch(
                            defaultPromiseErrorHandler('refetchMetadataServerSettings::'),
                        );
                    }

                    if (categories.error) {
                        categories.refetch().catch(defaultPromiseErrorHandler('LibrarySettings::refetchCategories'));
                    }
                }}
            />
        );
    }

    const downloadSettings = extractDownloadSettings(serverSettings.data!.settings);

    const updateSetting = <Setting extends keyof DownloadSettingsType>(
        setting: Setting,
        value: DownloadSettingsType[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
        );
    };

    const updateMetadataSetting = createUpdateMetadataServerSettings<keyof MetadataDownloadSettings>((e) =>
        makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
    );

    return (
        <List sx={{ pt: 0 }}>
            <TextSetting
                settingName={t('download.settings.download_path.label.title')}
                dialogDescription={t('download.settings.download_path.label.description')}
                value={downloadSettings?.downloadsPath}
                settingDescription={
                    downloadSettings?.downloadsPath.length ? downloadSettings.downloadsPath : t('global.label.default')
                }
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
            <DownloadConversionSetting
                conversions={downloadSettings?.downloadConversions}
                updateSetting={(conversions) => updateSetting('downloadConversions', conversions)}
            />
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
                        !downloadSettings.autoDownloadNewChaptersLimit
                            ? t('global.label.none')
                            : t('download.settings.download_ahead.label.value', {
                                  chapters: downloadSettings.autoDownloadNewChaptersLimit,
                                  count: downloadSettings.autoDownloadNewChaptersLimit,
                              })
                    }
                    defaultValue={0}
                    minValue={0}
                    maxValue={20}
                    showSlider
                    valueUnit={t('chapter.title_one')}
                    handleUpdate={(autoDownloadNewChaptersLimit) =>
                        updateSetting('autoDownloadNewChaptersLimit', autoDownloadNewChaptersLimit)
                    }
                />
                <ListItem>
                    <ListItemText primary={t('download.settings.auto_download.label.ignore_with_unread_chapters')} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.excludeEntryWithUnreadChapters}
                        onChange={(e) => updateSetting('excludeEntryWithUnreadChapters', e.target.checked)}
                        disabled={!downloadSettings?.autoDownloadNewChapters}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t('download.settings.auto_download.label.ignore_re_uploads')} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.autoDownloadIgnoreReUploads}
                        onChange={(e) => updateSetting('autoDownloadIgnoreReUploads', e.target.checked)}
                        disabled={!downloadSettings?.autoDownloadNewChapters}
                    />
                </ListItem>
                <CategoriesInclusionSetting
                    categories={categories.data!.categories.nodes}
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
                <DownloadAheadSetting downloadAheadLimit={metadataSettings.downloadAheadLimit} />
            </List>
        </List>
    );
};
