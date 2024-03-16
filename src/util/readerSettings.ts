/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Metadata, IReaderSettings, MetadataKeyValuePair, GqlMetaHolder, TManga } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    convertFromGqlMeta,
    getMetadataFrom,
    requestUpdateMangaMetadata,
    requestUpdateServerMetadata,
} from '@/util/metadata';
import { MetaType } from '@/lib/graphql/generated/graphql.ts';

type UndefinedReaderSettings = {
    [setting in keyof IReaderSettings]: IReaderSettings[setting] | undefined;
};

export const getDefaultSettings = (): IReaderSettings => ({
    staticNav: false,
    showPageNumber: true,
    loadNextOnEnding: false,
    skipDupChapters: true,
    fitPageToWindow: true,
    scalePage: false,
    readerType: 'ContinuesVertical',
    offsetFirstPage: false,
    readerWidth: 50,
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
    { meta }: GqlMetaHolder = {},
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsFromMetadata(convertFromGqlMeta(meta), defaultSettings, applyMetadataMigration);

export const useDefaultReaderSettings = (): {
    metadata?: Metadata;
    settings: IReaderSettings;
    loading: boolean;
} => {
    const { data, loading } = requestManager.useGetGlobalMeta();
    const metadata = convertFromGqlMeta(data?.metas.nodes);
    const settings = getReaderSettingsWithDefaultValueFallback<IReaderSettings>(metadata);

    return { metadata, settings, loading };
};

/**
 * Saves all missing reader settings from the metadata to the server
 *
 * @param metadataHolder
 * @param metadataHolderType
 * @param defaultSettings
 */
export const checkAndHandleMissingStoredReaderSettings = async (
    metadataHolder: Required<GqlMetaHolder> | MetaType[],
    metadataHolderType: 'manga' | 'server',
    defaultSettings: IReaderSettings,
): Promise<void | void[]> => {
    const getMeta = () => (Array.isArray(metadataHolder) ? metadataHolder : metadataHolder.meta);
    const meta = convertFromGqlMeta(getMeta())!;
    const settingsToCheck = getReaderSettingsWithDefaultValueFallback(
        meta,
        {
            staticNav: undefined,
            showPageNumber: undefined,
            loadNextOnEnding: undefined,
            skipDupChapters: undefined,
            fitPageToWindow: undefined,
            scalePage: undefined,
            readerType: undefined,
            offsetFirstPage: undefined,
            readerWidth: undefined,
        },
        false,
    );
    const newSettings = getReaderSettingsFor({ meta: getMeta() }, defaultSettings);

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
        await requestUpdateMangaMetadata(metadataHolder as TManga, settingsToUpdate);
        return;
    }

    await requestUpdateServerMetadata(settingsToUpdate);
};
