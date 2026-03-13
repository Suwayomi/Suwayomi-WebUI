/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { GetMigratableSourcesQuery } from '@/lib/graphql/generated/graphql.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import type { MangaIdInfo, MangaThumbnailInfo } from '@/features/manga/Manga.types.ts';

export enum SortBy {
    SOURCE_NAME,
    MANGA_COUNT,
}

export enum SortOrder {
    ASC,
    DESC,
}

export interface SortSettings {
    sortBy: SortBy;
    sortOrder: SortOrder;
}

export type TMigratableSourcesResult = GetMigratableSourcesQuery['mangas']['nodes'];

export type MigrateMode = 'copy' | 'migrate';

export type MigrateOptions = {
    mangaIdToMigrateTo: number;
    mode: MigrateMode;
} & Partial<MetadataMigrationSettings>;

export type MetadataMigrationSettings = {
    migrateChapters: boolean;
    migrateCategories: boolean;
    migrateTracking: boolean;
    deleteChapters: boolean;
    migrateMetadata: boolean;
    migrateSortSettings: SortSettings;
};

export enum MigrationPhase {
    IDLE = 'idle',
    SELECT_SOURCE = 'select_source',
    SELECT_MANGAS = 'select_mangas',
    SELECTING_SOURCES = 'selecting_sources',
    SEARCHING = 'searching',
    MIGRATING = 'migrating',
    MIGRATION_COMPLETE = 'migration_complete',
    ABORTED = 'aborted',
}

export enum MigrationEntryStatus {
    PENDING = 'pending',
    SEARCHING = 'searching',
    SEARCH_COMPLETE = 'search_complete',
    SEARCH_FAILED = 'search_failed',
    NO_MATCH = 'no_match',
    EXCLUDED = 'excluded',
    MIGRATING = 'migrating',
    MIGRATED = 'migrated',
    MIGRATION_FAILED = 'migration_failed',
}

export interface MigrationSearchResult {
    mangaId: MangaIdInfo['id'];
    title: string;
    sourceId: SourceIdInfo['id'];
    thumbnailUrl?: MangaThumbnailInfo['thumbnailUrl'];
}

export interface MigrationEntry {
    mangaId: MangaIdInfo['id'];
    mangaTitle: string;
    mangaThumbnailUrl?: MangaThumbnailInfo['thumbnailUrl'];
    sourceId: SourceIdInfo['id'];
    status: MigrationEntryStatus;
    searchResults: MigrationSearchResult[];
    selectedMatchMangaId: MangaIdInfo['id'] | null;
    selectedMatchSourceId: SourceIdInfo['id'] | null;
    error?: string;
}

export interface MigrationState {
    phase: MigrationPhase;
    sourceId: SourceIdInfo['id'] | null;
    entries: Record<MangaIdInfo['id'], MigrationEntry>;
    destinationSourceIds: SourceIdInfo['id'][];
    migrateOptions: Omit<MigrateOptions, 'mangaIdToMigrateTo'> | null;
    searchProgress: { completed: number; total: number };
    migrationProgress: { completed: number; total: number; failed: number };
    startedAt: number | null;
    lastUpdatedAt: number | null;
}
