/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    Metadata,
    MetadataServerSettingKeys,
    MetadataServerSettings,
    MetadataThemeSettings,
} from '@/typings.ts';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { convertFromGqlMeta, getMetadataFrom, requestUpdateServerMetadata } from '@/lib/metadata/metadata.ts';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { DEFAULT_DEVICE } from '@/util/device.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { DEFAULT_SORT_SETTINGS } from '@/modules/migration/Migration.constants.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';

export const getDefaultSettings = (): MetadataServerSettings => ({
    // downloads
    deleteChaptersManuallyMarkedRead: false,
    deleteChaptersWhileReading: 0,
    deleteChaptersWithBookmark: false,
    downloadAheadLimit: 0,

    // library
    showAddToLibraryCategorySelectDialog: true,
    ignoreFilters: false,
    removeMangaFromCategories: false,
    showTabSize: false,

    // client
    devices: [DEFAULT_DEVICE],

    // migration
    migrateChapters: true,
    migrateCategories: true,
    migrateTracking: true,
    deleteChapters: true,
    migrateSortSettings: DEFAULT_SORT_SETTINGS,

    // browse
    hideLibraryEntries: false,

    // tracking
    updateProgressAfterReading: true,
    updateProgressManualMarkRead: false,

    // updates
    webUIInformAvailableUpdate: true,
    serverInformAvailableUpdate: true,

    // themes
    customThemes: {},
    mangaThumbnailBackdrop: true,
});

export const convertSettingsToMetadata = (
    settings: Partial<MetadataServerSettings>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...settings,
    devices: JSON.stringify(settings.devices),
    customThemes: JSON.stringify(settings.customThemes),
    migrateSortSettings: JSON.stringify(settings.migrateSortSettings),
});

export const convertMetadataToSettings = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
): MetadataServerSettings =>
    ({
        ...getDefaultSettings(),
        ...(metadata as unknown as MetadataServerSettings),
        devices: jsonSaveParse<string[]>((metadata.devices as string) ?? '') ?? getDefaultSettings().devices,
        customThemes:
            jsonSaveParse<MetadataThemeSettings['customThemes']>((metadata.customThemes as string) ?? '') ??
            getDefaultSettings().customThemes,
        migrateSortSettings:
            jsonSaveParse<MetadataMigrationSettings['migrateSortSettings']>(
                (metadata.migrateSortSettings as string) ?? '',
            ) ?? getDefaultSettings().migrateSortSettings,
    }) satisfies MetadataServerSettings;

const getMetadataServerSettingsWithDefaultFallback = (
    meta?: Metadata,
    defaultSettings: MetadataServerSettings = getDefaultSettings(),
    applyMetadataMigration: boolean = true,
): MetadataServerSettings =>
    convertMetadataToSettings(
        getMetadataFrom({ meta }, convertSettingsToMetadata(defaultSettings), applyMetadataMigration),
    );
export const useMetadataServerSettings = (): {
    metadata?: Metadata;
    settings: MetadataServerSettings;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = convertFromGqlMeta(data?.metas.nodes);
    const settings = getMetadataServerSettingsWithDefaultFallback(metadata);

    return { metadata, settings, loading, request };
};

export const getMetadataServerSettings = async (): Promise<MetadataServerSettings> => {
    const { data, error } = await requestManager.getGlobalMeta().response;

    if (error) {
        throw error;
    }

    const metadata = convertFromGqlMeta(data?.metas.nodes);
    return getMetadataServerSettingsWithDefaultFallback(metadata);
};

export const updateMetadataServerSettings = async <
    Settings extends MetadataServerSettingKeys = MetadataServerSettingKeys,
    Setting extends Settings = Settings,
>(
    setting: Setting,
    value: MetadataServerSettings[Setting],
): Promise<void[]> =>
    requestUpdateServerMetadata([[setting, convertSettingsToMetadata({ [setting]: value })[setting]]]);

export const createUpdateMetadataServerSettings =
    <Settings extends MetadataServerSettingKeys>(
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateMetadataServerSettings'),
    ): ((...args: Parameters<typeof updateMetadataServerSettings<Settings>>) => Promise<void | void[]>) =>
    (setting, value) =>
        updateMetadataServerSettings(setting, value).catch(handleError);
