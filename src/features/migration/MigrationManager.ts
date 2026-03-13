/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { LimitFunction } from 'p-limit';
import pLimit from 'p-limit';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import {
    type MigratableEntry,
    type MigrateOptions,
    type TMigrationEntry,
    MigrationEntryStatus,
    MigrationPhase,
    type MigrationMatch,
    type MigrationState,
} from '@/features/migration/Migration.types.ts';
import {
    DEFAULT_MIGRATION_STATE,
    MAX_MANGAS_IN_PARALLEL,
    MAX_SOURCES_IN_PARALLEL,
    MIGRATE_EXECUTE_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
    MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
    MIGRATION_LOCAL_STORAGE_KEY,
} from '@/features/migration/Migration.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_MIGRATION_SOURCE_MANGAS_FETCH } from '@/lib/graphql/source/SourceMutation.ts';
import type {
    GetMigrationSourceMangasFetchMutation,
    GetMigrationSourceMangasFetchMutationVariables,
    GetServerSettingsQuery,
    GetServerSettingsQueryVariables,
    MangaMigrationFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import { FetchSourceMangaType } from '@/lib/graphql/generated/graphql.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/settings/SettingsQuery.ts';
import { MangaMigration } from '@/features/migration/MangaMigration.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { t } from '@lingui/core/macro';
import { enhancedCleanup } from '@/base/utils/Strings.ts';
import { BrowseTab } from '@/features/browse/Browse.types.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { MANGA_MIGRATION_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';
import { ZustandUtil } from '@/lib/zustand/ZustandUtil.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import isEqual from 'lodash/fp/isEqual';

const RESUMABLE_PHASES: readonly MigrationPhase[] = [MigrationPhase.SEARCHING, MigrationPhase.MIGRATING];

const migrationStore = create<MigrationState>()(
    devtools(
        persist(
            immer(() => ({ ...DEFAULT_MIGRATION_STATE })),
            {
                name: MIGRATION_LOCAL_STORAGE_KEY,
                merge: (persistedState, currentState) => {
                    const persisted = persistedState as MigrationState | undefined;

                    if (!persisted || !RESUMABLE_PHASES.includes(persisted.phase)) {
                        return currentState;
                    }

                    return { ...currentState, ...persisted };
                },
            },
        ),
    ),
);

const useMigrationStore = ZustandUtil.createStoreHook(migrationStore);

export class MigrationManager {
    private static abortController: AbortController | null = null;

    private static mangaProcessQueue = pLimit(MAX_MANGAS_IN_PARALLEL);
    private static parallelSourcesQueue: LimitFunction | undefined;
    private static queueBySource = new Map<string, LimitFunction>();

    private static abortAndResetAbortController(reason: unknown): void {
        MigrationManager.abortController?.abort(reason);
        MigrationManager.abortController = null;
    }

    private static abortAndCreateAbortController(abortReason: unknown): AbortController {
        MigrationManager.abortController?.abort(abortReason);
        MigrationManager.abortController = new AbortController();

        return MigrationManager.abortController;
    }

    private static getOrCreateAbortController(): AbortController {
        if (!MigrationManager.abortController) {
            MigrationManager.abortController = new AbortController();
        }

        return MigrationManager.abortController;
    }

    private static getParallelSourceQueue(): LimitFunction {
        if (MigrationManager.parallelSourcesQueue) {
            return MigrationManager.parallelSourcesQueue;
        }

        try {
            const result = requestManager.graphQLClient.client.readQuery<
                GetServerSettingsQuery,
                GetServerSettingsQueryVariables
            >({
                query: GET_SERVER_SETTINGS,
            });

            MigrationManager.parallelSourcesQueue = pLimit(
                result?.settings.maxSourcesInParallel ?? MAX_SOURCES_IN_PARALLEL,
            );
        } catch (error) {
            MigrationManager.parallelSourcesQueue = pLimit(MAX_SOURCES_IN_PARALLEL);
        }

        return MigrationManager.parallelSourcesQueue!;
    }

    private static getOrCreateSourceQueue(sourceId: SourceIdInfo['id']): LimitFunction {
        if (this.queueBySource.has(sourceId)) {
            return this.queueBySource.get(sourceId)!;
        }

        const queue = pLimit(1);
        this.queueBySource.set(sourceId, queue);

        return queue;
    }

    static async confirmAbort(): Promise<boolean> {
        try {
            return await Confirmation.show({
                title: t`Abort migration`,
                message: t`Are you sure you want to abort the migration?`,
            });
        } catch (e) {
            defaultPromiseErrorHandler('MigrationManager::abort')(e);
            return false;
        }
    }

    static async goToPreviousPhase(): Promise<boolean> {
        switch (MigrationManager.getState().phase) {
            case MigrationPhase.IDLE:
                return true;
            case MigrationPhase.SELECT_SOURCE:
                MigrationManager.updateState((draft) => {
                    draft.phase = MigrationPhase.IDLE;
                });

                return true;
            case MigrationPhase.SELECT_MANGAS:
                MigrationManager.updateState((draft) => {
                    draft.phase = MigrationPhase.SELECT_SOURCE;
                    draft.entries = {};
                });

                ReactRouter.navigate(AppRoutes.browse.path(BrowseTab.MIGRATE));
                return false;
            case MigrationPhase.SELECTING_SOURCES:
                MigrationManager.updateState((draft) => {
                    draft.phase = MigrationPhase.SELECT_MANGAS;
                    draft.destinationSourceIds = [];
                });

                return false;
            default:
                try {
                    await MigrationManager.abort('goToPreviousPhase');
                    return false;
                } catch (e) {
                    return false;
                }
        }
    }

    static isPhaseComplete(): boolean {
        const { phase } = MigrationManager.getState();

        switch (phase) {
            case MigrationPhase.SEARCHING:
                return (
                    MigrationManager.getState().searchProgress.completed ===
                    MigrationManager.getState().searchProgress.total
                );
            case MigrationPhase.MIGRATING:
                return (
                    MigrationManager.getState().migrationProgress.completed ===
                    MigrationManager.getState().migrationProgress.total
                );
            default:
                return false;
        }
    }

    private static getUpToDateSearchMatch(searchMatch: MigrationMatch): MigrationMatch {
        const cachedEntry = Mangas.getFromCache<MangaMigrationFieldsFragment>(
            searchMatch.id,
            MANGA_MIGRATION_FIELDS,
            'MANGA_MIGRATION_FIELDS',
        );

        return {
            id: cachedEntry?.id ?? searchMatch.id,
            title: cachedEntry?.title ?? searchMatch.title,
            thumbnailUrl: cachedEntry?.thumbnailUrl ?? searchMatch.thumbnailUrl,
            thumbnailUrlLastFetched: cachedEntry?.thumbnailUrlLastFetched ?? searchMatch.thumbnailUrlLastFetched,
            sourceId: cachedEntry?.sourceId ?? searchMatch.sourceId,
            artist: cachedEntry?.artist ?? searchMatch.artist,
            author: cachedEntry?.author ?? searchMatch.author,
            sourceTitle: cachedEntry?.source?.displayName ?? searchMatch.sourceTitle,
            latestChapterNumber: cachedEntry?.highestNumberedChapter?.chapterNumber ?? searchMatch.latestChapterNumber,
        };
    }

    static getUpToDateMigrationEntry(entry: TMigrationEntry): TMigrationEntry {
        const cachedEntry = Mangas.getFromCache<MangaMigrationFieldsFragment>(
            entry.mangaId,
            MANGA_MIGRATION_FIELDS,
            'MANGA_MIGRATION_FIELDS',
        );

        const updatedEntry = {
            mangaId: cachedEntry?.id ?? entry.mangaId,
            mangaTitle: cachedEntry?.title ?? entry.mangaTitle,
            mangaArtist: cachedEntry?.artist ?? entry.mangaArtist,
            mangaAuthor: cachedEntry?.author ?? entry.mangaAuthor,
            latestChapterNumber: cachedEntry?.highestNumberedChapter?.chapterNumber ?? entry.latestChapterNumber,
            mangaThumbnailUrl: cachedEntry?.thumbnailUrl ?? entry.mangaThumbnailUrl,
            sourceId: cachedEntry?.sourceId ?? entry.sourceId,
            sourceTitle: cachedEntry?.source?.displayName ?? entry.sourceTitle,
            status: entry.status,
            searchMatches: entry.searchMatches.map(MigrationManager.getUpToDateSearchMatch.bind(MigrationManager)),
            manualMatches: entry.manualMatches.map(MigrationManager.getUpToDateSearchMatch.bind(MigrationManager)),
            selectedMatchMangaId: entry.selectedMatchMangaId,
            selectedMatchSourceId: entry.selectedMatchSourceId,
            destSourceIdToSearchState: entry.destSourceIdToSearchState,
            error: entry.error,
            isExcluded: entry.isExcluded,
            areMatchesExpanded: entry.areMatchesExpanded,
        } satisfies TMigrationEntry;

        if (isEqual(entry, updatedEntry)) {
            return entry;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[entry.mangaId] = updatedEntry;
        });

        return updatedEntry;
    }

    static selectSource(sourceId: SourceIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECT_MANGAS;
            draft.sourceId = sourceId;
            draft.entries = {};
        });
        ReactRouter.navigate(AppRoutes.migrate.path);
    }

    static selectMangas(mangas: MangaMigrationFieldsFragment[]): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECTING_SOURCES;
            draft.entries = Object.fromEntries(
                mangas.map((manga) => [
                    manga.id,
                    {
                        mangaId: manga.id,
                        mangaTitle: manga.title,
                        mangaArtist: manga.artist,
                        mangaAuthor: manga.author,
                        latestChapterNumber: manga.highestNumberedChapter?.chapterNumber,
                        mangaThumbnailUrl: manga.thumbnailUrl,
                        sourceId: manga.sourceId,
                        sourceTitle: manga.source?.displayName,
                        status: MigrationEntryStatus.PENDING,
                        searchMatches: [],
                        manualMatches: [],
                        selectedMatchMangaId: null,
                        selectedMatchSourceId: null,
                        destSourceIdToSearchState: {},
                        isExcluded: false,
                        areMatchesExpanded: false,
                        error: undefined,
                    },
                ]),
            );
        });
    }

    static async startSearch(destinationSourceIds: SourceIdInfo['id'][]): Promise<void> {
        MigrationManager.updateState((draft) => {
            draft.destinationSourceIds = destinationSourceIds;
        });

        const state = MigrationManager.getState();
        const entryIds = Object.keys(state.entries).map(Number);

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SEARCHING;
            draft.searchProgress = { total: entryIds.length, completed: 0, success: 0, failed: 0 };
            draft.startedAt = Date.now();
            draft.groupExpandState = MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE;
        });

        try {
            await MigrationManager.search(Object.values(state.entries));
        } finally {
            const { searchProgress } = MigrationManager.getState();

            if (searchProgress.completed === searchProgress.total) {
                const allSearchesFailed = searchProgress.failed === searchProgress.total;

                MigrationManager.updateState((draft) => {
                    draft.groupExpandState = {
                        ...MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
                        [MigrationEntryStatus.SEARCHING]: false,
                        [MigrationEntryStatus.NO_MATCH]: !allSearchesFailed && !searchProgress.success,
                        [MigrationEntryStatus.SEARCH_FAILED]: allSearchesFailed,
                        [MigrationEntryStatus.SEARCH_COMPLETE]: !!searchProgress.success,
                    };
                });
            }
        }
    }

    private static async search(entries: TMigrationEntry[]): Promise<void> {
        const { signal } = MigrationManager.abortAndCreateAbortController('search');

        const searchPromises = entries.map((entry) =>
            MigrationManager.mangaProcessQueue(async () => {
                if (signal.aborted) {
                    return;
                }

                await MigrationManager.searchForManga(entry.mangaId, entry.mangaTitle, signal);
            }),
        );

        await Promise.allSettled(searchPromises);
    }

    static getMigratableEntries(): MigratableEntry[] {
        const { entries } = MigrationManager.getState();

        return Object.values(entries).filter(
            (entry): entry is MigratableEntry =>
                entry.status === MigrationEntryStatus.SEARCH_COMPLETE &&
                !entry.isExcluded &&
                entry.selectedMatchMangaId != null &&
                entry.selectedMatchSourceId != null,
        );
    }

    static async startMigration(options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>): Promise<void> {
        const migratableEntries = MigrationManager.getMigratableEntries();

        await Confirmation.show({
            title: t`Migration information`,
            message: t`The migration runs on the client on the current device, NOT the server.\nAs long as the client is open, the migration will run in the background.\nThe client can be closed. The migration will be resumed once it gets opened again on the same device it got started on.`,
            actions: {
                confirm: {
                    title: t`Understood`,
                },
            },
        });

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATING;
            draft.migrateOptions = options;
            draft.migrationProgress = { total: migratableEntries.length, completed: 0, success: 0, failed: 0 };
            draft.groupExpandState = MIGRATE_EXECUTE_ENTRY_GROUP_EXPAND_DEFAULT_STATE;
        });

        try {
            await MigrationManager.migrate(migratableEntries, options);
        } finally {
            const { migrationProgress } = MigrationManager.getState();

            if (migrationProgress.completed === migrationProgress.total) {
                MigrationManager.updateState((draft) => {
                    draft.groupExpandState = {
                        ...MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
                        [MigrationEntryStatus.MIGRATING]: false,
                        [MigrationEntryStatus.MIGRATION_FAILED]: !!migrationProgress.failed,
                        [MigrationEntryStatus.MIGRATION_COMPLETE]: !migrationProgress.failed,
                    };
                });
            }
        }
    }

    private static async migrate(
        entries: MigratableEntry[],
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
        const { signal } = MigrationManager.abortAndCreateAbortController('migrate');

        const entriesBySource = Object.groupBy(entries, (entry) => entry.selectedMatchSourceId);

        const migrationPromises = Object.values(entriesBySource).map((sourceEntries = []) =>
            MigrationManager.mangaProcessQueue(async () => {
                for (const entry of sourceEntries) {
                    if (signal.aborted) {
                        return;
                    }

                    // oxlint-disable-next-line no-await-in-loop
                    await MigrationManager.migrateSingleEntry(entry.mangaId, options, signal);
                }
            }),
        );
        await Promise.allSettled(migrationPromises);

        if (!signal.aborted) {
            MigrationManager.updateState((draft) => {
                draft.lastUpdatedAt = Date.now();
            });
        }
    }

    static async abort(reason: unknown = 'abort'): Promise<boolean> {
        if (!(await MigrationManager.confirmAbort())) {
            return false;
        }

        MigrationManager.abortAndResetAbortController(reason);

        MigrationManager.reset();

        ReactRouter.navigate(AppRoutes.browse.path(BrowseTab.MIGRATE));

        return true;
    }

    static async resume(): Promise<void> {
        const state = MigrationManager.getState();

        const isResumeablePhase = RESUMABLE_PHASES.includes(state.phase);
        if (!isResumeablePhase) {
            return;
        }

        const resumeMigrationPhase = state.phase === MigrationPhase.MIGRATING && state.migrateOptions;
        if (resumeMigrationPhase) {
            assertIsDefined(state.migrateOptions);

            const migratableEntries = MigrationManager.getMigratableEntries();

            await MigrationManager.migrate(migratableEntries, state.migrateOptions);

            return;
        }

        const pendingEntries = Object.values(state.entries).filter(
            (entry) => entry.status === MigrationEntryStatus.PENDING,
        );

        await MigrationManager.search(pendingEntries);
    }

    static reset(): void {
        MigrationManager.abortAndResetAbortController('reset');
        migrationStore.setState({ ...DEFAULT_MIGRATION_STATE });
    }

    static excludeManga(mangaId: MangaIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];

            if (entry) {
                entry.isExcluded = true;
            }
        });
    }

    static includeManga(mangaId: MangaIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];

            if (entry) {
                entry.isExcluded = false;
            }
        });
    }

    static selectMatch(
        mangaId: MangaIdInfo['id'],
        targetMangaId: MangaIdInfo['id'],
        targetSourceId: SourceIdInfo['id'],
    ): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                entry.selectedMatchMangaId = targetMangaId;
                entry.selectedMatchSourceId = targetSourceId;
                entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
            }
        });
    }

    static selectManualMatch(mangaId: MangaIdInfo['id'], match: MigrationMatch): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                const isExistingSearchMatch = draft.entries[mangaId].searchMatches.some(
                    (searchMatch) => searchMatch.id === match.id,
                );
                const isExistingManualMatch = draft.entries[mangaId].manualMatches.some(
                    (manualMatch) => manualMatch.id === match.id,
                );

                const isExistingEntry = isExistingSearchMatch || isExistingManualMatch;
                if (!isExistingEntry) {
                    draft.entries[mangaId].manualMatches = [...draft.entries[mangaId].manualMatches, match];
                }

                entry.selectedMatchMangaId = match.id;
                entry.selectedMatchSourceId = match.sourceId;
                entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
            }
        });
    }

    static getState(): MigrationState {
        return migrationStore.getState();
    }

    static isActive(): boolean {
        const { phase } = migrationStore.getState();
        return phase === MigrationPhase.SEARCHING || phase === MigrationPhase.MIGRATING;
    }

    static hasPausedMigration(): boolean {
        return RESUMABLE_PHASES.includes(MigrationManager.getState().phase);
    }

    private static getHigherPrioritySourceIds(sourceId: SourceIdInfo['id']): SourceIdInfo['id'][] {
        const { destinationSourceIds } = MigrationManager.getState();

        const sourceIdPriority = destinationSourceIds.indexOf(sourceId);
        return destinationSourceIds.slice(0, Math.max(0, sourceIdPriority - 1));
    }

    private static isHigherPrioritySourceUnsettled(mangaId: MangaIdInfo['id'], sourceId: SourceIdInfo['id']): boolean {
        const { entries } = MigrationManager.getState();
        const entry = entries[mangaId];

        assertIsDefined(entry);

        return MigrationManager.getHigherPrioritySourceIds(sourceId).some(
            (higherPrioritySourceId) => entry.destSourceIdToSearchState[higherPrioritySourceId] == null,
        );
    }

    private static hasHigherSourcePriorityMatch(mangaId: MangaIdInfo['id'], sourceId: SourceIdInfo['id']): boolean {
        const { entries } = MigrationManager.getState();
        const entry = entries[mangaId];

        if (!entry || entry.selectedMatchSourceId == null) {
            return false;
        }

        return MigrationManager.getHigherPrioritySourceIds(sourceId).some(
            (higherPrioritySourceId) => entry.destSourceIdToSearchState[higherPrioritySourceId],
        );
    }

    private static async findMatchesForMangaInSource(
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        sourceId: SourceIdInfo['id'],
        signal: AbortSignal,
    ): Promise<MangaMigrationFieldsFragment[]> {
        if (signal.aborted) {
            throw new Error(signal.reason);
        }

        return MigrationManager.getOrCreateSourceQueue(sourceId)(async () => {
            if (signal.aborted) {
                throw new Error(signal.reason);
            }

            if (MigrationManager.hasHigherSourcePriorityMatch(mangaId, sourceId)) {
                throw new Error('Entry already has a selected match from a higher priority source');
            }

            const searchResponse = await requestManager.graphQLClient.client.mutate<
                GetMigrationSourceMangasFetchMutation,
                GetMigrationSourceMangasFetchMutationVariables
            >({
                mutation: GET_MIGRATION_SOURCE_MANGAS_FETCH,
                variables: {
                    input: {
                        source: sourceId,
                        query: mangaTitle,
                        page: 1,
                        type: FetchSourceMangaType.Search,
                    },
                },
                context: { fetchOptions: { signal } },
            });

            const searchMatches = searchResponse?.data?.fetchSourceManga?.mangas ?? [];
            const matches = searchMatches.filter(
                (searchMatch) => enhancedCleanup(searchMatch.title) === enhancedCleanup(mangaTitle),
            );

            const matchUpdatePromises = matches.map(async (match) => {
                if (signal.aborted) {
                    throw new Error(signal.reason);
                }

                const updatedMatch = await requestManager.getMangaFetch(match.id).response;

                return updatedMatch.data?.fetchManga?.manga ?? match;
            });

            const updatedMatches = await Promise.all(matchUpdatePromises);

            return updatedMatches;
        });
    }

    private static async searchForManga(
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        mainSignal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];

        const searchController = new AbortController();
        const signal = AbortSignal.any([mainSignal, searchController.signal]);

        if (!entry) {
            return;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.SEARCHING;
        });

        try {
            const searchPromises = state.destinationSourceIds.map((destSourceId) =>
                MigrationManager.getParallelSourceQueue()(async () => {
                    if (signal.aborted) {
                        return null;
                    }

                    if (MigrationManager.hasHigherSourcePriorityMatch(mangaId, destSourceId)) {
                        return null;
                    }

                    const foundMatches = await (async () => {
                        try {
                            return await MigrationManager.findMatchesForMangaInSource(
                                mangaId,
                                mangaTitle,
                                destSourceId,
                                signal,
                            );
                        } catch (e) {
                            MigrationManager.updateState((draft) => {
                                const draftEntry = draft.entries[mangaId];

                                draftEntry.destSourceIdToSearchState[destSourceId] = false;
                            });

                            throw e;
                        }
                    })();

                    if (!foundMatches.length) {
                        MigrationManager.updateState((draft) => {
                            const draftEntry = draft.entries[mangaId];

                            draftEntry.destSourceIdToSearchState[destSourceId] = false;
                        });

                        return null;
                    }

                    MigrationManager.updateState((draft) => {
                        const draftEntry = draft.entries[mangaId];

                        const matches = foundMatches.map((manga) => ({
                            id: manga.id,
                            title: manga.title,
                            artist: manga.artist,
                            author: manga.author,
                            latestChapterNumber: manga.highestNumberedChapter?.chapterNumber,
                            thumbnailUrl: manga.thumbnailUrl,
                            sourceId: manga.sourceId,
                            sourceTitle: manga.source?.displayName,
                        }));

                        draftEntry.destSourceIdToSearchState[destSourceId] = true;

                        draftEntry.searchMatches = [...draftEntry.searchMatches, ...matches];

                        if (!MigrationManager.hasHigherSourcePriorityMatch(mangaId, destSourceId)) {
                            const matchesByChapterNumber = Object.groupBy(
                                matches,
                                (match) => match.latestChapterNumber ?? -1,
                            );
                            const latestChapterNumber = Math.max(
                                ...Object.keys(matchesByChapterNumber).map((chapterNumber) => Number(chapterNumber)),
                            );
                            const bestMatch = matchesByChapterNumber[latestChapterNumber]?.[0];

                            assertIsDefined(bestMatch);

                            draftEntry.selectedMatchMangaId = bestMatch.id;
                            draftEntry.selectedMatchSourceId = destSourceId;
                        }

                        if (!MigrationManager.isHigherPrioritySourceUnsettled(mangaId, destSourceId)) {
                            searchController.abort(`Found best match in source "${destSourceId}"`);
                        }
                    });
                }),
            );

            const searchMatchPromises = await Promise.allSettled(searchPromises);

            const hasFulfilledSearch = searchMatchPromises.some((result) => result.status === 'fulfilled');
            if (!hasFulfilledSearch) {
                throw new Error('All source searches failed');
            }

            MigrationManager.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                if (draftEntry.searchMatches.length) {
                    draft.searchProgress.success += 1;
                    draftEntry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                } else {
                    draftEntry.status = MigrationEntryStatus.NO_MATCH;
                }

                draft.searchProgress.completed += 1;
            });
        } catch (error) {
            if (signal.aborted) {
                return;
            }

            MigrationManager.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                draftEntry.status = MigrationEntryStatus.SEARCH_FAILED;
                draftEntry.error = getErrorMessage(error);
                draft.searchProgress.completed += 1;
                draft.searchProgress.failed += 1;
            });
        }
    }

    private static async migrateSingleEntry(
        mangaId: MangaIdInfo['id'],
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
        signal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];

        if (!entry || !entry.selectedMatchSourceId || entry.selectedMatchMangaId == null) {
            return;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.MIGRATING;
        });

        try {
            if (signal.aborted) {
                return;
            }

            await MigrationManager.getParallelSourceQueue()(() =>
                MigrationManager.getOrCreateSourceQueue(entry.sourceId)(() => {
                    assertIsDefined(entry.selectedMatchSourceId);

                    return MigrationManager.getOrCreateSourceQueue(entry.selectedMatchSourceId)(async () => {
                        if (signal.aborted) {
                            return;
                        }

                        assertIsDefined(entry.selectedMatchMangaId);
                        await MangaMigration.migrate(mangaId, entry.selectedMatchMangaId, options);
                    });
                }),
            );

            MigrationManager.updateState((draft) => {
                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATION_COMPLETE;
                draft.migrationProgress.success += 1;
                draft.migrationProgress.completed += 1;
            });
        } catch (error) {
            if (signal.aborted) {
                return;
            }

            MigrationManager.updateState((draft) => {
                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATION_FAILED;
                draft.entries[mangaId].error = error instanceof Error ? error.message : String(error);
                draft.migrationProgress.failed += 1;
                draft.migrationProgress.completed += 1;
            });
        }
    }

    static async retryEntry(id: MangaIdInfo['id']): Promise<void> {
        const entry = MigrationManager.getState().entries[id];

        if (!entry) {
            return;
        }

        const { signal } = MigrationManager.getOrCreateAbortController();
        const { status } = entry;

        if (status === MigrationEntryStatus.SEARCH_FAILED) {
            MigrationManager.updateState((draft) => {
                draft.searchProgress.completed -= 1;
                draft.searchProgress.failed -= 1;
            });

            await MigrationManager.searchForManga(id, entry.mangaTitle, signal);
            return;
        }

        if (status === MigrationEntryStatus.MIGRATION_FAILED) {
            MigrationManager.updateState((draft) => {
                draft.migrationProgress.completed -= 1;
                draft.migrationProgress.failed -= 1;
            });

            const migrationOptions = MigrationManager.getState().migrateOptions;
            assertIsDefined(migrationOptions);

            await MigrationManager.migrateSingleEntry(id, migrationOptions, signal);
        }
    }

    private static updateState(updater: (draft: MigrationState) => void): void {
        migrationStore.setState(updater);
    }

    static setEntryMatchesExpandState(id: MangaIdInfo['id'], expanded: boolean): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[id];

            if (entry) {
                entry.areMatchesExpanded = expanded;
            }
        });
    }

    static useEntryMatchesExpandState(id: MangaIdInfo['id']): boolean {
        return useMigrationStore((state) => state.entries[id]?.areMatchesExpanded ?? false);
    }

    static setGroupExpandState(status: MigrationEntryStatus, expanded: boolean): void {
        MigrationManager.updateState((draft) => {
            draft.groupExpandState[status] = expanded;
        });
    }

    static useGroupExpandState(status: MigrationEntryStatus): boolean {
        return useMigrationStore((state) => state.groupExpandState[status] ?? false);
    }

    static usePhase(): MigrationPhase {
        return useMigrationStore((state) => state.phase);
    }

    static useSourceId(): SourceIdInfo['id'] | null {
        return useMigrationStore((state) => state.sourceId);
    }

    static useEntries(): Record<number, TMigrationEntry> {
        return useMigrationStore((state) => state.entries);
    }

    static useSearchProgress(): MigrationState['searchProgress'] {
        return useMigrationStore((state) => state.searchProgress);
    }

    static useMigrationProgress(): MigrationState['migrationProgress'] {
        return useMigrationStore((state) => state.migrationProgress);
    }

    static useIsActive(): boolean {
        // Listen to phase changes
        MigrationManager.usePhase();

        return MigrationManager.isActive();
    }
}
