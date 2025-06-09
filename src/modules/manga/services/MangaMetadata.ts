/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { DEFAULT_CHAPTER_OPTIONS } from '@/modules/chapter/Chapter.constants.ts';
import { getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import { MangaIdInfo, MangaMetadata, MangaMetadataKeys } from '@/modules/manga/Manga.types.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    Metadata,
    MetadataHolder,
} from '@/modules/metadata/Metadata.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { requestUpdateMangaMetadata } from '@/modules/metadata/services/MetadataUpdater.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';

const DEFAULT_MANGA_METADATA: MangaMetadata = {
    ...DEFAULT_CHAPTER_OPTIONS,
};

const convertAppMetadataToGqlMetadata = (
    metadata: Partial<MangaMetadata>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...metadata,
    excludedScanlators: JSON.stringify(metadata.excludedScanlators),
});

const convertGqlMetadataToAppMetadata = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
): MangaMetadata => ({
    ...(metadata as unknown as MangaMetadata),
    excludedScanlators: jsonSaveParse<MangaMetadata['excludedScanlators']>(metadata.excludedScanlators as string) ?? [],
});

const getMangaMetadataWithDefaultValueFallback = (
    meta: MangaIdInfo & MetadataHolder,
    defaultMetadata: MangaMetadata = DEFAULT_MANGA_METADATA,
    useEffectFn?: typeof useEffect,
): MangaMetadata =>
    convertGqlMetadataToAppMetadata(
        getMetadataFrom('manga', meta, convertAppMetadataToGqlMetadata(defaultMetadata), undefined, useEffectFn),
    );

const getMetadata = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultMetadata?: MangaMetadata,
    useEffectFn?: typeof useEffect,
) =>
    getMangaMetadataWithDefaultValueFallback(
        { ...metaHolder, meta: convertFromGqlMeta(metaHolder.meta) },
        defaultMetadata,
        useEffectFn,
    );

export const getMangaMetadata = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultMetadata?: MangaMetadata,
): MangaMetadata => getMetadata(metaHolder, defaultMetadata);

export const useGetMangaMetadata = (
    metaHolder: MangaIdInfo & GqlMetaHolder,
    defaultMetadata?: MangaMetadata,
): MangaMetadata => {
    const metadata = getMetadata(metaHolder, defaultMetadata, useEffect);
    return useMemo(() => metadata, [metaHolder, defaultMetadata]);
};

export const updateMangaMetadata = async <
    MetadataKeys extends MangaMetadataKeys = MangaMetadataKeys,
    MetadataKey extends MetadataKeys = MetadataKeys,
>(
    manga: MangaIdInfo & GqlMetaHolder,
    metadataKey: MetadataKey,
    value: MangaMetadata[MetadataKey],
): Promise<void[]> =>
    requestUpdateMangaMetadata(manga, [
        [metadataKey, convertAppMetadataToGqlMetadata({ [metadataKey]: value })[metadataKey]],
    ]);

export const createUpdateMangaMetadata =
    <Settings extends MangaMetadataKeys>(
        manga: MangaIdInfo & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateMangaMetadata'),
    ): ((...args: OmitFirst<Parameters<typeof updateMangaMetadata<Settings>>>) => Promise<void | void[]>) =>
    (metadataKey, value) =>
        updateMangaMetadata(manga, metadataKey, value).catch(handleError);
