/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { requestUpdateServerMetadata } from '@/modules/metadata/services/MetadataUpdater.ts';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';
import { MetadataThemeSettings } from '@/modules/theme/AppTheme.types.ts';
import { SERVER_SETTINGS_METADATA_DEFAULT } from '@/modules/settings/Settings.constants.ts';
import { MetadataServerSettingKeys, MetadataServerSettings } from '@/modules/settings/Settings.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import { AllowedMetadataValueTypes, AppMetadataKeys, Metadata } from '@/modules/metadata/Metadata.types.ts';

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
        ...SERVER_SETTINGS_METADATA_DEFAULT,
        ...(metadata as unknown as MetadataServerSettings),
        devices:
            jsonSaveParse<string[]>((metadata.devices as string) ?? '') ?? SERVER_SETTINGS_METADATA_DEFAULT.devices,
        customThemes:
            jsonSaveParse<MetadataThemeSettings['customThemes']>((metadata.customThemes as string) ?? '') ??
            SERVER_SETTINGS_METADATA_DEFAULT.customThemes,
        migrateSortSettings:
            jsonSaveParse<MetadataMigrationSettings['migrateSortSettings']>(
                (metadata.migrateSortSettings as string) ?? '',
            ) ?? SERVER_SETTINGS_METADATA_DEFAULT.migrateSortSettings,
    }) satisfies MetadataServerSettings;

const getMetadataServerSettingsWithDefaultFallback = (
    meta?: Metadata,
    defaultSettings: MetadataServerSettings = SERVER_SETTINGS_METADATA_DEFAULT,
    useEffectFn?: typeof useEffect,
): MetadataServerSettings =>
    convertMetadataToSettings(
        getMetadataFrom('global', { meta }, convertSettingsToMetadata(defaultSettings), undefined, true, useEffectFn),
    );

export const useMetadataServerSettings = (): {
    metadata?: Metadata;
    settings: MetadataServerSettings;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = useMemo(() => convertFromGqlMeta(data?.metas.nodes), [data?.metas.nodes]);
    const tmpSettings = getMetadataServerSettingsWithDefaultFallback(metadata, undefined, useEffect);
    const settings = useMemo(() => tmpSettings, [metadata]);

    return useMemo(() => ({ metadata, settings, loading, request }), [metadata, settings, loading, request]);
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
