/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import pLimit from 'p-limit';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import {
    type MigratableEntry,
    type MigrateOptions,
    type MigrationBulkSearchSettings,
    MigrationEntryStatus,
    type MigrationMatch,
    MigrationPhase,
    type MigrationProgress,
    type MigrationState,
    type TMigrationEntry,
} from '@/models/migration/Migration.types.ts';
import {
    DEFAULT_MIGRATION_STATE,
    MAX_MANGAS_IN_PARALLEL,
    MIGRATE_EXECUTE_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
    MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
    MIGRATION_LOCAL_STORAGE_KEY,
} from '@/models/migration/Migration.constants.ts';
import type { MangaMigrationFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { MangaMigration } from '@/controllers/migration/services/MangaMigration.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaHighestChapterNumberInfo,
    MangaIdInfo,
    MangaSourceIdInfo,
    MangaSourceNameInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
} from '@/models/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/models/source/Source.types.ts';
import { assertIsDefined } from '@/utils/base/Asserts.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';
import { Confirmation } from '@/controllers/base/services/AppAwaitableComponent.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { t } from '@lingui/core/macro';
import { BrowseTab } from '@/models/browse/Browse.types.ts';
import { Mangas } from '@/controllers/manga/services/Mangas.ts';
import { MANGA_MIGRATION_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';
import { ZustandUtil } from '@/lib/zustand/ZustandUtil.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import isEqual from 'lodash/fp/isEqual';
import { MigrationEntries } from '@/controllers/migration/services/MigrationEntries.ts';
import { MigrationSearch } from '@/controllers/migration/services/MigrationSearch.ts';
import { MigrationSourceQueues } from '@/controllers/migration/services/MigrationSourceQueues.ts';
import { AppSession } from '@/controllers/base/services/AppSession.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { d } from 'koration';
import merge from 'lodash/fp/merge';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import type { To } from 'react-router-dom';

const RESUMABLE_PHASES: readonly MigrationPhase[] = [MigrationPhase.SEARCHING, MigrationPhase.MIGRATING];

let initialResume = true;

const migrationStore = create<MigrationState>()(
    devtools(
        persist(
            immer(() => ({ ...DEFAULT_MIGRATION_STATE })),
            {
                name: AppStorage.getKey(MIGRATION_LOCAL_STORAGE_KEY),
                merge: (persistedState, currentState) => {
                    const persisted = persistedState as MigrationState | undefined;

                    if (initialResume && (!persisted || !RESUMABLE_PHASES.includes(persisted.phase))) {
                        initialResume = false;
                        return currentState;
                    }

                    return merge(currentState, persisted);
                },
            },
        ),
    ),
);

const useMigrationStore = ZustandUtil.createStoreHook(migrationStore);

window.addEventListener('storage', (e) => {
    const isMigrationStateUpdate = e.key === AppStorage.getKey(MIGRATION_LOCAL_STORAGE_KEY);
    if (isMigrationStateUpdate) {
        migrationStore.persist.rehydrate();
    }
});

export class MigrationManager {
    private static abortController: AbortController | null = null;

    private static mangaProcessQueue = pLimit(MAX_MANGAS_IN_PARALLEL);
    private static abortControllerByManga = new Map<MangaIdInfo['id'], AbortController>();

    private static readonly matchSearch = new MigrationSearch({
        getState: () => MigrationManager.getState(),
        updateState: (updater) => MigrationManager.updateState(updater),
        abortControllerByManga: MigrationManager.abortControllerByManga,
    });

    private static entryPoint: To | null = null;

    private static exitPoint: To | null = null;

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

    private static ensureIsInValidPhase(phases: MigrationPhase[]): void {
        const { phase } = MigrationManager.getState();

        if (!phases.includes(phase)) {
            throw new Error(`Illegal migration phase "${phase}". Expected: ${phases}`);
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

                ReactRouter.navigate(AppRoutes.browse.path(BrowseTab.MIGRATE), { replace: true });
                return false;
            case MigrationPhase.SELECTING_SOURCES:
                MigrationManager.updateState((draft) => {
                    draft.phase = MigrationPhase.SELECT_MANGAS;
                    draft.destinationSourceIds = [];

                    if (MigrationManager.entryPoint) {
                        draft.phase = MigrationPhase.IDLE;
                        draft.entries = {};
                    }
                });

                if (MigrationManager.entryPoint) {
                    ReactRouter.navigate(MigrationManager.entryPoint, { replace: true });
                }

                return false;
            default:
                try {
                    await MigrationManager.abort('goToPreviousPhase');
                    return false;
                } catch {
                    return false;
                }
        }
    }

    static isPhaseComplete(): boolean {
        const { phase, isAborted } = MigrationManager.getState();
        const searchProgress = MigrationManager.getSearchProgress();
        const migrationProgress = MigrationManager.getMigrationProgress();

        switch (phase) {
            case MigrationPhase.SEARCHING:
                return searchProgress.completed === searchProgress.total;
            case MigrationPhase.MIGRATING:
                return isAborted || migrationProgress.completed === migrationProgress.total;
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
            missingChapters: searchMatch.missingChapters,
            inLibrary: cachedEntry?.inLibrary ?? searchMatch.inLibrary,
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
            missingChapters: entry.missingChapters,
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
            isManualSelection: entry.isManualSelection,
        } satisfies TMigrationEntry;

        if (isEqual(entry, updatedEntry)) {
            return entry;
        }

        MigrationManager.updateState((draft) => {
            draft.entries[entry.mangaId] = updatedEntry;
        });

        return updatedEntry;
    }

    static selectSources(sourceIds: SourceIdInfo['id'][]): void {
        MigrationManager.ensureIsInValidPhase([MigrationPhase.IDLE]);

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SELECT_MANGAS;
            draft.sourceIds = sourceIds;
            draft.entries = {};
        });
    }

    static selectMangas(
        mangas: (MangaIdInfo &
            MangaTitleInfo &
            MangaArtistInfo &
            MangaAuthorInfo &
            MangaHighestChapterNumberInfo &
            MangaThumbnailInfo &
            MangaSourceIdInfo &
            MangaSourceNameInfo)[],
        entryPoint: typeof MigrationManager.entryPoint = null,
        exitPoint: typeof MigrationManager.exitPoint = null,
    ): void {
        MigrationManager.entryPoint = entryPoint;
        MigrationManager.exitPoint = exitPoint;

        MigrationManager.ensureIsInValidPhase([MigrationPhase.SELECT_MANGAS]);

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
                        missingChapters: undefined,
                        mangaThumbnailUrl: manga.thumbnailUrl,
                        sourceId: manga.sourceId,
                        sourceTitle: manga.source?.displayName,
                        status: MigrationEntryStatus.SEARCH_PENDING,
                        searchMatches: [],
                        manualMatches: [],
                        selectedMatchMangaId: null,
                        selectedMatchSourceId: null,
                        destSourceIdToSearchState: {},
                        isExcluded: false,
                        areMatchesExpanded: false,
                        error: undefined,
                        isManualSelection: false,
                    },
                ]),
            );
        });
    }

    private static async awaitUserConfirmation(): Promise<void> {
        await Confirmation.show({
            title: t`Migration information`,
            message: AppSession.isSecureContext()
                ? t`The migration runs on the client on the current device, NOT the server.\nAs long as the client is open, the migration will run in the background.\nThe client can be closed. The migration will be resumed once it gets opened again on the same device it got started on.`
                : t`WebUI must be kept open. Migration can't be resumed`,
            actions: {
                confirm: {
                    title: t`Understood`,
                },
            },
        });
    }

    static async startSearch(
        destinationSourceIds: SourceIdInfo['id'][],
        options: MigrationBulkSearchSettings,
    ): Promise<void> {
        MigrationManager.ensureIsInValidPhase([MigrationPhase.SELECTING_SOURCES]);

        await MigrationManager.awaitUserConfirmation();

        const state = MigrationManager.getState();

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.SEARCHING;
            draft.destinationSourceIds = destinationSourceIds;
            draft.searchOptions = options;
            draft.startedAt = Date.now();
            draft.groupExpandState = MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE;
        });

        await MigrationManager.search(Object.values(state.entries), options);
    }

    private static async search(entries: TMigrationEntry[], options: MigrationBulkSearchSettings): Promise<void> {
        const { signal } = MigrationManager.abortAndCreateAbortController('search');

        MigrationManager.updateState((draft) =>
            entries.forEach((entry) => {
                draft.entries[entry.mangaId].status = MigrationEntryStatus.SEARCH_PENDING;
            }),
        );

        const searchPromises = entries.map((entry) =>
            MigrationManager.mangaProcessQueue(async () => {
                signal.throwIfAborted();

                await MigrationManager.matchSearch.searchForManga(entry.mangaId, entry.mangaTitle, signal, options);
            }),
        );

        try {
            await Promise.allSettled(searchPromises);
        } finally {
            const searchProgress = MigrationManager.getSearchProgress();

            if (searchProgress.completed === searchProgress.total) {
                const allSearchesFailed = searchProgress.failed === searchProgress.total;

                MigrationManager.updateState((draft) => {
                    draft.groupExpandState = {
                        ...MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE,
                        [MigrationEntryStatus.SEARCHING]: false,
                        [MigrationEntryStatus.SEARCH_NO_MATCH]: !allSearchesFailed && !searchProgress.success,
                        [MigrationEntryStatus.SEARCH_OUTDATED]: !allSearchesFailed && !searchProgress.success,
                        [MigrationEntryStatus.SEARCH_FAILED]: allSearchesFailed,
                        [MigrationEntryStatus.SEARCH_COMPLETE]: !!searchProgress.success,
                    };
                });
            }
        }
    }

    static async startMigration(options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>): Promise<void> {
        MigrationManager.ensureIsInValidPhase([MigrationPhase.SEARCHING]);

        const migratableEntries = MigrationEntries.getMigratable(Object.values(MigrationManager.getState().entries));

        await MigrationManager.awaitUserConfirmation();

        MigrationManager.updateState((draft) => {
            draft.phase = MigrationPhase.MIGRATING;
            draft.migrateOptions = options;
            draft.groupExpandState = MIGRATE_EXECUTE_ENTRY_GROUP_EXPAND_DEFAULT_STATE;
        });

        await MigrationManager.migrate(migratableEntries, options);
    }

    private static async migrate(
        entries: MigratableEntry[],
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
        const { signal } = MigrationManager.abortAndCreateAbortController('migrate');

        MigrationManager.updateState((draft) => {
            entries.forEach((entry) => {
                draft.entries[entry.mangaId].status = MigrationEntryStatus.MIGRATION_PENDING;
            });
        });

        const entriesBySource = Object.groupBy(entries, (entry) => entry.selectedMatchSourceId);

        const migrationPromises = Object.values(entriesBySource).map((sourceEntries = []) =>
            MigrationManager.mangaProcessQueue(async () => {
                for (const entry of sourceEntries) {
                    signal.throwIfAborted();

                    // biome-ignore lint/performance/noAwaitInLoops: kept as before the Biome migration
                    await MigrationManager.migrateSingleEntry(entry.mangaId, options, signal);
                }
            }),
        );

        try {
            await Promise.allSettled(migrationPromises);
        } finally {
            const migrationProgress = MigrationManager.getMigrationProgress();

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

        if (!signal.aborted) {
            MigrationManager.updateState((draft) => {
                draft.lastUpdatedAt = Date.now();
            });
        }
    }

    static async stop(reason: unknown = 'stopped'): Promise<boolean> {
        if (!(await MigrationManager.confirmAbort())) {
            return false;
        }

        MigrationManager.abortAndResetAbortController(reason);

        MigrationManager.updateState((draft) => {
            draft.isAborted = true;
        });

        return true;
    }

    static async abort(reason: unknown = 'abort'): Promise<boolean> {
        if (!MigrationManager.getState().isAborted && !(await MigrationManager.confirmAbort())) {
            return false;
        }

        ReactRouter.navigate(MigrationManager.entryPoint ?? AppRoutes.browse.path(BrowseTab.MIGRATE), {
            replace: true,
        });

        MigrationManager.abortAndResetAbortController(reason);

        MigrationManager.reset();

        return true;
    }

    static async awaitCompletion(): Promise<void> {
        const completionPromise = new ControlledPromise();

        const checkComplete = () => {
            setTimeout(() => {
                if (MigrationManager.getState().phase !== MigrationPhase.IDLE) {
                    checkComplete();
                    return;
                }

                completionPromise.resolve();
            }, d(10).seconds.inWholeMilliseconds);
        };

        checkComplete();

        return completionPromise.promise;
    }

    static async resume(): Promise<boolean> {
        const { phase, migrateOptions, searchOptions, entries } = MigrationManager.getState();

        if (!AppSession.isSecureContext()) {
            return false;
        }

        if (!MigrationManager.isResumablePhase()) {
            return false;
        }

        const resumeMigrationPhase = phase === MigrationPhase.MIGRATING && migrateOptions;
        if (resumeMigrationPhase) {
            assertIsDefined(migrateOptions);

            const migratableEntries = MigrationEntries.getMigratable(Object.values(entries));

            MigrationManager.updateState((draft) => {
                migratableEntries.forEach((entry) => {
                    draft.entries[entry.mangaId].status = MigrationEntryStatus.MIGRATION_PENDING;
                });
            });

            await MigrationManager.migrate(migratableEntries, migrateOptions);

            return true;
        }

        assertIsDefined(searchOptions);

        const pendingEntries = MigrationEntries.getHaveStatus(
            Object.values(entries),
            MigrationEntryStatus.SEARCH_PENDING,
            MigrationEntryStatus.SEARCHING,
        );

        MigrationManager.updateState((draft) => {
            pendingEntries.forEach((entry) => {
                draft.entries[entry.mangaId].status = MigrationEntryStatus.SEARCH_PENDING;
            });
        });

        await MigrationManager.search(pendingEntries, searchOptions);

        return true;
    }

    static reset(goToExitPoint: boolean = false): void {
        if (goToExitPoint && MigrationManager.exitPoint) {
            ReactRouter.navigate(MigrationManager.exitPoint, { replace: true });
        }

        MigrationManager.entryPoint = null;
        MigrationManager.exitPoint = null;
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

    static abortEntry(mangaId: MangaIdInfo['id']): void {
        const { entries } = MigrationManager.getState();
        const entry = entries[mangaId];

        assertIsDefined(entry);

        MigrationManager.abortControllerByManga.get(mangaId)?.abort('User aborted');
        MigrationManager.updateState((draft) => {
            const draftEntry = draft.entries[mangaId];

            assertIsDefined(draftEntry);

            if (draftEntry.status === MigrationEntryStatus.SEARCHING) {
                draftEntry.status = MigrationEntryStatus.SEARCH_ABORTED;
            } else {
                draftEntry.status = MigrationEntryStatus.MIGRATION_ABORTED;
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
                if (entry.selectedMatchMangaId === null && (entry.searchMatches.length || entry.manualMatches.length)) {
                    entry.areMatchesExpanded = false;
                }

                entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                entry.isManualSelection = true;
                entry.selectedMatchMangaId = targetMangaId;
                entry.selectedMatchSourceId = targetSourceId;
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

                const isSearching = MigrationEntries.isSearching(entry);

                entry.status = MigrationEntryStatus.SEARCH_COMPLETE;
                entry.error = undefined;
                entry.isManualSelection = true;
                entry.selectedMatchMangaId = match.id;
                entry.selectedMatchSourceId = match.sourceId;

                if (isSearching) {
                    MigrationManager.abortControllerByManga.get(mangaId)?.abort('Manual match selected');
                }
            }
        });
    }

    static openManualSearch(mangaId: MangaIdInfo['id'], title: string): void {
        ReactRouter.navigate(AppRoutes.migrate.children.manualSearch.path(mangaId, title), {
            state: AppRoutes.migrate.children.manualSearch.state({
                title: t`Manual migration search for "${title}"`,
                mode: 'migrate.select.bulk',
            }),
        });
    }

    static getState(): MigrationState {
        return migrationStore.getState();
    }

    static isResumablePhase(): boolean {
        return RESUMABLE_PHASES.includes(MigrationManager.getState().phase);
    }

    static isActive(): boolean {
        return !!MigrationManager.abortController && MigrationManager.isResumablePhase();
    }

    static isFinished(): boolean {
        return MigrationManager.getState().phase === MigrationPhase.MIGRATING && MigrationManager.isPhaseComplete();
    }

    public static getSourcePriority(mangaSourceId: SourceIdInfo['id'], sourceId: SourceIdInfo['id']): number {
        return MigrationManager.matchSearch.getSourcePriority(mangaSourceId, sourceId);
    }

    private static async migrateSingleEntry(
        mangaId: MangaIdInfo['id'],
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
        mainSignal: AbortSignal,
    ): Promise<void> {
        const state = MigrationManager.getState();
        const entry = state.entries[mangaId];

        const migrateController = new AbortController();
        const signal = AbortSignal.any([mainSignal, migrateController.signal]);

        if (
            !entry ||
            !entry.selectedMatchSourceId ||
            entry.selectedMatchMangaId == null ||
            MigrationEntries.hasStatus(entry, MigrationEntryStatus.MIGRATION_ABORTED)
        ) {
            return;
        }

        MigrationManager.abortControllerByManga.get(mangaId)?.abort('migrate');
        MigrationManager.abortControllerByManga.set(mangaId, migrateController);

        MigrationManager.updateState((draft) => {
            const draftEntry = draft.entries[mangaId];

            draftEntry.status = MigrationEntryStatus.MIGRATING;
            draftEntry.error = undefined;
        });

        try {
            signal.throwIfAborted();

            await MigrationSourceQueues.getParallelSourceQueue()(() => {
                assertIsDefined(entry.selectedMatchSourceId);

                return MigrationSourceQueues.getOrCreateSourceQueue(entry.selectedMatchSourceId)(async () => {
                    signal.throwIfAborted();

                    assertIsDefined(entry.selectedMatchMangaId);

                    await MangaMigration.migrateByIdWithQuery(mangaId, entry.selectedMatchMangaId, options);
                });
            });

            MigrationManager.updateState((draft) => {
                if (!MigrationEntries.isMigrating(entry)) {
                    return;
                }

                draft.entries[mangaId].status = MigrationEntryStatus.MIGRATION_COMPLETE;
            });
        } catch (error) {
            if (mainSignal.aborted) {
                return;
            }

            MigrationManager.updateState((draft) => {
                const draftEntry = draft.entries[mangaId];

                assertIsDefined(draftEntry);

                if (!MigrationEntries.hasStatus(draftEntry, MigrationEntryStatus.MIGRATION_ABORTED)) {
                    draftEntry.status = MigrationEntryStatus.MIGRATION_FAILED;
                    draftEntry.error = getErrorMessage(error);
                }
            });
        } finally {
            MigrationManager.abortControllerByManga.delete(mangaId);
        }
    }

    static async retryEntry(id: MangaIdInfo['id']): Promise<void> {
        const { entries, migrateOptions, searchOptions } = MigrationManager.getState();
        const entry = entries[id];

        if (!entry) {
            throw Error(t`Entry "${id}" not found`);
        }

        const { signal } = MigrationManager.getOrCreateAbortController();

        if (MigrationEntries.hasStatus(entry, MigrationEntryStatus.SEARCH_FAILED)) {
            MigrationManager.updateState((draft) => {
                draft.entries[id].status = MigrationEntryStatus.SEARCH_PENDING;
            });

            assertIsDefined(searchOptions);

            await MigrationManager.mangaProcessQueue(() =>
                MigrationManager.matchSearch.searchForManga(id, entry.mangaTitle, signal, searchOptions),
            );

            return;
        }

        if (MigrationEntries.hasStatus(entry, MigrationEntryStatus.MIGRATION_FAILED)) {
            MigrationManager.updateState((draft) => {
                draft.entries[id].status = MigrationEntryStatus.MIGRATION_PENDING;
            });

            assertIsDefined(migrateOptions);

            await MigrationManager.mangaProcessQueue(() =>
                MigrationManager.migrateSingleEntry(id, migrateOptions, signal),
            );

            return;
        }

        const sourceTitle = entry.sourceTitle ?? t`Unknown source`;
        throw Error(
            t`Entry "${entry.mangaTitle} (${entry.mangaId}; ${sourceTitle} (${entry.sourceId}))" in invalid state "${entry.status}"`,
        );
    }

    private static updateState(updater: (draft: MigrationState) => void): void {
        // Only update the state if the tab is the active executor. Otherwise, updating the state will break the
        // migration due to the executor tab rehydrating its state with a potentially outdated version
        if (MigrationManager.isResumablePhase() && !MigrationManager.isActive()) {
            return;
        }

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

    private static getSearchProgress(state: MigrationState = MigrationManager.getState()): MigrationProgress {
        const entries = Object.values(state.entries);

        const success = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.SEARCH_COMPLETE).length;
        const failed = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.SEARCH_FAILED).length;
        const outdated = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.SEARCH_OUTDATED).length;
        const noMatch = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.SEARCH_NO_MATCH).length;
        const aborted = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.SEARCH_ABORTED).length;

        return {
            total: entries.length,
            completed: success + failed + outdated + noMatch + aborted,
            success,
            failed,
        };
    }

    private static getMigrationProgress(state: MigrationState = MigrationManager.getState()): MigrationProgress {
        const entries = Object.values(state.entries);

        const total = MigrationEntries.getHaveStatus(
            entries,
            MigrationEntryStatus.MIGRATION_PENDING,
            MigrationEntryStatus.MIGRATING,
            MigrationEntryStatus.MIGRATION_ABORTED,
            MigrationEntryStatus.MIGRATION_FAILED,
            MigrationEntryStatus.MIGRATION_COMPLETE,
        ).length;

        const success = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.MIGRATION_COMPLETE).length;
        const failed = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.MIGRATION_FAILED).length;
        const aborted = MigrationEntries.getHaveStatus(entries, MigrationEntryStatus.MIGRATION_ABORTED).length;

        return {
            total,
            completed: success + failed + aborted,
            success,
            failed,
        };
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

    static useSourceIds(): MigrationState['sourceIds'] {
        return useMigrationStore((state) => state.sourceIds);
    }

    static useEntries(): Record<number, TMigrationEntry> {
        return useMigrationStore((state) => state.entries);
    }

    static useSearchProgress(): MigrationProgress {
        return useMigrationStore((state) => MigrationManager.getSearchProgress(state));
    }

    static useMigrationProgress(): MigrationProgress {
        return useMigrationStore((state) => MigrationManager.getMigrationProgress(state));
    }

    static useIsActive(): boolean {
        // Listen to phase changes
        MigrationManager.usePhase();

        return MigrationManager.isActive();
    }
}
