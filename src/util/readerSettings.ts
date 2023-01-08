/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getMetadataFrom, requestUpdateMangaMetadata, requestUpdateServerMetadata } from 'util/metadata';
import { useQuery } from 'util/client';

export const getDefaultSettings = (forceUndefined: boolean = false) => ({
    staticNav: forceUndefined ? undefined : false,
    showPageNumber: forceUndefined ? undefined : true,
    continuesPageGap: forceUndefined ? undefined : false,
    loadNextOnEnding: forceUndefined ? undefined : false,
    readerType: forceUndefined ? undefined : 'ContinuesVertical',
} as IReaderSettings);

const getReaderSettingsWithDefaultValueFallback = (
    meta?: IMetadata,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration: boolean = true,
): IReaderSettings => ({
    ...getMetadataFrom(
        { meta },
        Object.entries(defaultSettings ?? getDefaultSettings()) as MetadataKeyValuePair[],
        applyMetadataMigration,
    ) as unknown as IReaderSettings,
});

export const getReaderSettingsFromMetadata = (
    meta?: IMetadata,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => ({
    ...getReaderSettingsWithDefaultValueFallback(meta, defaultSettings, applyMetadataMigration),
});

export const getReaderSettingsFor = (
    { meta }: IMetadataHolder,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsFromMetadata(meta, defaultSettings, applyMetadataMigration);

export const useDefaultReaderSettings = (): {
    metadata?: IMetadata,
    settings: IReaderSettings,
    loading: boolean
} => {
    const { data: meta, loading } = useQuery<IMetadata>('/api/v1/meta');
    const settings = getReaderSettingsWithDefaultValueFallback(meta);

    return { metadata: meta, settings, loading };
};

/**
 * Saves all missing reader settings from the metadata to the server
 *
 * @param metadataHolder
 * @param metadataHolderType
 * @param defaultSettings
 */
export const checkAndHandleMissingStoredReaderSettings = async (
    metadataHolder: IManga | IMetadataHolder,
    metadataHolderType: 'manga' | 'server',
    defaultSettings: IReaderSettings,
): Promise<void | void[]> => {
    const meta = metadataHolder.meta ?? metadataHolder as IMetadata;
    const settingsToCheck = getReaderSettingsFor({ meta }, getDefaultSettings(true), false);
    const newSettings = getReaderSettingsFor({ meta }, defaultSettings);

    const undefinedSettings = Object.entries(settingsToCheck)
        .filter((setting) => setting[1] === undefined);

    const settingsToUpdate: MetadataKeyValuePair[] = [];
    undefinedSettings.forEach((setting) => {
        const key = setting[0] as keyof IReaderSettings;

        settingsToUpdate.push([key, newSettings[key]]);
    });

    if (!undefinedSettings.length) {
        return;
    }

    if (metadataHolderType === 'manga') {
        await requestUpdateMangaMetadata(metadataHolder as IManga, settingsToUpdate);
        return;
    }

    await requestUpdateServerMetadata(meta, settingsToUpdate);
};
