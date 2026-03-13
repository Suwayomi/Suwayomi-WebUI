/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { GetMigratableSourcesQuery } from '@/lib/graphql/generated/graphql.ts';
import type {
    SourceDisplayNameInfo,
    SourceIconInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceMetaInfo,
    SourceNameInfo,
} from '@/features/source/Source.types.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaIdInfo,
    MangaSourceIdInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
} from '@/features/manga/Manga.types.ts';
import type { ChapterNumberInfo } from '@/features/chapter/Chapter.types.ts';

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
}

export enum MigrationEntryStatus {
    PENDING = 'pending',
    SEARCHING = 'searching',
    SEARCH_COMPLETE = 'search_complete',
    SEARCH_FAILED = 'search_failed',
    NO_MATCH = 'no_match',
    MIGRATING = 'migrating',
    MIGRATION_COMPLETE = 'migration_complete',
    MIGRATION_FAILED = 'migration_failed',
    EXCLUDED = 'excluded',
}

export interface MigrationMatch
    extends MangaIdInfo, MangaTitleInfo, MangaThumbnailInfo, MangaSourceIdInfo, MangaArtistInfo, MangaAuthorInfo {
    sourceTitle: SourceDisplayNameInfo['displayName'] | undefined;
    latestChapterNumber: ChapterNumberInfo['chapterNumber'] | undefined;
}

export interface TMigrationEntry {
    mangaId: MangaIdInfo['id'];
    mangaTitle: MangaTitleInfo['title'];
    mangaArtist: MangaArtistInfo['artist'];
    mangaAuthor: MangaAuthorInfo['author'];
    latestChapterNumber: ChapterNumberInfo['chapterNumber'] | undefined;
    mangaThumbnailUrl: MangaThumbnailInfo['thumbnailUrl'] | undefined;
    sourceId: SourceIdInfo['id'];
    sourceTitle: SourceDisplayNameInfo['displayName'] | undefined;
    status: MigrationEntryStatus;
    searchMatches: MigrationMatch[];
    manualMatches: MigrationMatch[];
    selectedMatchMangaId: MangaIdInfo['id'] | null;
    selectedMatchSourceId: SourceIdInfo['id'] | null;
    destSourceIdToSearchState: Record<SourceIdInfo['id'], boolean | undefined>;
    error: string | undefined;
    isExcluded: boolean;
    areMatchesExpanded: boolean;
}

export type MigratableEntry = NonNullableProperty<TMigrationEntry, 'selectedMatchMangaId' | 'selectedMatchSourceId'>;

export type MigrationProgress = { total: number; completed: number; success: number; failed: number };

export interface MigrationState {
    phase: MigrationPhase;
    sourceId: SourceIdInfo['id'] | null;
    entries: Record<MangaIdInfo['id'], TMigrationEntry>;
    destinationSourceIds: SourceIdInfo['id'][];
    migrateOptions: Omit<MigrateOptions, 'mangaIdToMigrateTo'> | null;
    searchProgress: MigrationProgress;
    migrationProgress: MigrationProgress;
    startedAt: number | null;
    lastUpdatedAt: number | null;
    groupExpandState: Partial<Record<MigrationEntryStatus, boolean>>;
}

export interface SourceItem extends SourceIdInfo, SourceNameInfo, SourceLanguageInfo, SourceIconInfo, SourceMetaInfo {}
