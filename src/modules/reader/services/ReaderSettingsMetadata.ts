/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    requestUpdateMangaMetadata,
    requestUpdateServerMetadata,
} from '@/modules/metadata/services/MetadataUpdater.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { IReaderSettings, IReaderSettingsWithDefaultFlag } from '@/modules/reader/types/Reader.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { extractOriginalKey, getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    Metadata,
    MetadataHolder,
    MetadataHolderType,
} from '@/modules/metadata/Metadata.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import {
    DEFAULT_READER_PROFILE,
    DEFAULT_READER_SETTINGS,
    GLOBAL_READER_SETTING_KEYS,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { DEFAULT_DEVICE, getActiveDevice } from '@/modules/device/services/Device.ts';
import { APP_METADATA_KEY_PREFIX } from '@/modules/metadata/Metadata.constants.ts';

export const convertFromReaderSettingsWithDefaultFlag = (settings: IReaderSettingsWithDefaultFlag): IReaderSettings =>
    Object.fromEntries(
        Object.entries(settings).map(([key, value]) => [
            key,
            Object.hasOwn(value, 'value') && Object.hasOwn(value, 'isDefault') ? value.value : value,
        ]),
    ) as IReaderSettings;

const convertToSettingsWithDefaultFlag = (
    type: Extract<MetadataHolderType, 'global' | 'manga'>,
    settings: IReaderSettings,
    metadataHolder: MetadataHolder,
): IReaderSettingsWithDefaultFlag => {
    const activeDevice = getActiveDevice();
    const istDefaultDevice = activeDevice === DEFAULT_DEVICE;
    const existingSettings = Object.keys(metadataHolder.meta ?? {})
        // settings that are not for the active device need to be filtered out, otherwise, they mess up the "isDefault" flag
        .filter((metaKey) => {
            // the default device is not added as a prefix to the key, thus, there should only be the app prefix for these reader settings
            if (istDefaultDevice) {
                return metaKey.match(/_/g)?.length === 1;
            }

            return metaKey.startsWith(`${APP_METADATA_KEY_PREFIX}_${activeDevice}_`);
        })
        .map((metaKey) => extractOriginalKey(metaKey));
    const settingsWithDefault = Object.fromEntries(
        (Object.entries(settings) as [keyof IReaderSettings, IReaderSettings[keyof IReaderSettings]][]).map(
            ([key, value]) => {
                const isGlobalSetting = GLOBAL_READER_SETTING_KEYS.includes(key);
                if (isGlobalSetting) {
                    return [key, value];
                }

                const isDefaultSetting = type === 'manga' && !existingSettings.includes(key);
                return [
                    key,
                    {
                        value,
                        isDefault: isDefaultSetting,
                    },
                ];
            },
        ),
    ) as IReaderSettingsWithDefaultFlag;

    return settingsWithDefault;
};

const convertSettingsToMetadata = (
    settings: Partial<IReaderSettings>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...settings,
    tapZoneInvertMode: JSON.stringify(settings.tapZoneInvertMode),
    customFilter: JSON.stringify(settings.customFilter),
    readerWidth: JSON.stringify(settings.readerWidth),
    profiles: JSON.stringify(settings.profiles),
    readingModesDefaultProfile: JSON.stringify(settings.readingModesDefaultProfile),
    hotkeys: JSON.stringify(settings.hotkeys),
});

export const DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG = convertToSettingsWithDefaultFlag(
    'global',
    DEFAULT_READER_SETTINGS,
    { meta: convertSettingsToMetadata(DEFAULT_READER_SETTINGS) as Metadata },
);

const convertMetadataToSettings = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
    defaultSettings: IReaderSettings,
): IReaderSettings => {
    const profiles =
        jsonSaveParse<IReaderSettings['profiles']>((metadata.profiles as string) ?? '') ?? defaultSettings.profiles;

    return {
        ...(metadata as unknown as IReaderSettings),
        tapZoneInvertMode:
            jsonSaveParse<IReaderSettings['tapZoneInvertMode']>((metadata.tapZoneInvertMode as string) ?? '') ??
            defaultSettings.tapZoneInvertMode,
        customFilter:
            jsonSaveParse<IReaderSettings['customFilter']>((metadata.customFilter as string) ?? '') ??
            defaultSettings.customFilter,
        readerWidth:
            jsonSaveParse<IReaderSettings['readerWidth']>((metadata.readerWidth as string) ?? '') ??
            defaultSettings.readerWidth,
        profiles,
        readingModesDefaultProfile: Object.fromEntries(
            Object.entries(
                jsonSaveParse<IReaderSettings['readingModesDefaultProfile']>(
                    (metadata.readingModesDefaultProfile as string) ?? '',
                ) ?? defaultSettings.readingModesDefaultProfile,
            ).map(([readingMode, profile]) => [
                readingMode,
                profiles.includes(profile) ? profile : DEFAULT_READER_PROFILE,
            ]),
        ) as IReaderSettings['readingModesDefaultProfile'],
        hotkeys:
            jsonSaveParse<IReaderSettings['hotkeys']>((metadata.hotkeys as string) ?? '') ?? defaultSettings.hotkeys,
    };
};

export const getReaderSettings = (
    type: Extract<MetadataHolderType, 'global' | 'manga'>,
    metadataHolder: (MangaIdInfo & MetadataHolder) | MetadataHolder,
    defaultSettings: IReaderSettings = DEFAULT_READER_SETTINGS,
    useEffectFn?: typeof useEffect,
    profile: string = DEFAULT_READER_PROFILE,
) =>
    convertMetadataToSettings(
        getMetadataFrom(
            type as Parameters<typeof getMetadataFrom>[0],
            metadataHolder as Parameters<typeof getMetadataFrom>[1],
            convertSettingsToMetadata(defaultSettings),
            [profile],
            true,
            useEffectFn,
        ),
        defaultSettings as IReaderSettings,
    );

function getReaderSettingsWithDefaultValueFallback(
    type: 'global',
    metadataHolder: MetadataHolder,
    defaultSettings?: IReaderSettings,
    useEffectFn?: typeof useEffect,
    profile?: string,
): IReaderSettingsWithDefaultFlag;
function getReaderSettingsWithDefaultValueFallback(
    type: 'manga',
    metadataHolder: MangaIdInfo & MetadataHolder,
    defaultSettings?: IReaderSettings,
    useEffectFn?: typeof useEffect,
    profile?: string,
): IReaderSettingsWithDefaultFlag;
function getReaderSettingsWithDefaultValueFallback(
    type: Extract<MetadataHolderType, 'global' | 'manga'>,
    metadataHolder: (MangaIdInfo & MetadataHolder) | MetadataHolder,
    defaultSettings: IReaderSettings = DEFAULT_READER_SETTINGS,
    useEffectFn?: typeof useEffect,
    profile?: string,
): IReaderSettingsWithDefaultFlag {
    const settings = getReaderSettings(type, metadataHolder, defaultSettings, useEffectFn, profile);
    return convertToSettingsWithDefaultFlag(type, settings, metadataHolder);
}

const getSettings = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings?: IReaderSettings,
    useEffectFn?: typeof useEffect,
    profile?: string,
): IReaderSettingsWithDefaultFlag =>
    getReaderSettingsWithDefaultValueFallback(
        'manga',
        {
            ...metaHolder,
            meta: convertFromGqlMeta(
                metaHolder.meta,
                (key) => !GLOBAL_READER_SETTING_KEYS.includes(extractOriginalKey(key)),
            ),
        },
        defaultSettings,
        useEffectFn,
        profile,
    );

export const getReaderSettingsFor = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings: IReaderSettings,
): IReaderSettingsWithDefaultFlag => getSettings(metaHolder, defaultSettings);

export const useGetReaderSettingsFor = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings: IReaderSettings,
    profile?: string,
): IReaderSettingsWithDefaultFlag => {
    const settings = getSettings(metaHolder, defaultSettings, useEffect, profile);
    return useMemo(() => settings, [metaHolder, defaultSettings, profile]);
};

export const useDefaultReaderSettings = (
    profile?: string,
): {
    metadata?: Metadata;
    settings: IReaderSettings;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = useMemo(() => convertFromGqlMeta(data?.metas.nodes), [data?.metas.nodes]);
    const metaHolder: MetadataHolder = useMemo(() => ({ meta: metadata }), [metadata]);
    const tmpSettings = getReaderSettings('global', metaHolder, undefined, useEffect, profile);
    const settings = useMemo(() => tmpSettings, [metaHolder, profile]);

    return useMemo(
        () => ({
            metadata,
            settings,
            loading,
            request,
        }),
        [metadata, settings, loading, request],
    );
};

export const useDefaultReaderSettingsWithDefaultFlag = (
    profile?: string,
): {
    metadata?: Metadata;
    settings: IReaderSettingsWithDefaultFlag;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = useMemo(() => convertFromGqlMeta(data?.metas.nodes), [data?.metas.nodes]);
    const metaHolder: MetadataHolder = useMemo(() => ({ meta: metadata }), [metadata]);
    const tmpSettings = getReaderSettingsWithDefaultValueFallback('global', metaHolder, undefined, useEffect, profile);
    const settings = useMemo(() => tmpSettings, [metaHolder, profile]);

    return useMemo(
        () => ({
            metadata,
            settings,
            loading,
            request,
        }),
        [metadata, settings, loading, request],
    );
};

export const updateReaderSettings = async <Setting extends keyof IReaderSettings = keyof IReaderSettings>(
    manga: Pick<MangaType, 'id'> & GqlMetaHolder,
    setting: Setting,
    value: IReaderSettings[Setting],
    isGlobal: boolean = false,
    profile?: string,
): Promise<void[]> => {
    const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
    if (isGlobalSetting) {
        return requestUpdateServerMetadata(
            [[setting, convertSettingsToMetadata({ [setting]: value })[setting]]],
            profile ? [profile] : undefined,
        );
    }

    return requestUpdateMangaMetadata(
        manga,
        [[setting, convertSettingsToMetadata({ [setting]: value })[setting]]],
        profile ? [profile] : undefined,
    );
};
export const createUpdateReaderSettings =
    <Settings extends keyof IReaderSettings>(
        manga: Pick<MangaType, 'id'> & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateReaderSettings'),
        profile?: string,
    ): ((...args: OmitFirst<Parameters<typeof updateReaderSettings<Settings>>>) => Promise<void | void[]>) =>
    (setting, value, isGlobal) =>
        updateReaderSettings(manga, setting, value, isGlobal, profile).catch(handleError);
