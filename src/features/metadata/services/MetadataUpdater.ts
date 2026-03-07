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

type ProcessedEntityMetadata = {
    updateMetas: MetaInput[];
    postUpdateDeleteKeys: string[];
    migrateMetas: MetaInput[];
};

const processEntityMetadata = (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    {
        update: keysToValues = [],
        delete: keysToDelete = [],
        migrate: keysToMigrate = [],
        keyPrefixes,
        isMetadataKey = false,
    }: MetadataUpdateOptions,
): ProcessedEntityMetadata => {
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

    return { updateMetas: allUpdateMetas, postUpdateDeleteKeys: uniqueDeleteKeys, migrateMetas };
};

type ProcessedEntry = ProcessedEntityMetadata & { metadataHolder: GqlMetaHolder };

const groupByIdenticalMetas = <Id extends number | string>(
    processed: Array<ProcessedEntry & { metadataHolder: { id: Id } }>,
): {
    updateGroups: Array<{ ids: Id[]; metas: MetaInput[] }>;
    postUpdateDeleteGroups: Array<{ ids: Id[]; keys: string[] }>;
    migrateGroups: Array<{ ids: Id[]; metas: MetaInput[] }>;
} => {
    const updateMap = new Map<string, { ids: Id[]; metas: MetaInput[] }>();
    const postUpdateDeleteMap = new Map<string, { ids: Id[]; keys: string[] }>();
    const migrateMap = new Map<string, { ids: Id[]; metas: MetaInput[] }>();

    for (const entry of processed) {
        const { id } = entry.metadataHolder;

        if (entry.updateMetas.length > 0) {
            const key = JSON.stringify(entry.updateMetas);
            const existing = updateMap.get(key);
            if (existing) {
                existing.ids.push(id);
            } else {
                updateMap.set(key, { ids: [id], metas: entry.updateMetas });
            }
        }

        if (entry.postUpdateDeleteKeys.length > 0) {
            const key = JSON.stringify(entry.postUpdateDeleteKeys);
            const existing = postUpdateDeleteMap.get(key);
            if (existing) {
                existing.ids.push(id);
            } else {
                postUpdateDeleteMap.set(key, { ids: [id], keys: entry.postUpdateDeleteKeys });
            }
        }

        if (entry.migrateMetas.length > 0) {
            const key = JSON.stringify(entry.migrateMetas);
            const existing = migrateMap.get(key);
            if (existing) {
                existing.ids.push(id);
            } else {
                migrateMap.set(key, { ids: [id], metas: entry.migrateMetas });
            }
        }
    }

    return {
        updateGroups: [...updateMap.values()],
        postUpdateDeleteGroups: [...postUpdateDeleteMap.values()],
        migrateGroups: [...migrateMap.values()],
    };
};

const createEntityMetaInput = <Key extends string, Id extends number | string>(
    processed: ProcessedEntry[],
    idKey: Key,
) => {
    const { updateGroups, postUpdateDeleteGroups, migrateGroups } = groupByIdenticalMetas(
        processed as Array<ProcessedEntry & { metadataHolder: { id: Id } }>,
    );

    return {
        preUpdateDeleteInput: {
            items: [],
        },
        updateInput: {
            items: updateGroups.map(
                ({ ids, metas }) => ({ [idKey]: ids, metas }) as Record<Key, Id[]> & { metas: MetaInput[] },
            ),
        },
        postUpdateDeleteInput: {
            items: postUpdateDeleteGroups.map(
                ({ ids, keys }) => ({ [idKey]: ids, keys }) as Record<Key, Id[]> & { keys: string[] },
            ),
        },
        migrateInput: {
            items: migrateGroups.map(
                ({ ids, metas }) => ({ [idKey]: ids, metas }) as Record<Key, Id[]> & { metas: MetaInput[] },
            ),
        },
    };
};

const requestBatchMetadataUpdate = async (
    holderType: MetadataHolderType,
    entries: Array<{ metadataHolders: GqlMetaHolder[]; options: MetadataUpdateOptions }>,
): Promise<void> => {
    if (entries.length === 0) return;

    const processed = entries.flatMap(({ metadataHolders, options }) =>
        metadataHolders.map((metadataHolder) => ({
            metadataHolder,
            ...processEntityMetadata(metadataHolder, holderType, options),
        })),
    );

    switch (holderType) {
        case 'global': {
            const withUpdates = processed.filter(({ updateMetas }) => updateMetas.length > 0);
            const withDeletes = processed.filter(({ postUpdateDeleteKeys }) => postUpdateDeleteKeys.length > 0);
            const withMigrations = processed.filter(({ migrateMetas }) => migrateMetas.length > 0);

            await requestManager.updateGlobalMeta({
                preUpdateDeleteInput: { keys: [] },
                updateInput: { metas: withUpdates.flatMap(({ updateMetas }) => updateMetas) },
                postUpdateDeleteInput: {
                    keys: withDeletes.flatMap(({ postUpdateDeleteKeys }) => postUpdateDeleteKeys),
                },
                migrateInput: { metas: withMigrations.flatMap(({ migrateMetas }) => migrateMetas) },
            }).response;
            break;
        }
        case 'category':
            await requestManager.updateCategoryMeta(
                createEntityMetaInput<'categoryIds', number>(processed, 'categoryIds'),
            ).response;
            break;
        case 'chapter':
            await requestManager.updateChapterMeta(createEntityMetaInput<'chapterIds', number>(processed, 'chapterIds'))
                .response;
            break;
        case 'manga':
            await requestManager.updateMangaMeta(createEntityMetaInput<'mangaIds', number>(processed, 'mangaIds'))
                .response;
            break;
        case 'source':
            await requestManager.updateSourceMeta(createEntityMetaInput<'sourceIds', string>(processed, 'sourceIds'))
                .response;
            break;
        default:
            throw new Error(`requestBatchMetadataUpdate: unknown holderType "${holderType}"`);
    }
};

export const requestBatchServerMetadataUpdate = async (
    entries: Array<{ options: MetadataUpdateOptions }>,
): Promise<void> =>
    requestBatchMetadataUpdate(
        'global',
        entries.map(({ options }) => ({ metadataHolders: [{}], options })),
    );

export const requestBatchMangaMetadataUpdate = async (
    entries: Array<{ mangas: (MangaIdInfo & GqlMetaHolder)[]; options: MetadataUpdateOptions }>,
): Promise<void> =>
    requestBatchMetadataUpdate(
        'manga',
        entries.map(({ mangas, options }) => ({ metadataHolders: mangas, options })),
    );

export const requestBatchChapterMetadataUpdate = async (
    entries: Array<{ chapters: (ChapterIdInfo & GqlMetaHolder)[]; options: MetadataUpdateOptions }>,
): Promise<void> =>
    requestBatchMetadataUpdate(
        'chapter',
        entries.map(({ chapters, options }) => ({ metadataHolders: chapters, options })),
    );

export const requestBatchCategoryMetadataUpdate = async (
    entries: Array<{ categories: (CategoryIdInfo & GqlMetaHolder)[]; options: MetadataUpdateOptions }>,
): Promise<void> =>
    requestBatchMetadataUpdate(
        'category',
        entries.map(({ categories, options }) => ({ metadataHolders: categories, options })),
    );

export const requestBatchSourceMetadataUpdate = async (
    entries: Array<{ sources: (SourceIdInfo & GqlMetaHolder)[]; options: MetadataUpdateOptions }>,
): Promise<void> =>
    requestBatchMetadataUpdate(
        'source',
        entries.map(({ sources, options }) => ({ metadataHolders: sources, options })),
    );

export const requestServerMetadataUpdate = async (options: MetadataUpdateOptions): Promise<void> =>
    requestBatchServerMetadataUpdate([{ options }]);

export const requestMangaMetadataUpdate = async (
    manga: MangaIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestBatchMangaMetadataUpdate([{ mangas: [manga], options }]);

export const requestChapterMetadataUpdate = async (
    chapter: ChapterIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestBatchChapterMetadataUpdate([{ chapters: [chapter], options }]);

export const requestCategoryMetadataUpdate = async (
    category: CategoryIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestBatchCategoryMetadataUpdate([{ categories: [category], options }]);

export const requestSourceMetadataUpdate = async (
    source: SourceIdInfo & GqlMetaHolder,
    options: MetadataUpdateOptions,
): Promise<void> => requestBatchSourceMetadataUpdate([{ sources: [source], options }]);

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
