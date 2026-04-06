/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { LimitFunction } from 'p-limit';
import pLimit from 'p-limit';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import {
    type MigrateOptions,
    type MigrationEntry,
    type MigrationSearchResult,
    MigrationEntryStatus,
    MigrationPhase,
    type MigrationState,
} from '@/features/migration/Migration.types.ts';
import {
    DEFAULT_MIGRATION_STATE,
    MAX_MANGAS_IN_PARALLEL,
    MAX_SOURCES_IN_PARALLEL,
    MIGRATION_LOCAL_STORAGE_KEY,
} from '@/features/migration/Migration.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_MIGRATION_SOURCE_MANGAS_FETCH } from '@/lib/graphql/source/SourceMutation.ts';
import type {
    GetMigrationSourceMangasFetchMutation,
    GetMigrationSourceMangasFetchMutationVariables,
    GetServerSettingsQuery,
    GetServerSettingsQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { FetchSourceMangaType } from '@/lib/graphql/generated/graphql.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/settings/SettingsQuery.ts';
import { MangaMigration } from '@/features/migration/MangaMigration.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaHighestChapterNumberInfo,
    MangaIdInfo,
    MangaSourceIdInfo,
    MangaSourceNameInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
} from '@/features/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { t } from '@lingui/core/macro';
import { enhancedCleanup } from '@/base/utils/Strings.ts';
import { BrowseTab } from '@/features/browse/Browse.types.ts';

const RESUMABLE_PHASES = new Set<MigrationPhase>([MigrationPhase.SEARCHING, MigrationPhase.MIGRATING]);

const migrationStore = createStore<MigrationState>()(
    devtools(
        persist(
            immer(() => ({ ...DEFAULT_MIGRATION_STATE })),
            {
                name: MIGRATION_LOCAL_STORAGE_KEY,
                merge: (persistedState, currentState) => {
                    const persisted = persistedState as MigrationState | undefined;

                    if (!persisted || !RESUMABLE_PHASES.has(persisted.phase)) {
                        return currentState;
                    }

                    return { ...currentState, ...persisted };
                },
            },
        ),
    ),
);

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
            case MigrationPhase.ABORTED:
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

    static selectSource(sourceId: SourceIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECT_MANGAS;
            draft.sourceId = sourceId;
            draft.entries = {};
        });
        ReactRouter.navigate(AppRoutes.migrate.path);
    }

    static selectMangas(
        mangas: (MangaIdInfo &
            MangaTitleInfo &
            MangaSourceIdInfo &
            MangaThumbnailInfo &
            MangaArtistInfo &
            MangaAuthorInfo &
            MangaHighestChapterNumberInfo &
            Required<MangaSourceNameInfo>)[],
    ): void {
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
                        searchResults: [],
                        manualMatches: [],
                        selectedMatchMangaId: null,
                        selectedMatchSourceId: null,
                        isExcluded: false,
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
            draft.searchProgress = { completed: 0, total: entryIds.length };
            draft.startedAt = Date.now();
        });

        await MigrationManager.search(Object.values(state.entries));
    }

    private static async search(entries: MigrationEntry[]): Promise<void> {
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

    static async startMigration(options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>): Promise<void> {
        const state = MigrationManager.getState();
        const migratableEntries = Object.values(state.entries).filter(
            (entry): entry is NonNullableProperty<MigrationEntry, 'selectedMatchMangaId' | 'selectedMatchSourceId'> =>
                entry.status === MigrationEntryStatus.SEARCH_COMPLETE &&
                entry.selectedMatchMangaId != null &&
                entry.selectedMatchSourceId != null,
        );

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATING;
            draft.migrateOptions = options;
            draft.migrationProgress = { completed: 0, total: migratableEntries.length, failed: 0 };
        });

        await MigrationManager.migrate(migratableEntries, options);
    }

    private static async migrate(
        entries: NonNullableProperty<MigrationEntry, 'selectedMatchMangaId' | 'selectedMatchSourceId'>[],
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
                draft.phase = MigrationPhase.MIGRATION_COMPLETE;
                draft.lastUpdatedAt = Date.now();
            });
        }
    }

    static async abort(reason: unknown = 'abort'): Promise<boolean> {
        if (!(await MigrationManager.confirmAbort())) {
            return false;
        }

        MigrationManager.abortAndResetAbortController(reason);

        MigrationManager.updateState((draft) => {
            // Mark any in-progress entries back to their pre-action state
            for (const entry of Object.values(draft.entries)) {
                if (entry.status === MigrationEntryStatus.SEARCHING) {
                    entry.status = MigrationEntryStatus.PENDING;
                }
                if (entry.status === MigrationEntryStatus.MIGRATING) {
                    entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                }
            }
            draft.phase = MigrationPhase.ABORTED;
        });

        ReactRouter.navigate(AppRoutes.browse.path(BrowseTab.MIGRATE));

        return true;
    }

    static async resume(): Promise<void> {
        const state = MigrationManager.getState();

        const isResumeablePhase = [MigrationPhase.SEARCHING, MigrationPhase.MIGRATING].includes(state.phase);
        if (!isResumeablePhase) {
            return;
        }

        const resumeMigrationPhase = state.phase === MigrationPhase.MIGRATING && state.migrateOptions;
        if (resumeMigrationPhase) {
            assertIsDefined(state.migrateOptions);

            const migratableEntries = Object.values(state.entries).filter(
                (
                    entry,
                ): entry is NonNullableProperty<MigrationEntry, 'selectedMatchMangaId' | 'selectedMatchSourceId'> =>
                    entry.status === MigrationEntryStatus.SEARCH_COMPLETE &&
                    entry.selectedMatchMangaId != null &&
                    entry.selectedMatchSourceId != null,
            );

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

    static selectManualMatch(mangaId: MangaIdInfo['id'], match: MigrationSearchResult): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                const isExistingSearchResult = draft.entries[mangaId].searchResults.some(
                    (searchResult) => searchResult.id === match.id,
                );
                const isExistingManualMatch = draft.entries[mangaId].manualMatches.some(
                    (manualMatch) => manualMatch.id === match.id,
                );

                const isExistingEntry = isExistingSearchResult || isExistingManualMatch;
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
        return RESUMABLE_PHASES.has(MigrationManager.getState().phase);
    }

    private static async searchForManga(
        mangaId: MangaIdInfo['id'],
        mangaTitle: string,
        signal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];

        if (!entry) {
            return;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.SEARCHING;
        });

        try {
            const searchPromises = state.destinationSourceIds.map((destSourceId) =>
                MigrationManager.getParallelSourceQueue()(() => {
                    if (signal.aborted) {
                        return null;
                    }

                    return MigrationManager.getOrCreateSourceQueue(destSourceId)(() =>
                        requestManager.graphQLClient.client.mutate<
                            GetMigrationSourceMangasFetchMutation,
                            GetMigrationSourceMangasFetchMutationVariables
                        >({
                            mutation: GET_MIGRATION_SOURCE_MANGAS_FETCH,
                            variables: {
                                input: {
                                    source: destSourceId,
                                    query: entry.mangaTitle,
                                    page: 1,
                                    type: FetchSourceMangaType.Search,
                                },
                            },
                            context: { fetchOptions: { signal } },
                        }),
                    );
                }),
            );
            const searchResultPromises = await Promise.allSettled(searchPromises);

            const hasFulfilledSearch = searchResultPromises.some((result) => result.status === 'fulfilled');
            if (!hasFulfilledSearch) {
                throw new Error('All source searches failed');
            }

            const mangas = searchResultPromises
                .filter((result) => result.status === 'fulfilled')
                .flatMap((result) => result.value?.data?.fetchSourceManga?.mangas ?? []);

            MigrationManager.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                const matches = mangas.filter((manga) => enhancedCleanup(manga.title) === enhancedCleanup(mangaTitle));

                draftEntry.searchResults = matches.map((manga) => ({
                    id: manga.id,
                    title: manga.title,
                    artist: manga.artist,
                    author: manga.author,
                    latestChapterNumber: manga.highestNumberedChapter?.chapterNumber,
                    thumbnailUrl: manga.thumbnailUrl,
                    sourceId: manga.sourceId,
                    sourceTitle: manga.source?.displayName,
                }));

                if (matches.length > 0) {
                    draftEntry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                    draftEntry.selectedMatchMangaId = matches[0].id;
                    draftEntry.selectedMatchSourceId = matches[0].sourceId;
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
                draftEntry.error = error instanceof Error ? error.message : String(error);
                draft.searchProgress.completed += 1;
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
                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATED;
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
            });

            await MigrationManager.searchForManga(id, entry.mangaTitle, signal);
            return;
        }

        if (status === MigrationEntryStatus.MIGRATION_FAILED) {
            MigrationManager.updateState((draft) => {
                draft.migrationProgress.completed -= 1;
            });

            const migrationOptions = MigrationManager.getState().migrateOptions;
            assertIsDefined(migrationOptions);

            await MigrationManager.migrateSingleEntry(id, migrationOptions, signal);
        }
    }

    private static updateState(updater: (draft: MigrationState) => void): void {
        migrationStore.setState(updater);
    }

    static usePhase(): MigrationPhase {
        return useStore(migrationStore, (s) => s.phase);
    }

    static useSourceId(): SourceIdInfo['id'] | null {
        return useStore(migrationStore, (s) => s.sourceId);
    }

    static useEntries(): Record<number, MigrationEntry> {
        return useStore(migrationStore, (s) => s.entries);
    }

    static useSearchProgress(): MigrationState['searchProgress'] {
        return useStore(
            migrationStore,
            useShallow((s) => s.searchProgress),
        );
    }

    static useMigrationProgress(): MigrationState['migrationProgress'] {
        return useStore(
            migrationStore,
            useShallow((s) => s.migrationProgress),
        );
    }

    static useIsActive(): boolean {
        return useStore(
            migrationStore,
            (s) => s.phase === MigrationPhase.SEARCHING || s.phase === MigrationPhase.MIGRATING,
        );
    }
}
