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
    DEFAULT_READER_SETTINGS,
    GLOBAL_READER_SETTING_KEYS,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { DEFAULT_DEVICE, getActiveDevice } from '@/modules/device/services/Device.ts';
import { APP_METADATA_KEY_PREFIX } from '@/modules/metadata/Metadata.constants.ts';

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
});

export const DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG = convertToSettingsWithDefaultFlag(
    'global',
    DEFAULT_READER_SETTINGS,
    { meta: convertSettingsToMetadata(DEFAULT_READER_SETTINGS) as Metadata },
);

const convertMetadataToSettings = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
    defaultSettings: IReaderSettings,
): IReaderSettings => ({
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
});

const getReaderMetadata = (
    type: Extract<MetadataHolderType, 'global' | 'manga'>,
    metadataHolder: (MangaIdInfo & MetadataHolder) | MetadataHolder,
    defaultSettings: IReaderSettings = DEFAULT_READER_SETTINGS,
    useEffectFn?: typeof useEffect,
) =>
    convertMetadataToSettings(
        getMetadataFrom(
            type as Parameters<typeof getMetadataFrom>[0],
            metadataHolder as Parameters<typeof getMetadataFrom>[1],
            convertSettingsToMetadata(defaultSettings),
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
): IReaderSettingsWithDefaultFlag;
function getReaderSettingsWithDefaultValueFallback(
    type: 'manga',
    metadataHolder: MangaIdInfo & MetadataHolder,
    defaultSettings?: IReaderSettings,
    useEffectFn?: typeof useEffect,
): IReaderSettingsWithDefaultFlag;
function getReaderSettingsWithDefaultValueFallback(
    type: Extract<MetadataHolderType, 'global' | 'manga'>,
    metadataHolder: (MangaIdInfo & MetadataHolder) | MetadataHolder,
    defaultSettings: IReaderSettings = DEFAULT_READER_SETTINGS,
    useEffectFn?: typeof useEffect,
): IReaderSettingsWithDefaultFlag {
    const settings = getReaderMetadata(type, metadataHolder, defaultSettings, useEffectFn);
    return convertToSettingsWithDefaultFlag(type, settings, metadataHolder);
}

const getSettings = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings?: IReaderSettings,
    useEffectFn?: typeof useEffect,
) =>
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
    );

export const getReaderSettingsFor = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings: IReaderSettings,
): IReaderSettingsWithDefaultFlag => getSettings(metaHolder, defaultSettings);

export const useGetReaderSettingsFor = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultSettings: IReaderSettings,
): IReaderSettingsWithDefaultFlag => {
    const settings = getSettings(metaHolder, defaultSettings, useEffect);
    return useMemo(() => settings, [metaHolder, defaultSettings]);
};

export const useDefaultReaderSettings = (): {
    metadata?: Metadata;
    settings: IReaderSettings;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = useMemo(() => convertFromGqlMeta(data?.metas.nodes), [data?.metas.nodes]);
    const metaHolder: MetadataHolder = useMemo(() => ({ meta: metadata }), [metadata]);
    const tmpSettings = getReaderMetadata('global', metaHolder, undefined, useEffect);
    const settings = useMemo(() => tmpSettings, [metaHolder]);

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

export const useDefaultReaderSettingsWithDefaultFlag = (): {
    metadata?: Metadata;
    settings: IReaderSettingsWithDefaultFlag;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = useMemo(() => convertFromGqlMeta(data?.metas.nodes), [data?.metas.nodes]);
    const metaHolder: MetadataHolder = useMemo(() => ({ meta: metadata }), [metadata]);
    const tmpSettings = getReaderSettingsWithDefaultValueFallback('global', metaHolder, undefined, useEffect);
    const settings = useMemo(() => tmpSettings, [metaHolder]);

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
): Promise<void[]> => {
    const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
    if (isGlobalSetting) {
        return requestUpdateServerMetadata([[setting, convertSettingsToMetadata({ [setting]: value })[setting]]]);
    }

    return requestUpdateMangaMetadata(manga, [[setting, convertSettingsToMetadata({ [setting]: value })[setting]]]);
};
export const createUpdateReaderSettings =
    <Settings extends keyof IReaderSettings>(
        manga: Pick<MangaType, 'id'> & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateReaderSettings'),
    ): ((...args: OmitFirst<Parameters<typeof updateReaderSettings<Settings>>>) => Promise<void | void[]>) =>
    (setting, value, isGlobal) =>
        updateReaderSettings(manga, setting, value, isGlobal).catch(handleError);
