/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppMetadataKeys, IMetadataMigration } from '@/modules/metadata/Metadata.types.ts';

export const APP_METADATA_KEY_PREFIX = 'webUI_';

const APP_METADATA_OBJECT: Record<AppMetadataKeys, undefined> = {
    staticNav: undefined,
    showPageNumber: undefined,
    loadNextOnEnding: undefined,
    skipDupChapters: undefined,
    fitPageToWindow: undefined,
    scalePage: undefined,
    offsetFirstPage: undefined,
    migration: undefined,
    deleteChaptersManuallyMarkedRead: undefined,
    deleteChaptersWhileReading: undefined,
    deleteChaptersWithBookmark: undefined,
    downloadAheadLimit: undefined,
    showAddToLibraryCategorySelectDialog: undefined,
    ignoreFilters: undefined,
    removeMangaFromCategories: undefined,
    showTabSize: undefined,
    devices: undefined,
    migrateChapters: undefined,
    migrateCategories: undefined,
    migrateTracking: undefined,
    deleteChapters: undefined,
    migrateSortSettings: undefined,
    hideLibraryEntries: undefined,
    updateProgressAfterReading: undefined,
    updateProgressManualMarkRead: undefined,
    webUIInformAvailableUpdate: undefined,
    serverInformAvailableUpdate: undefined,
    readerWidth: undefined,
    savedSearches: undefined,
    showContinueReadingButton: undefined,
    showDownloadBadge: undefined,
    showUnreadBadge: undefined,
    gridLayout: undefined,
    sortBy: undefined,
    sortDesc: undefined,
    hasDownloadedChapters: undefined,
    hasBookmarkedChapters: undefined,
    hasUnreadChapters: undefined,
    hasDuplicateChapters: undefined,
    hasTrackerBinding: undefined,
    hasStatus: undefined,
    customThemes: undefined,
    mangaThumbnailBackdrop: undefined,
    tapZoneLayout: undefined,
    tapZoneInvertMode: undefined,
    readingDirection: undefined,
};

export const VALID_APP_METADATA_KEYS = Object.keys(APP_METADATA_OBJECT);

export const GLOBAL_METADATA_KEYS: AppMetadataKeys[] = [
    // downloads
    'deleteChaptersManuallyMarkedRead',
    'deleteChaptersWhileReading',
    'deleteChaptersWithBookmark',

    // library
    'showAddToLibraryCategorySelectDialog',
    'ignoreFilters',
    'removeMangaFromCategories',
    'showTabSize',

    // library category options
    // filter
    'hasDownloadedChapters',
    'hasBookmarkedChapters',
    'hasUnreadChapters',
    'hasDuplicateChapters',
    'hasTrackerBinding',
    'hasStatus',
    // sort
    'sortBy',
    'sortDesc',
    // display
    'showDownloadBadge',
    'showUnreadBadge',
    'showTabSize',
    'showContinueReadingButton',

    // client
    'devices',

    // migration
    'migrateChapters',
    'migrateCategories',
    'migrateTracking',
    'deleteChapters',
    'migrateSortSettings',

    // browse
    'hideLibraryEntries',

    // tracking
    'updateProgressAfterReading',
    'updateProgressManualMarkRead',

    // updates
    'webUIInformAvailableUpdate',
    'serverInformAvailableUpdate',

    // sources
    'savedSearches',

    // themes
    'customThemes',
    'mangaThumbnailBackdrop',
];
/**
 * Once all changes have been done in the current branch, a new migration for all changes should be
 * created.
 *
 * In case a value should be migrated for a specific key, and in the same migration the key is
 * getting migrated, the key in the value migration is the "old" key (before the migration to the
 * new key).
 *
 * Migration order (function "applyMetadataMigrations"):
 * 1. app metadata key prefix
 * 2. app metadata values
 * 3. app metadata keys
 *
 * @example
 * // changes:
 * // commit: change key "X" to "Z"
 * // commit: change key "Y" to "A"
 * // commit: fix typo in reader setting "someTipo"
 * // commit: add metadata migration
 *
 * // result:
 * // old migrations:
 * // const migrations = [
 * //   {
 * //     keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
 * //   }
 * // ];
 *
 * // updated migrations
 * const migrations = [
 *   {
 *     keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
 *   },
 *   {
 *     keys: [
 *       { oldKey: 'X', newKey: 'Z' },
 *       { oldKey: 'Y', newKey: 'A' },
 *     ],
 *     // all stored values in the metadata (of this app) will get migrated
 *     values: [
 *       {
 *         oldValue: 'someTipo',
 *         newValue: 'someTypo'
 *       },
 *     ],
 *     // to migrate only the value of a specific key (in this case of "someKey"):
 *     // values: [
 *     //   {
 *     //     key: 'someKey',
 *     //     oldValue: 'someTipo',
 *     //     newValue: 'someTypo',
 *     //   },
 *     // ],
 *   },
 * ];
 */
export const METADATA_MIGRATIONS: IMetadataMigration[] = [
    {
        keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
    },
    {
        keys: [{ oldKey: 'deleteChaptersAutoMarkedRead', newKey: 'deleteChaptersWhileReading' }],
    },
];
