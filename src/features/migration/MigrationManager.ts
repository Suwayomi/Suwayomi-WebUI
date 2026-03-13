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
import { persist } from 'zustand/middleware';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import {
    MigrationPhase,
    MigrationEntryStatus,
    type MigrationState,
    type MigrationEntry,
    type MigrateOptions,
} from '@/features/migration/Migration.types.ts';
import {
    DEFAULT_MIGRATION_STATE,
    MAX_MANGAS_IN_PARALLEL,
    MAX_SOURCES_IN_PARALLEL,
    MIGRATION_LOCAL_STORAGE_KEY,
} from '@/features/migration/Migration.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_SOURCE_MANGAS_FETCH } from '@/lib/graphql/source/SourceMutation.ts';
import type {
    GetSourceMangasFetchMutation,
    GetSourceMangasFetchMutationVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { FetchSourceMangaType } from '@/lib/graphql/generated/graphql.ts';
import { MangaMigration } from '@/features/migration/MangaMigration.ts';
import type {
    MangaIdInfo,
    MangaSourceIdInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
} from '@/features/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { assertIsDefined } from '@/base/Asserts.ts';

const RESUMABLE_PHASES = new Set<MigrationPhase>([MigrationPhase.SEARCHING, MigrationPhase.MIGRATING]);

const migrationStore = createStore<MigrationState>()(
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
);

export class MigrationManager {
    private static abortController: AbortController | null = null;

    private static mangaProcessQueue = pLimit(MAX_MANGAS_IN_PARALLEL);
    private static parallelSourcesQueue = pLimit(MAX_SOURCES_IN_PARALLEL);
    private static queueBySource = new Map<string, LimitFunction>();

    private static getOrCreateSourceQueue(sourceId: SourceIdInfo['id']): LimitFunction {
        if (this.queueBySource.has(sourceId)) {
            return this.queueBySource.get(sourceId)!;
        }

        const queue = pLimit(1);
        this.queueBySource.set(sourceId, queue);

        return queue;
    }

    static selectSource(sourceId: string): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECT_MANGAS;
            draft.sourceId = sourceId;
            draft.entries = {};
        });
    }

    static selectMangas(mangas: (MangaIdInfo & MangaTitleInfo & MangaSourceIdInfo & MangaThumbnailInfo)[]): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECTING_SOURCES;
            draft.entries = Object.fromEntries(
                mangas.map((manga) => [
                    manga.id,
                    {
                        mangaId: manga.id,
                        mangaTitle: manga.title,
                        mangaThumbnailUrl: manga.thumbnailUrl,
                        sourceId: manga.sourceId,
                        status: MigrationEntryStatus.PENDING,
                        searchResults: [],
                        selectedMatchMangaId: null,
                        selectedMatchSourceId: null,
                    },
                ]),
            );
        });
    }

    static async startSearch(destinationSourceIds: SourceIdInfo['id'][]): Promise<void> {
        MigrationManager.updateState((draft) => {
            draft.destinationSourceIds = destinationSourceIds;
        });

        if (MigrationManager.isSingleManga()) {
            // Single manga: caller navigates to SearchAll, no automated search
            return;
        }

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
        MigrationManager.abortController?.abort('search');
        MigrationManager.abortController = new AbortController();
        const { signal } = MigrationManager.abortController;

        const searchPromises = entries.map((entry) =>
            MigrationManager.mangaProcessQueue(async () => {
                if (signal.aborted) {
                    return;
                }

                await MigrationManager.searchForManga(entry.mangaId, signal);
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
        MigrationManager.abortController?.abort('migrate');
        MigrationManager.abortController = new AbortController();
        const { signal } = MigrationManager.abortController;

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

    static abort(reason?: unknown): void {
        MigrationManager.abortController?.abort(reason);
        MigrationManager.abortController = null;

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
    }

    static async resume(): Promise<void> {
        const state = MigrationManager.getState();

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

        if (state.phase !== MigrationPhase.SEARCHING) {
            return;
        }

        const pendingEntries = Object.values(state.entries).filter(
            (entry) => entry.status === MigrationEntryStatus.PENDING,
        );

        await MigrationManager.search(pendingEntries);
    }

    static reset(): void {
        MigrationManager.abortController?.abort('reset');
        MigrationManager.abortController = null;
        migrationStore.setState({ ...DEFAULT_MIGRATION_STATE });
    }

    static isSingleManga(): boolean {
        const { entries } = MigrationManager.getState();
        return Object.keys(entries).length === 1;
    }

    static completeSingleMigration(): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATION_COMPLETE;

            const [entry] = Object.values(draft.entries);
            if (entry) {
                entry.status = MigrationEntryStatus.MIGRATED;
            }
        });
    }

    static excludeManga(mangaId: MangaIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                entry.status = MigrationEntryStatus.EXCLUDED;
            }
        });
    }

    static includeManga(mangaId: MangaIdInfo['id']): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                entry.status =
                    entry.searchResults.length > 0
                        ? MigrationEntryStatus.SEARCH_COMPLETE
                        : MigrationEntryStatus.NO_MATCH;
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

    private static async searchForManga(mangaId: MangaIdInfo['id'], signal: AbortSignal): Promise<void> {
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
                MigrationManager.parallelSourcesQueue(() => {
                    if (signal.aborted) {
                        return null;
                    }

                    return MigrationManager.getOrCreateSourceQueue(destSourceId)(async () =>
                        requestManager.graphQLClient.client.mutate<
                            GetSourceMangasFetchMutation,
                            GetSourceMangasFetchMutationVariables
                        >({
                            mutation: GET_SOURCE_MANGAS_FETCH,
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
                draftEntry.searchResults = mangas.map((manga) => ({
                    mangaId: manga.id,
                    title: manga.title,
                    sourceId: manga.sourceId,
                    thumbnailUrl: manga.thumbnailUrl,
                }));

                if (mangas.length > 0) {
                    draftEntry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                    draftEntry.selectedMatchMangaId = mangas[0].id;
                    draftEntry.selectedMatchSourceId = mangas[0].sourceId;
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
        mangaId: number,
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
        signal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];

        if (!entry || entry.selectedMatchMangaId == null) {
            return;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.MIGRATING;
        });

        try {
            if (signal.aborted) {
                return;
            }

            await MangaMigration.migrate(mangaId, entry.selectedMatchMangaId, options);

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

    private static updateState(updater: (draft: MigrationState) => void): void {
        migrationStore.setState(updater);
    }
}

export function useMigrationPhase(): MigrationPhase {
    return useStore(migrationStore, (s) => s.phase);
}

export function useMigrationSourceId(): string | null {
    return useStore(migrationStore, (s) => s.sourceId);
}

export function useMigrationEntries(): Record<number, MigrationEntry> {
    return useStore(migrationStore, (s) => s.entries);
}

export function useMigrationEntry(mangaId: number): MigrationEntry | undefined {
    return useStore(migrationStore, (s) => s.entries[mangaId]);
}

export function useMigrationSearchProgress(): { completed: number; total: number } {
    return useStore(
        migrationStore,
        useShallow((s) => s.searchProgress),
    );
}

export function useMigrationMigrationProgress(): { completed: number; total: number; failed: number } {
    return useStore(
        migrationStore,
        useShallow((s) => s.migrationProgress),
    );
}

export function useMigrationIsActive(): boolean {
    return useStore(
        migrationStore,
        (s) => s.phase === MigrationPhase.SEARCHING || s.phase === MigrationPhase.MIGRATING,
    );
}

export function useMigrationDestinationSourceIds(): string[] {
    return useStore(migrationStore, (s) => s.destinationSourceIds);
}
