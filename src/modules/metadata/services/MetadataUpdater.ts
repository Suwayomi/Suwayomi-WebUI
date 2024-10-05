/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { MangaIdInfo } from '@/modules/manga/services/Mangas.ts';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { getMetadataKey } from '@/modules/metadata/services/MetadataReader.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    MetadataKeyValuePair,
} from '@/modules/metadata/Metadata.types.ts';

type MetadataHolderType = 'manga' | 'chapter' | 'category' | 'global' | 'source';

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
