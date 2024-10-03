/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    requestUpdateMangaMetadata,
    requestUpdateServerMetadata,
} from '@/modules/metadata/services/MetadataUpdater.ts';
import { MangaType, MetaType } from '@/lib/graphql/generated/graphql.ts';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader-deprecated/Reader.constants.ts';
import { IReaderSettings, UndefinedReaderSettings } from '@/modules/reader-deprecated/Reader.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import { GqlMetaHolder, Metadata, MetadataKeyValuePair } from '@/modules/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

const getReaderSettingsWithDefaultValueFallback = <DefaultSettings extends IReaderSettings | UndefinedReaderSettings>(
    meta?: Metadata,
    defaultSettings: DefaultSettings = DEFAULT_READER_SETTINGS as DefaultSettings,
    applyMetadataMigration: boolean = true,
): DefaultSettings => getMetadataFrom({ meta }, defaultSettings, applyMetadataMigration);

export const getReaderSettingsFromMetadata = (
    meta?: Metadata,
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsWithDefaultValueFallback(meta, defaultSettings, applyMetadataMigration);

export const getReaderSettingsFor = (
    { meta }: GqlMetaHolder = { meta: [] },
    defaultSettings?: IReaderSettings,
    applyMetadataMigration?: boolean,
): IReaderSettings => getReaderSettingsFromMetadata(convertFromGqlMeta(meta), defaultSettings, applyMetadataMigration);

export const useDefaultReaderSettings = (): {
    metadata?: Metadata;
    settings: IReaderSettings;
    loading: boolean;
    request: ReturnType<typeof requestManager.useGetGlobalMeta>;
} => {
    const request = requestManager.useGetGlobalMeta({ notifyOnNetworkStatusChange: true });
    const { data, loading } = request;
    const metadata = convertFromGqlMeta(data?.metas.nodes);
    const settings = getReaderSettingsWithDefaultValueFallback<IReaderSettings>(metadata);

    return { metadata, settings, loading, request };
};

export const updateReaderSettings = async <Setting extends keyof IReaderSettings = keyof IReaderSettings>(
    manga: Pick<MangaType, 'id'> & GqlMetaHolder,
    setting: Setting,
    value: IReaderSettings[Setting],
): Promise<void[]> => requestUpdateMangaMetadata(manga, [[setting, value]]);

export const createUpdateReaderSettings =
    <Settings extends keyof IReaderSettings>(
        manga: Pick<MangaType, 'id'> & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateReaderSettings'),
    ): ((...args: OmitFirst<Parameters<typeof updateReaderSettings<Settings>>>) => Promise<void | void[]>) =>
    (setting, value) =>
        updateReaderSettings(manga, setting, value).catch(handleError);

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
            tapZoneLayout: undefined,
            progressBarType: undefined,
            progressBarSize: undefined,
            progressBarPosition: undefined,
            pageScaleMode: undefined,
            shouldScalePage: undefined,
            shouldOffsetDoubleSpreads: undefined,
            readingDirection: undefined,
            readingMode: undefined,
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
        await requestUpdateMangaMetadata(metadataHolder as MangaIdInfo & GqlMetaHolder, settingsToUpdate);
        return;
    }

    await requestUpdateServerMetadata(settingsToUpdate);
};
