/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import pLimit from 'p-limit';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
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

const PERSISTABLE_PHASES = new Set<MigrationPhase>([
    MigrationPhase.SEARCHING,
    MigrationPhase.MIGRATING,
    MigrationPhase.MIGRATION_COMPLETE,
]);

const migrationStore = createStore<MigrationState>()(immer(() => ({ ...DEFAULT_MIGRATION_STATE })));

export class MigrationManager {
    private static abortController: AbortController | null = null;

    // Phase transitions

    static init(): void {
        const persisted = MigrationManager.loadPersistedState();
        if (persisted) {
            migrationStore.setState(persisted);
        }
    }

    static selectSource(sourceId: string): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECT_MANGAS;
            draft.sourceId = sourceId;
            draft.entries = {};
        });
    }

    static selectMangas(mangas: { id: number; title: string; thumbnailUrl?: string; sourceId: string }[]): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECTING_SOURCES;
            draft.entries = {};
            for (const manga of mangas) {
                draft.entries[manga.id] = {
                    mangaId: manga.id,
                    mangaTitle: manga.title,
                    mangaThumbnailUrl: manga.thumbnailUrl,
                    sourceId: manga.sourceId,
                    status: MigrationEntryStatus.PENDING,
                    searchResults: [],
                    selectedMatchMangaId: null,
                    selectedMatchSourceId: null,
                };
            }
        });
    }

    static async startSearch(destinationSourceIds: string[]): Promise<void> {
        const state = MigrationManager.getState();
        const isSingle = MigrationManager.isSingleManga();

        MigrationManager.updateState((draft) => {
            draft.destinationSourceIds = destinationSourceIds;
        });

        if (isSingle) {
            // Single manga: caller navigates to SearchAll, no automated search
            return;
        }

        // Multi manga: begin automated search
        MigrationManager.abortController = new AbortController();
        const { signal } = MigrationManager.abortController;

        const entryIds = Object.keys(state.entries).map(Number);
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SEARCHING;
            draft.searchProgress = { completed: 0, total: entryIds.length };
            draft.startedAt = Date.now();
        });
        MigrationManager.persistState();

        const limit = pLimit(MAX_SOURCES_IN_PARALLEL);

        const searchPromises = entryIds.map((mangaId) =>
            limit(async () => {
                if (signal.aborted) {return;}
                await MigrationManager.searchForManga(mangaId, signal);
            }),
        );

        await Promise.allSettled(searchPromises);
    }

    static async startMigration(options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>): Promise<void> {
        MigrationManager.abortController = new AbortController();
        const { signal } = MigrationManager.abortController;

        const state = MigrationManager.getState();
        const migratableEntries = Object.values(state.entries).filter(
            (e) =>
                e.status === MigrationEntryStatus.SEARCH_COMPLETE &&
                e.selectedMatchMangaId != null &&
                e.selectedMatchSourceId != null,
        );

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATING;
            draft.migrateOptions = options;
            draft.migrationProgress = { completed: 0, total: migratableEntries.length, failed: 0 };
        });
        MigrationManager.persistState();

        // Group entries by selected source for sequential per-source execution
        const entriesBySource: Record<string, MigrationEntry[]> = {};
        for (const entry of migratableEntries) {
            const sourceId = entry.selectedMatchSourceId!;
            (entriesBySource[sourceId] ??= []).push(entry);
        }

        const limit = pLimit(MAX_SOURCES_IN_PARALLEL);

        const migrationPromises = Object.values(entriesBySource).map((sourceEntries) =>
            limit(async () => {
                for (const entry of sourceEntries) {
                    if (signal.aborted) {return;}
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
            MigrationManager.persistState();
        }
    }

    static abort(): void {
        MigrationManager.abortController?.abort();
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

        MigrationManager.clearPersistedState();
    }

    static async resume(): Promise<void> {
        const state = MigrationManager.getState();

        if (state.phase === MigrationPhase.SEARCHING) {
            // Re-search entries that are still pending
            MigrationManager.updateState((draft) => {
                const pendingCount = Object.values(draft.entries).filter(
                    (e) => e.status === MigrationEntryStatus.PENDING,
                ).length;
                draft.searchProgress.total = pendingCount + draft.searchProgress.completed;
            });

            MigrationManager.abortController = new AbortController();
            const { signal } = MigrationManager.abortController;
            const limit = pLimit(MAX_SOURCES_IN_PARALLEL);

            const pendingEntries = Object.values(state.entries).filter(
                (e) => e.status === MigrationEntryStatus.PENDING,
            );

            const searchPromises = pendingEntries.map((entry) =>
                limit(async () => {
                    if (signal.aborted) {return;}
                    await MigrationManager.searchForManga(entry.mangaId, signal);
                }),
            );

            await Promise.allSettled(searchPromises);
        } else if (state.phase === MigrationPhase.MIGRATING && state.migrateOptions) {
            await MigrationManager.startMigration(state.migrateOptions);
        }
    }

    static reset(): void {
        MigrationManager.abortController?.abort();
        MigrationManager.abortController = null;
        migrationStore.setState({ ...DEFAULT_MIGRATION_STATE });
        MigrationManager.clearPersistedState();
    }

    // Single-manga helpers

    static isSingleManga(): boolean {
        const entries = MigrationManager.getState().entries;
        return Object.keys(entries).length === 1;
    }

    static completeSingleMigration(): void {
        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATION_COMPLETE;
            const entry = Object.values(draft.entries)[0];
            if (entry) {
                entry.status = MigrationEntryStatus.MIGRATED;
            }
        });
    }

    // Review actions (multi)

    static excludeManga(mangaId: number): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                entry.status = MigrationEntryStatus.EXCLUDED;
            }
        });
    }

    static includeManga(mangaId: number): void {
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

    static selectMatch(mangaId: number, targetMangaId: number, targetSourceId: string): void {
        MigrationManager.updateState((draft) => {
            const entry = draft.entries[mangaId];
            if (entry) {
                entry.selectedMatchMangaId = targetMangaId;
                entry.selectedMatchSourceId = targetSourceId;
                entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
            }
        });
    }

    // Non-hook getters

    static getState(): MigrationState {
        return migrationStore.getState();
    }

    static isActive(): boolean {
        const { phase } = migrationStore.getState();
        return phase === MigrationPhase.SEARCHING || phase === MigrationPhase.MIGRATING;
    }

    static hasPausedMigration(): boolean {
        return MigrationManager.loadPersistedState() !== null;
    }

    // Internal methods

    private static async searchForManga(mangaId: number, signal: AbortSignal): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];
        if (!entry) {return;}

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.SEARCHING;
        });

        try {
            const allResults: MigrationEntry['searchResults'] = [];

            // Search each destination source in priority order (sequential)
            for (const destSourceId of state.destinationSourceIds) {
                if (signal.aborted) {return;}

                // oxlint-disable-next-line no-await-in-loop
                const { data } = await requestManager.graphQLClient.client.mutate<
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
                });

                const mangas = data?.fetchSourceManga?.mangas ?? [];
                for (const manga of mangas) {
                    allResults.push({
                        mangaId: manga.id,
                        title: manga.title,
                        sourceId: manga.sourceId,
                        thumbnailUrl: manga.thumbnailUrl ?? undefined,
                    });
                }
            }

            MigrationManager.updateState((draft) => {
                const e = draft.entries[mangaId];
                e.searchResults = allResults;

                if (allResults.length > 0) {
                    e.status = MigrationEntryStatus.SEARCH_COMPLETE;
                    e.selectedMatchMangaId = allResults[0].mangaId;
                    e.selectedMatchSourceId = allResults[0].sourceId;
                } else {
                    e.status = MigrationEntryStatus.NO_MATCH;
                }

                draft.searchProgress.completed += 1;
            });
        } catch (error) {
            if (signal.aborted) {return;}

            MigrationManager.updateState((draft) => {
                const e = draft.entries[mangaId];
                e.status = MigrationEntryStatus.SEARCH_FAILED;
                e.error = error instanceof Error ? error.message : String(error);
                draft.searchProgress.completed += 1;
            });
        }

        MigrationManager.persistState();
    }

    private static async migrateSingleEntry(
        mangaId: number,
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
        signal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];
        if (!entry || entry.selectedMatchMangaId == null) {return;}

        MigrationManager.updateState((draft) => {
            draft.entries[mangaId].status = MigrationEntryStatus.MIGRATING;
        });

        try {
            if (signal.aborted) {return;}

            await MangaMigration.migrate(mangaId, entry.selectedMatchMangaId, options);

            MigrationManager.updateState((draft) => {
                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATED;
                draft.migrationProgress.completed += 1;
            });
        } catch (error) {
            if (signal.aborted) {return;}

            MigrationManager.updateState((draft) => {
                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATION_FAILED;
                draft.entries[mangaId].error = error instanceof Error ? error.message : String(error);
                draft.migrationProgress.failed += 1;
                draft.migrationProgress.completed += 1;
            });
        }

        MigrationManager.persistState();
    }

    private static persistState(): void {
        const state = MigrationManager.getState();
        if (PERSISTABLE_PHASES.has(state.phase)) {
            localStorage.setItem(MIGRATION_LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
    }

    private static loadPersistedState(): MigrationState | null {
        try {
            const raw = localStorage.getItem(MIGRATION_LOCAL_STORAGE_KEY);
            if (!raw) {return null;}
            return JSON.parse(raw) as MigrationState;
        } catch {
            return null;
        }
    }

    private static clearPersistedState(): void {
        localStorage.removeItem(MIGRATION_LOCAL_STORAGE_KEY);
    }

    private static updateState(updater: (draft: MigrationState) => void): void {
        migrationStore.setState(updater);
    }
}

// Hooks (standalone functions to satisfy rules-of-hooks lint rule)

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
