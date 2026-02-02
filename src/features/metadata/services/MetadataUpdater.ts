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
import { MetadataChunker } from '@/features/metadata/services/MetadataChunker.ts';
import { SourceIdInfo } from '@/features/source/Source.types.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { MetaInput } from '@/lib/graphql/generated/graphql.ts';

type MetadataUpdateOptions = {
    update?: MetadataKeyValuePair[];
    delete?: AppMetadataKeys[];
    /**
     * Only ever pass the "migration" key value pair into this.
     */
    migrate?: MetadataKeyValuePair[];
    keyPrefixes?: string[];
    /**
     * Applies to "update" and "delete" metadata value pairs. "migrate" is excluded from this and is always expected to not be already converted to a metadata key
     */
    isMetadataKey?: boolean;
};

const requestMetadataUpdate = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    {
        update: keysToValues = [],
        delete: keysToDelete = [],
        migrate: keysToMigrate = [],
        keyPrefixes,
        isMetadataKey = false,
    }: MetadataUpdateOptions,
): Promise<void> => {
    if (keysToMigrate?.length > 1 || (keysToMigrate?.length === 1 && keysToMigrate[0][0] !== 'migration')) {
        throw new Error(
            `requestMetadataUpdate: "migrate" option must only contain a single key-value pair with the key "migration"`,
        );
    }

    const existingMetadata = MetadataChunker.getExistingMetadata(metadataHolder, holderType);

    const allUpdateMetas: MetaInput[] = [];
    const allDeleteKeys: string[] = [];

    keysToValues.forEach(([key, value]) => {
        const fullKey = isMetadataKey ? key : getMetadataKey(key, keyPrefixes);
        const stringValue = `${value}`;

        const chunkEntries = MetadataChunker.chunkValue(fullKey, stringValue);
        allUpdateMetas.push(...chunkEntries);

        const doFullCleanup = !!existingMetadata;
        if (doFullCleanup) {
            const newChunkCount = chunkEntries.length - 1;
            allDeleteKeys.push(...MetadataChunker.computeChunkDeletions(existingMetadata, fullKey, newChunkCount));
        } else {
            const isNowChunked = chunkEntries.length > 1;
            if (!isNowChunked) {
                allDeleteKeys.push(MetadataChunker.getChunkLengthKey(fullKey));
            }
        }
    });

    keysToDelete.forEach((key) => {
        const fullKey = isMetadataKey ? key : getMetadataKey(key, keyPrefixes);
        allDeleteKeys.push(fullKey);

        allDeleteKeys.push(...MetadataChunker.computeChunkDeletions(existingMetadata, fullKey, 0));
    });

    const uniqueDeleteKeys = [...new Set(allDeleteKeys)];

    const migrateMetas = keysToMigrate.map(([key, value]) => ({
        key: getMetadataKey(key, keyPrefixes),
        value: `${value}`,
    }));

    switch (holderType) {
        case 'category': {
            const categoryId = (metadataHolder as CategoryIdInfo).id;
            await requestManager.updateCategoryMeta({
                updateInput: { items: [{ categoryIds: [categoryId], metas: allUpdateMetas }] },
                deleteInput: { items: [{ categoryIds: [categoryId], keys: uniqueDeleteKeys }] },
                migrateInput: { items: [{ categoryIds: [categoryId], metas: migrateMetas }] },
            }).response;
            break;
        }
        case 'chapter': {
            const chapterId = (metadataHolder as ChapterIdInfo).id;
            await requestManager.updateChapterMeta({
                updateInput: { items: [{ chapterIds: [chapterId], metas: allUpdateMetas }] },
                deleteInput: { items: [{ chapterIds: [chapterId], keys: uniqueDeleteKeys }] },
                migrateInput: { items: [{ chapterIds: [chapterId], metas: migrateMetas }] },
            }).response;
            break;
        }
        case 'global':
            await requestManager.updateGlobalMeta({
                updateInput: { metas: allUpdateMetas },
                deleteInput: { keys: uniqueDeleteKeys },
                migrateInput: { metas: migrateMetas },
            }).response;
            break;
        case 'manga': {
            const mangaId = (metadataHolder as MangaIdInfo).id;
            await requestManager.updateMangaMeta({
                updateInput: { items: [{ mangaIds: [mangaId], metas: allUpdateMetas }] },
                deleteInput: { items: [{ mangaIds: [mangaId], keys: uniqueDeleteKeys }] },
                migrateInput: { items: [{ mangaIds: [mangaId], metas: migrateMetas }] },
            }).response;
            break;
        }
        case 'source': {
            const sourceId = (metadataHolder as SourceIdInfo).id;
            await requestManager.updateSourceMeta({
                updateInput: { items: [{ sourceIds: [sourceId], metas: allUpdateMetas }] },
                deleteInput: { items: [{ sourceIds: [sourceId], keys: uniqueDeleteKeys }] },
                migrateInput: { items: [{ sourceIds: [sourceId], metas: migrateMetas }] },
            }).response;
            break;
        }
        default:
            throw new Error(`requestMetadataUpdate: unknown holderType "${holderType}"`);
    }
};

export const requestServerMetadataUpdate = async (options: MetadataUpdateOptions): Promise<void> =>
    requestMetadataUpdate({}, 'global', options);

export const requestMangaMetadataUpdate = async (
    manga: MangaIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestMetadataUpdate(manga, 'manga', options);

export const requestChapterMetadataUpdate = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestMetadataUpdate(chapter, 'chapter', options);

export const requestCategoryMetadataUpdate = async (
    category: CategoryIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestMetadataUpdate(category, 'category', options);

export const requestSourceMetadataUpdate = async (
    source: SourceIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestMetadataUpdate(source, 'source', options);

export const getMetadataUpdateFunction = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (SourceIdInfo & MetadataHolder),
): ((options: MetadataUpdateOptions) => Promise<void>) => {
    switch (type) {
        case 'global':
            return (options) => requestServerMetadataUpdate(options);
        case 'manga':
            return (options) =>
                requestMangaMetadataUpdate(
                    { id: (metadataHolder as MangaIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    options,
                );
        case 'chapter':
            return (options) =>
                requestChapterMetadataUpdate(
                    { id: (metadataHolder as ChapterIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    options,
                );
        case 'category':
            return (options) =>
                requestCategoryMetadataUpdate(
                    { id: (metadataHolder as CategoryIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    options,
                );
        case 'source':
            return (options) =>
                requestSourceMetadataUpdate(
                    { id: (metadataHolder as SourceIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    options,
                );
        default:
            throw new Error(`Unexpected "type" (${type})`);
    }
};
