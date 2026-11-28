/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { i18n } from '@lingui/core';
import { MigrationManager } from '@/controllers/migration/services/MigrationManager.ts';
import { MigrationEntryStatus } from '@/models/migration/Migration.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

i18n.loadAndActivate({ locale: 'en', messages: {} });

const manager = MigrationManager as any;

type SourceResult = { id: number; chapters: number; title?: string } | 'error';

// answers the source searches and the manga refreshes of the found matches
const fakeSources = (sources: Record<string, SourceResult>) => {
    const toManga = (sourceId: string) => {
        const result = sources[sourceId] as Exclude<SourceResult, 'error'>;

        return {
            id: result.id,
            title: result.title ?? 'Title',
            sourceId,
            highestNumberedChapter: { chapterNumber: result.chapters },
        };
    };

    spyOn(requestManager.graphQLClient.client, 'mutate').mockImplementation((async ({ variables }: any) => {
        const { source } = variables.input;
        if (sources[source] === 'error') {
            throw new Error(`source ${source} is down`);
        }

        return { data: { fetchSourceManga: { mangas: [toManga(source)] } } };
    }) as any);
    spyOn(requestManager, 'refreshManga').mockImplementation(((id: number) => {
        const sourceId = Object.keys(sources).find((key) => (sources[key] as { id?: number }).id === id)!;

        return {
            response: Promise.resolve({ data: { fetchMangaAndChapters: { manga: toManga(sourceId) } } }),
        };
    }) as any);
};

// runs the search of a single entry, the same way retrying a failed search does
const search = async (searchOptions: Record<string, boolean> = {}) => {
    manager.updateState((draft: any) => {
        draft.entries[1].status = MigrationEntryStatus.SEARCH_FAILED;
        draft.destinationSourceIds = ['a', 'b'];
        draft.searchOptions = searchOptions;
    });

    await MigrationManager.retryEntry(1);

    return MigrationManager.getState().entries[1];
};

beforeEach(() => {
    MigrationManager.reset();
    MigrationManager.selectSources(['0']);
    MigrationManager.selectMangas([
        { id: 1, title: 'Title', sourceId: '0', highestNumberedChapter: { chapterNumber: 15 } } as any,
    ]);
});

afterEach(() => MigrationManager.reset());

describe('search', () => {
    test('selects the match of the source with the highest priority', async () => {
        fakeSources({ a: { id: 100, chapters: 16 }, b: { id: 200, chapters: 30 } });

        const entry = await search();

        expect(entry.status).toBe(MigrationEntryStatus.SEARCH_COMPLETE);
        expect(entry.selectedMatchMangaId).toBe(100);
    });

    test('selects the match with the most chapters if requested', async () => {
        fakeSources({ a: { id: 100, chapters: 16 }, b: { id: 200, chapters: 30 } });

        const entry = await search({ selectHighestChapterNumberSource: true });

        expect(entry.selectedMatchMangaId).toBe(200);
    });

    test('keeps the match with the most chapters when a later source has fewer', async () => {
        fakeSources({ a: { id: 100, chapters: 30 }, b: { id: 200, chapters: 16 } });

        const entry = await search({ selectHighestChapterNumberSource: true });

        expect(entry.selectedMatchMangaId).toBe(100);
    });

    test('ignores results with a different title', async () => {
        fakeSources({ a: { id: 100, chapters: 16, title: 'Other' }, b: { id: 200, chapters: 16, title: 'Else' } });

        const entry = await search();

        expect(entry.status).toBe(MigrationEntryStatus.SEARCH_NO_MATCH);
    });

    test('marks matches without additional chapters as outdated if they are required', async () => {
        fakeSources({ a: { id: 100, chapters: 10 }, b: { id: 200, chapters: 15 } });

        const entry = await search({ requireAdditionalChapters: true });

        expect(entry.status).toBe(MigrationEntryStatus.SEARCH_OUTDATED);
        expect(entry.selectedMatchMangaId).toBeNull();
    });

    test('uses the other sources when one fails', async () => {
        fakeSources({ a: 'error', b: { id: 200, chapters: 16 } });

        const entry = await search();

        expect(entry.selectedMatchMangaId).toBe(200);
    });

    test('fails when all sources fail', async () => {
        fakeSources({ a: 'error', b: 'error' });

        const entry = await search();

        expect(entry.status).toBe(MigrationEntryStatus.SEARCH_FAILED);
        expect(entry.error).toBeDefined();
    });
});

test('retrying a failed migration does not report an error', async () => {
    const migrate = spyOn(manager, 'migrateSingleEntry').mockResolvedValue(undefined);
    manager.updateState((draft: any) => {
        draft.entries[1].status = MigrationEntryStatus.MIGRATION_FAILED;
        draft.migrateOptions = {};
    });

    await expect(MigrationManager.retryEntry(1)).resolves.toBeUndefined();
    expect(migrate).toHaveBeenCalledTimes(1);
});
