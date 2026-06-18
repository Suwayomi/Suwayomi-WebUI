/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { MigrationState } from '@/features/migration/Migration.types.ts';
import { MigrationEntryStatus, MigrationPhase, SortBy, SortOrder } from '@/features/migration/Migration.types.ts';

export const sortByToTranslation: Record<SortBy, MessageDescriptor> = {
    [SortBy.SOURCE_NAME]: msg`By source name`,
    [SortBy.MANGA_COUNT]: msg`By manga count`,
};

export const sortOrderToTranslation: Record<SortBy, MessageDescriptor> = {
    [SortOrder.ASC]: msg`Ascending`,
    [SortOrder.DESC]: msg`Descending`,
};

export const DEFAULT_SORT_SETTINGS = {
    sortBy: SortBy.SOURCE_NAME,
    sortOrder: SortOrder.ASC,
};

export const MIGRATION_LOCAL_STORAGE_KEY = 'migration_state';

export const MAX_MANGAS_IN_PARALLEL = 5;

export const MAX_SOURCES_IN_PARALLEL = 6;

export const DEFAULT_MIGRATION_STATE: MigrationState = {
    phase: MigrationPhase.IDLE,
    sourceIds: null,
    entries: {},
    destinationSourceIds: [],
    searchOptions: null,
    migrateOptions: null,
    startedAt: null,
    lastUpdatedAt: null,
    groupExpandState: {},
    isAborted: false,
};

export const ENTRY_STATUS_TRANSLATION: Record<MigrationEntryStatus, MessageDescriptor> = {
    [MigrationEntryStatus.SEARCH_PENDING]: msg`Pending…`,
    [MigrationEntryStatus.SEARCHING]: msg`Searching…`,
    [MigrationEntryStatus.SEARCH_COMPLETE]: msg`Match found`,
    [MigrationEntryStatus.SEARCH_FAILED]: msg`Search failed`,
    [MigrationEntryStatus.SEARCH_NO_MATCH]: msg`No match found`,
    [MigrationEntryStatus.SEARCH_OUTDATED]: msg`Only outdated matches found`,
    [MigrationEntryStatus.SEARCH_ABORTED]: msg`Aborted`,
    [MigrationEntryStatus.MIGRATION_PENDING]: msg`Pending…`,
    [MigrationEntryStatus.MIGRATING]: msg`Migrating…`,
    [MigrationEntryStatus.MIGRATION_COMPLETE]: msg`Successfully migrated`,
    [MigrationEntryStatus.MIGRATION_FAILED]: msg`Migration failed`,
    [MigrationEntryStatus.MIGRATION_ABORTED]: msg`Aborted`,
    [MigrationEntryStatus.EXCLUDED]: msg`Excluded`,
};

export const MIGRATE_SEARCH_ENTRY_GROUPS = [
    MigrationEntryStatus.SEARCHING,
    MigrationEntryStatus.SEARCH_FAILED,
    MigrationEntryStatus.SEARCH_ABORTED,
    MigrationEntryStatus.SEARCH_NO_MATCH,
    MigrationEntryStatus.SEARCH_OUTDATED,
    MigrationEntryStatus.SEARCH_COMPLETE,
] as const satisfies readonly MigrationEntryStatus[];

export const MIGRATE_SEARCH_ENTRY_GROUP_EXPAND_DEFAULT_STATE: Record<
    (typeof MIGRATE_SEARCH_ENTRY_GROUPS)[number],
    boolean
> = {
    [MigrationEntryStatus.SEARCHING]: true,
    [MigrationEntryStatus.SEARCH_FAILED]: false,
    [MigrationEntryStatus.SEARCH_ABORTED]: false,
    [MigrationEntryStatus.SEARCH_NO_MATCH]: false,
    [MigrationEntryStatus.SEARCH_OUTDATED]: false,
    [MigrationEntryStatus.SEARCH_COMPLETE]: false,
};

export const MIGRATE_EXECUTE_ENTRY_GROUPS = [
    MigrationEntryStatus.MIGRATING,
    MigrationEntryStatus.MIGRATION_FAILED,
    MigrationEntryStatus.MIGRATION_ABORTED,
    MigrationEntryStatus.SEARCH_NO_MATCH,
    MigrationEntryStatus.SEARCH_OUTDATED,
    MigrationEntryStatus.EXCLUDED,
    MigrationEntryStatus.MIGRATION_COMPLETE,
] as const satisfies readonly MigrationEntryStatus[];

export const MIGRATE_EXECUTE_ENTRY_GROUP_EXPAND_DEFAULT_STATE: Record<
    (typeof MIGRATE_EXECUTE_ENTRY_GROUPS)[number],
    boolean
> = {
    [MigrationEntryStatus.MIGRATING]: true,
    [MigrationEntryStatus.MIGRATION_FAILED]: false,
    [MigrationEntryStatus.MIGRATION_ABORTED]: false,
    [MigrationEntryStatus.SEARCH_NO_MATCH]: false,
    [MigrationEntryStatus.SEARCH_OUTDATED]: false,
    [MigrationEntryStatus.EXCLUDED]: false,
    [MigrationEntryStatus.MIGRATION_COMPLETE]: false,
};
