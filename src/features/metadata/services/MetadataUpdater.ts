/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import { CategoryIdInfo } from '@/features/category/Category.types.ts';
import {
    AppMetadataKeys,
    GqlMetaHolder,
    MetadataHolder,
    MetadataHolderType,
    MetadataKeyValuePair,
} from '@/features/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { getMetadataKey } from '@/features/metadata/Metadata.utils.ts';
import { convertToGqlMeta } from '@/features/metadata/services/MetadataConverter.ts';
import { SourceIdInfo } from '@/features/source/Source.types.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

const requestUpdateMetadataValues = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey: boolean = false,
): Promise<void> => {
    const metas = keysToValues.map(([key, value]) => ({
        key: isMetadataKey ? key : getMetadataKey(key, keyPrefixes),
        value: `${value}`,
    }));

    switch (holderType) {
        case 'category':
            await requestManager.setCategoryMeta({
                items: [{ categoryIds: [(metadataHolder as CategoryIdInfo).id], metas }],
            }).response;
            break;
        case 'chapter':
            await requestManager.setChapterMeta({
                items: [{ chapterIds: [(metadataHolder as ChapterIdInfo).id], metas }],
            }).response;
            break;
        case 'global':
            await requestManager.setGlobalMetadata({
                metas,
            }).response;
            break;
        case 'manga':
            await requestManager.setMangaMeta({
                items: [{ mangaIds: [(metadataHolder as MangaIdInfo).id], metas }],
            }).response;
            break;
        case 'source':
            await requestManager.setSourceMeta({
                items: [{ sourceIds: [(metadataHolder as SourceIdInfo).id], metas }],
            }).response;
            break;
        default:
            throw new Error(`requestUpdateMetadataValues: unknown holderType "${holderType}"`);
    }
};

export const requestUpdateServerMetadata = async (
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestUpdateMetadataValues({}, 'global', keysToValues, keyPrefixes, isMetadataKey);

export const requestUpdateMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestUpdateMetadataValues(manga, 'manga', keysToValues, keyPrefixes, isMetadataKey);

export const requestUpdateChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestUpdateMetadataValues(chapter, 'chapter', keysToValues, keyPrefixes, isMetadataKey);

export const requestUpdateCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestUpdateMetadataValues(category, 'category', keysToValues, keyPrefixes, isMetadataKey);

export const requestUpdateSourceMetadata = async (
    source: SourceIdInfo & GqlMetaHolder,
    keysToValue: MetadataKeyValuePair[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestUpdateMetadataValues(source, 'source', keysToValue, keyPrefixes, isMetadataKey);

export const getMetadataUpdateFunction = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (SourceIdInfo & MetadataHolder),
): ((keyValuePair: MetadataKeyValuePair[], prefixes?: string[], isMetadataKey?: boolean) => Promise<void>) => {
    switch (type) {
        case 'global':
            return (...args) => requestUpdateServerMetadata(...args);
        case 'manga':
            return (...args) =>
                requestUpdateMangaMetadata(
                    { id: (metadataHolder as MangaIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'chapter':
            return (...args) =>
                requestUpdateChapterMetadata(
                    { id: (metadataHolder as ChapterIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'category':
            return (...args) =>
                requestUpdateCategoryMetadata(
                    { id: (metadataHolder as CategoryIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'source':
            return (...args) =>
                requestUpdateSourceMetadata(
                    {
                        id: (metadataHolder as SourceIdInfo).id,
                        meta: convertToGqlMeta(metadataHolder.meta),
                    },
                    ...args,
                );
        default:
            throw new Error(`Unexpected "type" (${type})`);
    }
};

const requestDeleteMetadataValues = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey: boolean = false,
): Promise<void> => {
    const metadataKeys = keys.map((key) => (isMetadataKey ? key : getMetadataKey(key, keyPrefixes)));

    switch (holderType) {
        case 'category':
            await requestManager.deleteCategoryMeta({
                items: [{ categoryIds: [(metadataHolder as CategoryIdInfo).id], keys: metadataKeys }],
            }).response;
            break;
        case 'chapter':
            await requestManager.deleteChapterMeta({
                items: [{ chapterIds: [(metadataHolder as ChapterIdInfo).id], keys: metadataKeys }],
            }).response;
            break;
        case 'global':
            await requestManager.deleteGlobalMeta({
                keys: metadataKeys,
            }).response;
            break;
        case 'manga':
            await requestManager.deleteMangaMeta({
                items: [{ mangaIds: [(metadataHolder as MangaIdInfo).id], keys: metadataKeys }],
            }).response;
            break;
        case 'source':
            await requestManager.deleteSourceMeta({
                items: [{ sourceIds: [(metadataHolder as SourceIdInfo).id], keys: metadataKeys }],
            }).response;
            break;
        default:
            throw new Error(`requestDeleteMetadataValues: unknown holderType "${holderType}"`);
    }
};

export const requestDeleteServerMetadata = async (
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestDeleteMetadataValues({}, 'global', keys, keyPrefixes, isMetadataKey);

export const requestDeleteMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestDeleteMetadataValues(manga, 'manga', keys, keyPrefixes, isMetadataKey);

export const requestDeleteChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestDeleteMetadataValues(chapter, 'chapter', keys, keyPrefixes, isMetadataKey);

export const requestDeleteCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestDeleteMetadataValues(category, 'category', keys, keyPrefixes, isMetadataKey);

export const requestDeleteSourceMetadata = async (
    source: SourceIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
    isMetadataKey?: boolean,
): Promise<void> => requestDeleteMetadataValues(source, 'source', keys, keyPrefixes, isMetadataKey);

export const getMetadataDeleteFunction = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (SourceIdInfo & MetadataHolder),
): ((metadataToDelete: AppMetadataKeys[], keyPrefixes?: string[], isMetadataKey?: boolean) => Promise<void>) => {
    switch (type) {
        case 'global':
            return (...args) => requestDeleteServerMetadata(...args);
        case 'manga':
            return (...args) =>
                requestDeleteMangaMetadata(
                    { id: (metadataHolder as MangaIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'chapter':
            return (...args) =>
                requestDeleteChapterMetadata(
                    { id: (metadataHolder as ChapterIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'category':
            return (...args) =>
                requestDeleteCategoryMetadata(
                    { id: (metadataHolder as CategoryIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    ...args,
                );
        case 'source':
            return (...args) =>
                requestDeleteSourceMetadata(
                    {
                        id: (metadataHolder as SourceIdInfo).id,
                        meta: convertToGqlMeta(metadataHolder.meta),
                    },
                    ...args,
                );
        default:
            throw new Error(`Unexpected "type" (${type})`);
    }
};
