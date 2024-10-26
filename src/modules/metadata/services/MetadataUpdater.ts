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
import { getMetadataKey } from '@/modules/metadata/services/MetadataReader.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    MetadataHolderType,
    MetadataKeyValuePair,
} from '@/modules/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';

export const requestUpdateMetadataValue = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    key: AppMetadataKeys,
    value: AllowedMetadataValueTypes,
): Promise<void> => {
    const metadataKey = getMetadataKey(key);

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

export const requestUpdateMetadata = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> =>
    Promise.all(keysToValues.map(([key, value]) => requestUpdateMetadataValue(metadataHolder, holderType, key, value)));

export const requestUpdateServerMetadata = async (keysToValues: MetadataKeyValuePair[]): Promise<void[]> =>
    requestUpdateMetadata({}, 'global', keysToValues);

export const requestUpdateMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(manga, 'manga', keysToValues);

export const requestUpdateChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(chapter, 'chapter', keysToValues);

export const requestUpdateCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(category, 'category', keysToValues);

export const requestUpdateSourceMetadata = async (
    source: Pick<SourceType, 'id'> & GqlMetaHolder,
    keysToValue: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(source, 'source', keysToValue);

export const requestDeleteMetadataValue = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    key: AppMetadataKeys,
): Promise<void> => {
    const metadataKey = getMetadataKey(key);

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

export async function requestDeleteMetadata(
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keys: AppMetadataKeys[],
): Promise<void[]> {
    return Promise.all(keys.map((key) => requestDeleteMetadataValue(metadataHolder, holderType, key)));
}

export const requestDeleteServerMetadata = async (keys: AppMetadataKeys[]): Promise<void[]> =>
    requestDeleteMetadata({}, 'global', keys);

export const requestDeleteMangaMetadata = async (
    manga: MangaIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
): Promise<void[]> => requestDeleteMetadata(manga, 'manga', keys);

export const requestDeleteChapterMetadata = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
): Promise<void[]> => requestDeleteMetadata(chapter, 'chapter', keys);

export const requestDeleteCategoryMetadata = async (
    category: CategoryIdInfo & GqlMetaHolder,
    keys: AppMetadataKeys[],
): Promise<void[]> => requestDeleteMetadata(category, 'category', keys);

export const requestDeleteSourceMetadata = async (
    source: Pick<SourceType, 'id'> & GqlMetaHolder,
    keys: AppMetadataKeys[],
): Promise<void[]> => requestDeleteMetadata(source, 'source', keys);
