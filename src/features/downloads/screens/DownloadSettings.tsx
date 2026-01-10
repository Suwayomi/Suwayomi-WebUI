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
import ListSubheader from '@mui/material/ListSubheader';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloadAheadSetting } from '@/features/downloads/components/DownloadAheadSetting.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { DeleteChaptersWhileReadingSetting } from '@/features/downloads/components/DeleteChaptersWhileReadingSetting.tsx';
import { CategoriesInclusionSetting } from '@/features/category/components/CategoriesInclusionSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_SETTINGS } from '@/lib/graphql/category/CategoryQuery.ts';
import { MetadataDownloadSettings } from '@/features/downloads/Downloads.types.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

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

export const DownloadSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Downloads`);

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
                message={t`Unable to load data`}
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

    const downloadSettings = serverSettings.data!.settings;

    const updateSetting = <Setting extends keyof DownloadSettingsType>(
        setting: Setting,
        value: DownloadSettingsType[Setting],
    ): Promise<any> => {
        const mutation = mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
        mutation.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));

        return mutation;
    };

    const updateMetadataSetting = createUpdateMetadataServerSettings<keyof MetadataDownloadSettings>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    return (
        <List sx={{ pt: 0 }}>
            <TextSetting
                settingName={t`Download location`}
                dialogDescription={t`The path to the directory on the server where downloaded files should get saved in`}
                value={downloadSettings?.downloadsPath}
                settingDescription={
                    downloadSettings?.downloadsPath.length ? downloadSettings.downloadsPath : t`Default`
                }
                handleChange={(path) => updateSetting('downloadsPath', path)}
            />
            <ListItem>
                <ListItemText primary={t`Save as CBZ archive`} />
                <Switch
                    edge="end"
                    checked={!!downloadSettings?.downloadAsCbz}
                    onChange={(e) => updateSetting('downloadAsCbz', e.target.checked)}
                />
            </ListItem>
            <ListItemLink to={AppRoutes.settings.childRoutes.images.childRoutes.processingDownloads.path}>
                <ListItemText primary={t`Image download processing`} />
            </ListItemLink>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-auto-delete-downloads">
                        {t`Delete chapters`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Delete chapter after manually marking it as read`} />
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
                    <ListItemText primary={t`Allow deleting bookmarked chapters`} />
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
                        {t`Auto-download`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Download new chapters`} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.autoDownloadNewChapters}
                        onChange={(e) => updateSetting('autoDownloadNewChapters', e.target.checked)}
                    />
                </ListItem>
                <NumberSetting
                    disabled={!downloadSettings?.autoDownloadNewChapters}
                    settingTitle={t`Chapter download limit`}
                    dialogDescription={t`Limit the amount of new chapters that are going to get downloaded.`}
                    value={downloadSettings?.autoDownloadNewChaptersLimit ?? 0}
                    settingValue={
                        !downloadSettings.autoDownloadNewChaptersLimit
                            ? t`None`
                            : plural(downloadSettings.autoDownloadNewChaptersLimit, {
                                  one: '# Chapter',
                                  other: '# Chapters',
                              })
                    }
                    defaultValue={0}
                    minValue={0}
                    maxValue={20}
                    showSlider
                    valueUnit={t`Chapter`}
                    handleUpdate={(autoDownloadNewChaptersLimit) =>
                        updateSetting('autoDownloadNewChaptersLimit', autoDownloadNewChaptersLimit)
                    }
                />
                <ListItem>
                    <ListItemText primary={t`Ignore automatic chapter downloads for entries with unread chapters`} />
                    <Switch
                        edge="end"
                        checked={!!downloadSettings?.excludeEntryWithUnreadChapters}
                        onChange={(e) => updateSetting('excludeEntryWithUnreadChapters', e.target.checked)}
                        disabled={!downloadSettings?.autoDownloadNewChapters}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Ignore re-uploaded chapters`} />
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
                    dialogText={t`Entries in excluded categories will not be downloaded even if they are also in included categories`}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="download-settings-download-ahead">
                        {t`Download ahead`}
                    </ListSubheader>
                }
            >
                <DownloadAheadSetting downloadAheadLimit={metadataSettings.downloadAheadLimit} />
            </List>
        </List>
    );
};
