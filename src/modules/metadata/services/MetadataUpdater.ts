/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    MetadataHolderType,
    MetadataKeyValuePair,
} from '@/modules/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { getMetadataKey } from '@/modules/metadata/Metadata.utils.ts';

const requestUpdateMetadataValue = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    key: AppMetadataKeys,
    value: AllowedMetadataValueTypes,
    keyPrefixes?: string[],
): Promise<void> => {
    const metadataKey = getMetadataKey(key, keyPrefixes);

    switch (holderType) {
        case 'category':
            await requestManager.setCategoryMeta((metadataHolder as CategoryIdInfo).id, metadataKey, value).response;
            break;
        case 'chapter':
            await requestManager.setChapterMeta((metadataHolder as ChapterIdInfo).id, metadataKey, value).response;
            break;
        case 'global':
            await requestManager.setGlobalMetadata(metadataKey, value).response;
            break;
        case 'manga':
            await requestManager.setMangaMeta((metadataHolder as MangaIdInfo).id, metadataKey, value).response;
            break;
        case 'source':
            await requestManager.setSourceMeta((metadataHolder as Pick<SourceType, 'id'>).id, metadataKey, value)
                .response;
            break;
        default:
            throw new Error(`requestUpdateMetadataValue: unknown holderType "${holderType}"`);
    }
};

const requestUpdateMetadata = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> =>
    Promise.all(
        keysToValues.map(([key, value]) =>
            requestUpdateMetadataValue(metadataHolder, holderType, key, value, keyPrefixes),
        ),
    );

export const requestUpdateServerMetadata = async (
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> => requestUpdateMetadata({}, 'global', keysToValues, keyPrefixes);

export const requestUpdateMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> => requestUpdateMetadata(manga, 'manga', keysToValues, keyPrefixes);

export const requestUpdateChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> => requestUpdateMetadata(chapter, 'chapter', keysToValues, keyPrefixes);

export const requestUpdateCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> => requestUpdateMetadata(category, 'category', keysToValues, keyPrefixes);

export const requestUpdateSourceMetadata = async (
    source: Pick<SourceType, 'id'> & GqlMetaHolder,
    keysToValue: MetadataKeyValuePair[],
    keyPrefixes?: string[],
): Promise<void[]> => requestUpdateMetadata(source, 'source', keysToValue, keyPrefixes);

export const requestDeleteMetadataValue = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    key: AppMetadataKeys,
    keyPrefixes?: string[],
): Promise<void> => {
    const metadataKey = getMetadataKey(key, keyPrefixes);

    switch (holderType) {
        case 'category':
            await requestManager.deleteCategoryMeta((metadataHolder as CategoryIdInfo).id, metadataKey).response;
            break;
        case 'chapter':
            await requestManager.deleteChapterMeta((metadataHolder as ChapterIdInfo).id, metadataKey).response;
            break;
        case 'global':
            await requestManager.deleteGlobalMeta(metadataKey).response;
            break;
        case 'manga':
            await requestManager.deleteMangaMeta((metadataHolder as MangaIdInfo).id, metadataKey).response;
            break;
        case 'source':
            await requestManager.deleteSourceMeta((metadataHolder as Pick<SourceType, 'id'>).id, metadataKey).response;
            break;
        default:
            throw new Error(`requestDeleteMetadataValue: unknown holderType "${holderType}"`);
    }
};

async function requestDeleteMetadata(
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
): Promise<void[]> {
    return Promise.all(keys.map((key) => requestDeleteMetadataValue(metadataHolder, holderType, key, keyPrefixes)));
}

export const requestDeleteServerMetadata = async (keys: AppMetadataKeys[], keyPrefixes?: string[]): Promise<void[]> =>
    requestDeleteMetadata({}, 'global', keys, keyPrefixes);

export const requestDeleteMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
): Promise<void[]> => requestDeleteMetadata(manga, 'manga', keys, keyPrefixes);

export const requestDeleteChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
): Promise<void[]> => requestDeleteMetadata(chapter, 'chapter', keys, keyPrefixes);

export const requestDeleteCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
): Promise<void[]> => requestDeleteMetadata(category, 'category', keys, keyPrefixes);

export const requestDeleteSourceMetadata = async (
    source: Pick<SourceType, 'id'> & GqlMetaHolder,
    keys: AppMetadataKeys[],
    keyPrefixes?: string[],
): Promise<void[]> => requestDeleteMetadata(source, 'source', keys, keyPrefixes);
