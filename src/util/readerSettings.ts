/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getMetadataFrom, requestUpdateMangaMetadata, requestUpdateServerMetadata } from 'util/metadata';
import { useQuery } from 'util/client';
import { IManga, Metadata, MetadataHolder, IReaderSettings, MetadataKeyValuePair } from 'typings';

type UndefinedReaderSettings = {
    [setting in keyof IReaderSettings]: IReaderSettings[setting] | undefined;
};

export const getDefaultSettings = (): IReaderSettings => ({
    staticNav: false,
    showPageNumber: true,
    loadNextOnEnding: false,
    skipDupChapters: true,
    readerType: 'ContinuesVertical',
});

const getReaderSettingsWithDefaultValueFallback = <DefaultSettings extends IReaderSettings | UndefinedReaderSettings>(
    meta?: Metadata,
    defaultSettings: DefaultSettings = getDefaultSettings() as DefaultSettings,
    applyMetadataMigration: boolean = true,
): DefaultSettings => getMetadataFrom({ meta }, defaultSettings, applyMetadataMigration);

export const getReaderSettingsFromMetadata = (
    meta?: Metadata,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsWithDefaultValueFallback(meta, defaultSettings, applyMetadataMigration);

export const getReaderSettingsFor = (
    { meta }: MetadataHolder,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsFromMetadata(meta, defaultSettings, applyMetadataMigration);

export const useDefaultReaderSettings = (): {
    metadata?: Metadata;
    settings: IReaderSettings;
    loading: boolean;
} => {
    const { data: meta, isLoading } = useQuery<Metadata>('/api/v1/meta');
    const settings = getReaderSettingsWithDefaultValueFallback<IReaderSettings>(meta);

    return { metadata: meta, settings, loading: isLoading };
};

/**
 * Saves all missing reader settings from the metadata to the server
 *
 * @param metadataHolder
 * @param metadataHolderType
 * @param defaultSettings
 */
export const checkAndHandleMissingStoredReaderSettings = async (
    metadataHolder: IManga | MetadataHolder,
    metadataHolderType: 'manga' | 'server',
    defaultSettings: IReaderSettings,
): Promise<void | void[]> => {
    const meta = metadataHolder.meta ?? (metadataHolder as Metadata);
    const settingsToCheck = getReaderSettingsWithDefaultValueFallback(
        meta,
        {
            staticNav: undefined,
            showPageNumber: undefined,
            loadNextOnEnding: undefined,
            skipDupChapters: undefined,
            readerType: undefined,
        },
        false,
    );
    const newSettings = getReaderSettingsFor({ meta }, defaultSettings);

    const undefinedSettings = Object.entries(settingsToCheck).filter((setting) => setting[1] === undefined);

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
