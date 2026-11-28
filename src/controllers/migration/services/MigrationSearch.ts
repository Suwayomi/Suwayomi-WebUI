/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type {
    EntrySourceSearchResult,
    MigrationBulkSearchSettings,
    MigrationState,
} from '@/models/migration/Migration.types.ts';
import { MigrationEntryStatus } from '@/models/migration/Migration.types.ts';
import { MigrationSourceQueues } from '@/controllers/migration/services/MigrationSourceQueues.ts';
import { MigrationEntries } from '@/controllers/migration/services/MigrationEntries.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_MIGRATION_SOURCE_MANGAS_FETCH } from '@/lib/graphql/source/SourceMutation.ts';
import type {
    GetMigrationSourceMangasFetchMutation,
    GetMigrationSourceMangasFetchMutationVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { FetchSourceMangaType } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { MangaIdInfo } from '@/models/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/models/source/Source.types.ts';
import { assertIsDefined } from '@/utils/base/Asserts.ts';
import { enhancedCleanup } from '@/utils/base/Strings.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Chapters } from '@/controllers/chapter/services/Chapters.ts';
import uniqBy from 'lodash/fp/uniqBy';
import mapValues from 'lodash/fp/mapValues';

type MigrationSearchContext = {
    getState: () => MigrationState;
    updateState: (updater: (draft: MigrationState) => void) => void;
    abortControllerByManga: Map<MangaIdInfo['id'], AbortController>;
};

// finds the matches of a manga in the destination sources and selects the preferred one
export class MigrationSearch {
    constructor(private readonly context: MigrationSearchContext) {}

    private getDestinationSourceIds(mangaSourceId: SourceIdInfo['id']): MigrationState['destinationSourceIds'] {
        const { sourceIds, destinationSourceIds } = this.context.getState();

        // Prevent (most likely) unintentionally matching a manga to itself.
        const isMultiSourceMigration = (sourceIds?.length ?? -1) > 1;
        if (isMultiSourceMigration) {
            const mangaSourceIdIndex = destinationSourceIds.indexOf(mangaSourceId);

            return [
                ...destinationSourceIds.slice(0, mangaSourceIdIndex),
                ...destinationSourceIds.slice(mangaSourceIdIndex + 1),
                mangaSourceId,
            ];
        }

        return destinationSourceIds;
    }

    public getSourcePriority(mangaSourceId: SourceIdInfo['id'], sourceId: SourceIdInfo['id']): number {
        const destinationSourceIds = this.getDestinationSourceIds(mangaSourceId);

        return destinationSourceIds.indexOf(sourceId);
    }

    private getHigherPrioritySourceIds(
        mangaSourceId: SourceIdInfo['id'],
        destSourceId: SourceIdInfo['id'],
    ): SourceIdInfo['id'][] {
        const destinationSourceIds = this.getDestinationSourceIds(mangaSourceId);

        const sourceIdPriority = destinationSourceIds.indexOf(destSourceId);
        return destinationSourceIds.slice(0, Math.max(0, sourceIdPriority));
    }

    private isHigherPrioritySourceUnsettled(mangaId: MangaIdInfo['id'], destSourceId: SourceIdInfo['id']): boolean {
        const { entries } = this.context.getState();
        const entry = entries[mangaId];

        assertIsDefined(entry);

        return this.getHigherPrioritySourceIds(entry.sourceId, destSourceId).some(
            (higherPrioritySourceId) => entry.destSourceIdToSearchState[higherPrioritySourceId] == null,
        );
    }

    private hasHigherSourcePriorityMatch(mangaId: MangaIdInfo['id'], destSourceId: SourceIdInfo['id']): boolean {
        const { entries } = this.context.getState();
        const entry = entries[mangaId];

        if (!entry || entry.selectedMatchSourceId == null) {
            return false;
        }

        return this.getHigherPrioritySourceIds(entry.sourceId, destSourceId).some(
            (higherPrioritySourceId) => entry.destSourceIdToSearchState[higherPrioritySourceId],
        );
    }

    private async findMatchesForMangaInSource(
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        sourceId: SourceIdInfo['id'],
        signal: AbortSignal,
        { selectHighestChapterNumberSource, performAdvancedSearch }: MigrationBulkSearchSettings,
    ): Promise<EntrySourceSearchResult[]> {
        signal.throwIfAborted();

        if (!selectHighestChapterNumberSource && this.hasHigherSourcePriorityMatch(mangaId, sourceId)) {
            throw new Error('Entry already has a selected match from a higher priority source');
        }

        const searchQueries = performAdvancedSearch
            ? [
                  mangaTitle,
                  ...enhancedCleanup(mangaTitle)
                      .split(' ')
                      .filter((query) => query.length >= 3),
              ]
            : [mangaTitle];

        const searchRequests = searchQueries.map((query) =>
            MigrationSourceQueues.getOrCreateSourceQueue(sourceId)(() =>
                requestManager.graphQLClient.client.mutate<
                    GetMigrationSourceMangasFetchMutation,
                    GetMigrationSourceMangasFetchMutationVariables
                >({
                    mutation: GET_MIGRATION_SOURCE_MANGAS_FETCH,
                    variables: {
                        input: {
                            source: sourceId,
                            query,
                            page: 1,
                            type: FetchSourceMangaType.Search,
                        },
                    },
                    context: { fetchOptions: { signal } },
                }),
            ),
        );

        const searchResponses = await Promise.allSettled(searchRequests);
        const successfulSearchResponses = searchResponses
            .filter((response) => response.status === 'fulfilled')
            .map((response) => response.value);

        if (!successfulSearchResponses.length) {
            const failureReasons = searchResponses.map((response) => (response as PromiseRejectedResult).reason);

            throw new Error(`Search failed due to:${failureReasons.join('\n\n')}`);
        }

        const searchResults = successfulSearchResponses.flatMap(
            (response) => response?.data?.fetchSourceManga?.mangas ?? [],
        );
        const uniqueSearchResults = uniqBy('id', searchResults);
        const matches = uniqueSearchResults.filter(
            (searchMatch) =>
                searchMatch.id !== mangaId && enhancedCleanup(searchMatch.title) === enhancedCleanup(mangaTitle),
        );

        const matchUpdatePromises = matches.map(async (match) => {
            signal.throwIfAborted();

            return (async () => {
                try {
                    const updatedMatch = await MigrationSourceQueues.getOrCreateSourceQueue(sourceId)(
                        () =>
                            requestManager.refreshManga(match.id, {
                                awaitRefetchQueries: true,
                                context: { fetchOptions: { signal } },
                            }).response,
                    );

                    if (updatedMatch.data?.fetchMangaAndChapters?.manga) {
                        return {
                            manga: updatedMatch.data.fetchMangaAndChapters.manga,
                            chapters: updatedMatch.data.fetchMangaAndChapters?.chapters ?? null,
                        };
                    }
                } catch {
                    // ignore
                }

                return {
                    manga: match,
                    chapters: null,
                };
            })();
        });

        const updatedMatches = await Promise.all(matchUpdatePromises);

        return updatedMatches;
    }

    private updateEntrySearchState(
        mangaId: MangaIdInfo['id'],
        sourceId: SourceIdInfo['id'],
        foundMatches: EntrySourceSearchResult[],
        {
            selectHighestChapterNumberSource,
            ignoreOutdatedMatches,
            requireAdditionalChapters,
            ignoreWithMissingChapters,
        }: MigrationBulkSearchSettings,
    ): void {
        this.context.updateState((draft) => {
            const draftEntry = draft.entries[mangaId];
            const newMatches = foundMatches.filter((newMatch) =>
                draftEntry.searchMatches.every((existingMatch) => newMatch.manga.id !== existingMatch.id),
            );
            const matches = newMatches.map(({ manga, chapters }) => ({
                id: manga.id,
                title: manga.title,
                artist: manga.artist,
                author: manga.author,
                latestChapterNumber: manga.highestNumberedChapter?.chapterNumber,
                thumbnailUrl: manga.thumbnailUrl,
                sourceId: manga.sourceId,
                sourceTitle: manga.source?.displayName,
                missingChapters: chapters ? Chapters.getMissingCount(chapters) : undefined,
                inLibrary: manga.inLibrary,
            }));

            draftEntry.destSourceIdToSearchState[sourceId] = true;
            draftEntry.searchMatches = [...draftEntry.searchMatches, ...matches];
            const draftMatchEntry = draftEntry.searchMatches.find(
                (match) => match.id === draftEntry.selectedMatchMangaId,
            );

            const matchesByChapterNumber = Object.groupBy(matches, (match) => match.latestChapterNumber ?? -1);
            const latestChapterNumber = Math.max(
                ...Object.keys(matchesByChapterNumber).map((chapterNumber) => Number(chapterNumber)),
            );
            const bestMatch = matchesByChapterNumber[latestChapterNumber]?.[0];

            assertIsDefined(bestMatch);

            const entryLatestChapterNumber = draftEntry.latestChapterNumber ?? Number.MIN_SAFE_INTEGER;
            const selectedMatchLatestChapterNumber = draftMatchEntry?.latestChapterNumber ?? Number.MIN_SAFE_INTEGER;

            const hasNewerChapterVsEntry = latestChapterNumber > entryLatestChapterNumber;
            const hasNewerChapterVsSelectedMatch = latestChapterNumber > selectedMatchLatestChapterNumber;
            const hasNewerChapter = hasNewerChapterVsEntry && hasNewerChapterVsSelectedMatch;

            const isOutdated = latestChapterNumber < entryLatestChapterNumber;

            const hasSameLatestChapterAsSelectedMatch =
                !!draftMatchEntry && selectedMatchLatestChapterNumber === latestChapterNumber;

            const hasHigherSourcePriority = !this.hasHigherSourcePriorityMatch(mangaId, sourceId);

            const ignoreOutdatedMatch = ignoreOutdatedMatches && isOutdated;
            const satisfiesRequireAdditionalChapters = !requireAdditionalChapters || hasNewerChapter;
            const ignoreBecauseMissingChapters = ignoreWithMissingChapters && !!bestMatch.missingChapters;
            const isPreferredSourcePriorityMatch = hasHigherSourcePriority && !selectHighestChapterNumberSource;
            const isPreferredChapterNumberMatch =
                selectHighestChapterNumberSource &&
                (hasNewerChapter ||
                    (hasHigherSourcePriority && hasSameLatestChapterAsSelectedMatch) ||
                    !draftMatchEntry);

            const isPreferredMatch =
                !draftEntry.isManualSelection &&
                !ignoreOutdatedMatch &&
                satisfiesRequireAdditionalChapters &&
                !ignoreBecauseMissingChapters &&
                (isPreferredSourcePriorityMatch || isPreferredChapterNumberMatch);
            if (isPreferredMatch) {
                draftEntry.selectedMatchMangaId = bestMatch.id;
                draftEntry.selectedMatchSourceId = sourceId;
            }
        });
    }

    private async searchForMangaInSource(
        sourceId: SourceIdInfo['id'],
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        signal: AbortSignal,
        searchController: AbortController,
        options: MigrationBulkSearchSettings,
    ): Promise<void> {
        const { selectHighestChapterNumberSource } = options;

        signal.throwIfAborted();

        if (!selectHighestChapterNumberSource && this.hasHigherSourcePriorityMatch(mangaId, sourceId)) {
            return;
        }

        const foundMatches = await (async () => {
            try {
                return await this.findMatchesForMangaInSource(mangaId, mangaTitle, sourceId, signal, options);
            } catch (e) {
                this.context.updateState((draft) => {
                    const draftEntry = draft.entries[mangaId];

                    draftEntry.destSourceIdToSearchState[sourceId] = false;
                });

                throw e;
            }
        })();

        if (!foundMatches.length) {
            this.context.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                draftEntry.destSourceIdToSearchState[sourceId] = false;
            });

            return;
        }

        this.updateEntrySearchState(mangaId, sourceId, foundMatches, options);

        if (!selectHighestChapterNumberSource && !this.isHigherPrioritySourceUnsettled(mangaId, sourceId)) {
            searchController.abort(`Found best match in source "${sourceId}"`);
        }
    }

    public async searchForManga(
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        mainSignal: AbortSignal,
        options: MigrationBulkSearchSettings,
    ): Promise<void> {
        const state = this.context.getState();
        const entry = state.entries[mangaId];

        const searchController = new AbortController();
        const signal = AbortSignal.any([mainSignal, searchController.signal]);

        if (!entry || MigrationEntries.hasStatus(entry, MigrationEntryStatus.SEARCH_ABORTED)) {
            return;
        }

        this.context.abortControllerByManga.get(mangaId)?.abort('search');
        this.context.abortControllerByManga.set(mangaId, searchController);

        this.context.updateState((draft) => {
            const draftEntry = draft.entries[mangaId];

            draftEntry.status = MigrationEntryStatus.SEARCHING;
            draftEntry.error = undefined;
            draftEntry.searchMatches = [];
            draftEntry.manualMatches = [];
            draftEntry.isManualSelection = false;
            draftEntry.selectedMatchMangaId = null;
            draftEntry.selectedMatchSourceId = null;
            draftEntry.areMatchesExpanded = false;
            draftEntry.destSourceIdToSearchState = mapValues(() => false, draftEntry.destSourceIdToSearchState);
        });

        try {
            const searchPromises = this.getDestinationSourceIds(entry.sourceId)
                .filter((destSourceId) => !entry.destSourceIdToSearchState[destSourceId])
                .map((destSourceId) =>
                    MigrationSourceQueues.getParallelSourceQueue()(async () =>
                        this.searchForMangaInSource(
                            destSourceId,
                            mangaId,
                            mangaTitle,
                            signal,
                            searchController,
                            options,
                        ),
                    ),
                );

            const searchMatchPromises = await Promise.allSettled(searchPromises);

            const hasFulfilledSearch = searchMatchPromises.some((result) => result.status === 'fulfilled');
            if (!hasFulfilledSearch) {
                throw new Error('All source searches failed');
            }

            this.context.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                if (!MigrationEntries.isSearching(draftEntry)) {
                    return;
                }

                if (draftEntry.searchMatches.length) {
                    if (draftEntry.selectedMatchMangaId != null) {
                        draftEntry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                    } else {
                        draftEntry.status = MigrationEntryStatus.SEARCH_OUTDATED;
                    }
                } else {
                    draftEntry.status = MigrationEntryStatus.SEARCH_NO_MATCH;
                }
            });
        } catch (error) {
            if (mainSignal.aborted) {
                return;
            }

            this.context.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                if (!MigrationEntries.hasStatus(draftEntry, MigrationEntryStatus.SEARCH_ABORTED)) {
                    draftEntry.status = MigrationEntryStatus.SEARCH_FAILED;
                    draftEntry.error = getErrorMessage(error);
                }
            });
        } finally {
            this.context.abortControllerByManga.delete(mangaId);
        }
    }
}
