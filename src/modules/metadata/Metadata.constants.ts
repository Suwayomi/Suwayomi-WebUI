/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppMetadataKeys, IMetadataMigration } from '@/modules/metadata/Metadata.types.ts';
import { ProgressBarPosition, ReaderPageScaleMode, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const APP_METADATA_KEY_PREFIX = 'webUI';

// At the moment any non-primitive types need to be specified as "string" and handled in the according "MetadataService".
// "auto" can be used to try to automatically convert the value to a specific type (string, number, boolean, undefined, null)
export const APP_METADATA_KEY_TO_TYPE = {
    migration: 'number',
    deleteChaptersManuallyMarkedRead: 'boolean',
    deleteChaptersWhileReading: 'number',
    deleteChaptersWithBookmark: 'boolean',
    downloadAheadLimit: 'number',
    showAddToLibraryCategorySelectDialog: 'boolean',
    ignoreFilters: 'boolean',
    removeMangaFromCategories: 'boolean',
    showTabSize: 'boolean',
    devices: 'string', // string[]
    migrateChapters: 'boolean',
    migrateCategories: 'boolean',
    migrateTracking: 'boolean',
    deleteChapters: 'boolean',
    migrateSortSettings: 'string', // SortSettings (object)
    hideLibraryEntries: 'boolean',
    updateProgressAfterReading: 'boolean',
    updateProgressManualMarkRead: 'boolean',
    webUIInformAvailableUpdate: 'boolean',
    serverInformAvailableUpdate: 'boolean',
    readerWidth: 'string', // object
    savedSearches: 'string', // object
    showContinueReadingButton: 'boolean',
    showDownloadBadge: 'boolean',
    showUnreadBadge: 'boolean',
    gridLayout: 'number', // GridLayout (enum)
    sortBy: 'auto', // LibrarySortMode undefined null
    sortDesc: 'auto', // boolean undefined null
    hasDownloadedChapters: 'auto', // boolean undefined null
    hasBookmarkedChapters: 'auto', // boolean undefined null
    hasUnreadChapters: 'auto', // boolean undefined null
    hasReadChapters: 'auto', // boolean undefined null
    hasDuplicateChapters: 'auto', // boolean undefined null
    hasTrackerBinding: 'string', // object
    hasStatus: 'string', // object
    customThemes: 'string', // object
    mangaThumbnailBackdrop: 'boolean',
    mangaDynamicColorSchemes: 'boolean',
    tapZoneLayout: 'number', // TapZoneLayouts (enum)
    tapZoneInvertMode: 'string', // TapZoneInvertMode (object)
    readingDirection: 'number', // ReadingDirection (enum)
    progressBarType: 'number', // ProgressBarType (enum)
    progressBarSize: 'number',
    progressBarPosition: 'number', // ProgressBarPosition (enum)
    progressBarPositionAutoVertical: 'number', // TProgressBarPositionAutoVertical (enum)
    readingMode: 'number', // ReadingMode (enum)
    pageScaleMode: 'number', // ReaderPageScaleMode (enum)
    shouldOffsetDoubleSpreads: 'boolean',
    exitMode: 'number', // ReaderExitMode (enum)
    customFilter: 'string', // ReaderCustomFilter (object)
    shouldSkipDupChapters: 'boolean',
    isStaticNav: 'boolean',
    overlayMode: 'number', // ReaderOverlayMode (enum)
    shouldStretchPage: 'boolean',
    shouldShowPageNumber: 'boolean',
    backgroundColor: 'number', // ReaderBackgroundColor (enum)
    pageGap: 'number',
    hotkeys: 'string', // object
    imagePreLoadAmount: 'number',
    shouldUseAutoWebtoonMode: 'boolean',
    autoScroll: 'string', // object
    shouldShowReadingModePreview: 'boolean',
    shouldShowTapZoneLayoutPreview: 'boolean',
    shouldInformAboutMissingChapter: 'boolean',
    shouldInformAboutScanlatorChange: 'boolean',
    hideHistory: 'boolean',
    scrollAmount: 'number', // ReaderScrollAmount (enum)
    reverse: 'boolean',
    bookmarked: 'auto', // boolean undefined null
    downloaded: 'auto', // boolean undefined null
    unread: 'auto', // boolean undefined null
    showChapterNumber: 'boolean',
    extensionLanguages: 'string', // string[]
    sourceLanguages: 'string', // string[]
    showNsfw: 'boolean',
    shouldUseInfiniteScroll: 'boolean',
    shouldShowTransitionPage: 'boolean',
    appTheme: 'string',
    themeMode: 'string', // ThemeMode (enum)
    shouldUsePureBlackMode: 'boolean',
    mangaGridItemWidth: 'number',
    isPinned: 'boolean',
    isEnabled: 'boolean',
    lastUsedSourceId: 'string',
    shouldShowOnlySourcesWithResults: 'boolean',
    excludedScanlators: 'string', // string[]
} as const satisfies Record<AppMetadataKeys, 'auto' | 'string' | 'number' | 'boolean'>;

export const VALID_APP_METADATA_KEYS = Object.keys(APP_METADATA_KEY_TO_TYPE);

export const GLOBAL_METADATA_KEYS: AppMetadataKeys[] = [
    // metadata applied migration id
    'migration',

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
    'hasReadChapters',
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
    'extensionLanguages',
    'sourceLanguages',
    'showNsfw',
    'lastUsedSourceId',
    'shouldShowOnlySourcesWithResults',

    // history
    'hideHistory',

    // tracking
    'updateProgressAfterReading',
    'updateProgressManualMarkRead',

    // updates
    'webUIInformAvailableUpdate',
    'serverInformAvailableUpdate',

    // sources
    'savedSearches',
    'isPinned',
    'isEnabled',

    // themes
    'customThemes',
    'mangaThumbnailBackdrop',
    'mangaDynamicColorSchemes',

    // reader
    'exitMode',
    'customFilter',
    'shouldSkipDupChapters',
    'hotkeys',
    'shouldShowTransitionPage',

    // manga
    // chapter list options
    'reverse',
    'bookmarked',
    'downloaded',
    'unread',
    'showChapterNumber',
    'excludedScanlators',
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
 * 4. app metadata keys deletion
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
    {
        keys: [
            {
                oldKey: 'readerType',
                newKey: 'readingMode',
            },
            {
                oldKey: 'offsetFirstPage',
                newKey: 'shouldOffsetDoubleSpreads',
            },
            {
                oldKey: 'fitPageToWindow',
                newKey: 'pageScaleMode',
            },
            {
                oldKey: 'scalePage',
                newKey: 'shouldStretchPage',
            },
            {
                oldKey: 'skipDupChapters',
                newKey: 'shouldSkipDupChapters',
            },
            {
                oldKey: 'showPageNumber',
                newKey: 'shouldShowPageNumber',
            },
            {
                oldKey: 'staticNav',
                newKey: 'isStaticNav',
            },
        ],
        values: [
            // START: readerType
            {
                key: 'readerType',
                oldValue: 'ContinuesVertical',
                newValue: `${ReadingMode.CONTINUOUS_VERTICAL}`,
            },
            {
                key: 'readerType',
                oldValue: 'Webtoon',
                newValue: `${ReadingMode.WEBTOON}`,
            },
            {
                key: 'readerType',
                oldValue: 'SingleRTL',
                newValue: `${ReadingMode.SINGLE_PAGE}`,
            },
            {
                key: 'readerType',
                oldValue: 'SingleLTR',
                newValue: `${ReadingMode.SINGLE_PAGE}`,
            },
            {
                key: 'readerType',
                oldValue: 'DoubleRTL',
                newValue: `${ReadingMode.DOUBLE_PAGE}`,
            },
            {
                key: 'readerType',
                oldValue: 'DoubleLTR',
                newValue: `${ReadingMode.DOUBLE_PAGE}`,
            },
            {
                key: 'readerType',
                oldValue: 'ContinuesHorizontalLTR',
                newValue: `${ReadingMode.CONTINUOUS_HORIZONTAL}`,
            },
            {
                key: 'readerType',
                oldValue: 'ContinuesHorizontalRTL',
                newValue: `${ReadingMode.CONTINUOUS_HORIZONTAL}`,
            },
            // END: readerType
            // START: fitPageToWindow
            {
                key: 'fitPageToWindow',
                oldValue: 'false',
                newValue: `${ReaderPageScaleMode.ORIGINAL}`,
            },
            {
                key: 'fitPageToWindow',
                oldValue: 'true',
                newValue: `${ReaderPageScaleMode.SCREEN}`,
            },
            // END: fitPageToWindow
            {
                key: 'readerWidth',
                oldValue: /^[0-9]+$/g,
                newValue: (oldValue) => JSON.stringify({ value: Number(oldValue), enabled: true }),
            },
        ],
    },
    {
        deleteKeys: ['pageScaleMode', 'shouldStretchPage', 'readerWidth'],
    },
    {
        values: [
            {
                key: 'progressBarPositionAutoVertical',
                oldValue: '-1',
                newValue: `${DEFAULT_READER_SETTINGS.progressBarPositionAutoVertical}`,
            },
            {
                key: 'progressBarPosition',
                oldValue: '0',
                newValue: `${ProgressBarPosition.BOTTOM}`,
            },
            {
                key: 'progressBarPosition',
                oldValue: '1',
                newValue: `${ProgressBarPosition.LEFT}`,
            },
            {
                key: 'progressBarPosition',
                oldValue: '2',
                newValue: `${ProgressBarPosition.RIGHT}`,
            },
        ],
    },
];
