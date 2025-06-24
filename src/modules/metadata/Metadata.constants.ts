/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppMetadataKeys, IMetadataMigration } from '@/modules/metadata/Metadata.types.ts';
import {
    IReaderSettings,
    ProgressBarPosition,
    ReaderCustomFilter,
    ReaderPageScaleMode,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import {
    AUTO_SCROLL_SPEED,
    CUSTOM_FILTER,
    DEFAULT_READER_SETTINGS,
    IMAGE_PRE_LOAD_AMOUNT,
    PAGE_GAP,
    PROGRESS_BAR_SIZE,
    SCROLL_AMOUNT,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { coerceIn } from '@/lib/HelperFunctions.ts';
import { DOWNLOAD_AHEAD } from '@/modules/downloads/Downloads.constants.ts';
import { MANGA_GRID_WIDTH } from '@/modules/settings/Settings.constants.ts';

export const APP_METADATA_KEY_PREFIX = 'webUI';

// At the moment any non-primitive types need to be specified as "string" and handled in the according "MetadataService".
// "auto" can be used to try to automatically convert the value to a specific type (string, number, boolean, undefined, null)
export const APP_METADATA: Record<
    AppMetadataKeys,
    {
        type: 'auto' | 'string' | 'number' | 'boolean';
        toValidValue?: (value: any) => any;
    }
> = {
    migration: {
        type: 'number',
    },
    deleteChaptersManuallyMarkedRead: {
        type: 'boolean',
    },
    deleteChaptersWhileReading: {
        type: 'number',
    },
    deleteChaptersWithBookmark: {
        type: 'boolean',
    },
    downloadAheadLimit: {
        type: 'number',
        toValidValue: (value: number) => coerceIn(value, DOWNLOAD_AHEAD.min, DOWNLOAD_AHEAD.max),
    },
    showAddToLibraryCategorySelectDialog: {
        type: 'boolean',
    },
    ignoreFilters: {
        type: 'boolean',
    },
    removeMangaFromCategories: {
        type: 'boolean',
    },
    showTabSize: {
        type: 'boolean',
    },
    devices: {
        type: 'string', // string[]
    },
    migrateChapters: {
        type: 'boolean',
    },
    migrateCategories: {
        type: 'boolean',
    },
    migrateTracking: {
        type: 'boolean',
    },
    deleteChapters: {
        type: 'boolean',
    },
    migrateSortSettings: {
        type: 'string', // SortSettings (object)
    },
    hideLibraryEntries: {
        type: 'boolean',
    },
    updateProgressAfterReading: {
        type: 'boolean',
    },
    updateProgressManualMarkRead: {
        type: 'boolean',
    },
    webUIInformAvailableUpdate: {
        type: 'boolean',
    },
    serverInformAvailableUpdate: {
        type: 'boolean',
    },
    readerWidth: {
        type: 'string', // object
    },
    savedSearches: {
        type: 'string', // object
    },
    showContinueReadingButton: {
        type: 'boolean',
    },
    showDownloadBadge: {
        type: 'boolean',
    },
    showUnreadBadge: {
        type: 'boolean',
    },
    gridLayout: {
        type: 'number', // GridLayout (enum)
    },
    sortBy: {
        type: 'auto', // LibrarySortMode undefined null
    },
    sortDesc: {
        type: 'auto', // boolean undefined null
    },
    hasDownloadedChapters: {
        type: 'auto', // boolean undefined null
    },
    hasBookmarkedChapters: {
        type: 'auto', // boolean undefined null
    },
    hasUnreadChapters: {
        type: 'auto', // boolean undefined null
    },
    hasReadChapters: {
        type: 'auto', // boolean undefined null
    },
    hasDuplicateChapters: {
        type: 'auto', // boolean undefined null
    },
    hasTrackerBinding: {
        type: 'string', // object
    },
    hasStatus: {
        type: 'string', // object
    },
    customThemes: {
        type: 'string', // object
    },
    mangaThumbnailBackdrop: {
        type: 'boolean',
    },
    mangaDynamicColorSchemes: {
        type: 'boolean',
    },
    tapZoneLayout: {
        type: 'number', // TapZoneLayouts (enum)
    },
    tapZoneInvertMode: {
        type: 'string', // TapZoneInvertMode (object)
    },
    readingDirection: {
        type: 'number', // ReadingDirection (enum)
    },
    progressBarType: {
        type: 'number', // ProgressBarType (enum)
    },
    progressBarSize: {
        type: 'number',
        toValidValue: (value: number) => coerceIn(value, PROGRESS_BAR_SIZE.min, PROGRESS_BAR_SIZE.max),
    },
    progressBarPosition: {
        type: 'number', // ProgressBarPosition (enum)
    },
    progressBarPositionAutoVertical: {
        type: 'number', // TProgressBarPositionAutoVertical (enum)
    },
    readingMode: {
        type: 'number', // ReadingMode (enum)
    },
    pageScaleMode: {
        type: 'number', // ReaderPageScaleMode (enum)
    },
    shouldOffsetDoubleSpreads: {
        type: 'boolean',
    },
    exitMode: {
        type: 'number', // ReaderExitMode (enum)
    },
    customFilter: {
        type: 'string', // ReaderCustomFilter (object)
        toValidValue: (value: ReaderCustomFilter): ReaderCustomFilter => ({
            ...value,
            brightness: {
                ...value.brightness,
                value: coerceIn(value.brightness.value, CUSTOM_FILTER.brightness.min, CUSTOM_FILTER.brightness.max),
            },
            contrast: {
                ...value.contrast,
                value: coerceIn(value.contrast.value, CUSTOM_FILTER.contrast.min, CUSTOM_FILTER.contrast.max),
            },
            saturate: {
                ...value.saturate,
                value: coerceIn(value.saturate.value, CUSTOM_FILTER.saturate.min, CUSTOM_FILTER.saturate.max),
            },
            hue: {
                ...value.hue,
                value: coerceIn(value.hue.value, CUSTOM_FILTER.hue.min, CUSTOM_FILTER.hue.max),
            },
            rgba: {
                ...value.rgba,
                value: {
                    ...value.rgba.value,
                    red: coerceIn(value.rgba.value.red, CUSTOM_FILTER.rgba.red.min, CUSTOM_FILTER.rgba.red.max),
                    green: coerceIn(value.rgba.value.green, CUSTOM_FILTER.rgba.green.min, CUSTOM_FILTER.rgba.green.max),
                    blue: coerceIn(value.rgba.value.blue, CUSTOM_FILTER.rgba.blue.min, CUSTOM_FILTER.rgba.blue.max),
                    alpha: coerceIn(value.rgba.value.alpha, CUSTOM_FILTER.rgba.alpha.min, CUSTOM_FILTER.rgba.alpha.max),
                },
            },
        }),
    },
    shouldSkipDupChapters: {
        type: 'boolean',
    },
    isStaticNav: {
        type: 'boolean',
    },
    overlayMode: {
        type: 'number', // ReaderOverlayMode (enum)
    },
    shouldStretchPage: {
        type: 'boolean',
    },
    shouldShowPageNumber: {
        type: 'boolean',
    },
    backgroundColor: {
        type: 'number', // ReaderBackgroundColor (enum)
    },
    pageGap: {
        type: 'number',
        toValidValue: (value: number) => coerceIn(value, PAGE_GAP.min, PAGE_GAP.max),
    },
    hotkeys: {
        type: 'string', // object
    },
    imagePreLoadAmount: {
        type: 'number',
        toValidValue: (value: number) => coerceIn(value, IMAGE_PRE_LOAD_AMOUNT.min, IMAGE_PRE_LOAD_AMOUNT.max),
    },
    shouldUseAutoWebtoonMode: {
        type: 'boolean',
    },
    autoScroll: {
        type: 'string', // object
        toValidValue: (value: IReaderSettings['autoScroll']): IReaderSettings['autoScroll'] => ({
            ...value,
            value: coerceIn(value.value, AUTO_SCROLL_SPEED.min, AUTO_SCROLL_SPEED.max),
        }),
    },
    shouldShowReadingModePreview: {
        type: 'boolean',
    },
    shouldShowTapZoneLayoutPreview: {
        type: 'boolean',
    },
    shouldInformAboutMissingChapter: {
        type: 'boolean',
    },
    shouldInformAboutScanlatorChange: {
        type: 'boolean',
    },
    hideHistory: {
        type: 'boolean',
    },
    scrollAmount: {
        type: 'number', // ReaderScrollAmount (enum)
        toValidValue: (value: number) => coerceIn(value, SCROLL_AMOUNT.min, SCROLL_AMOUNT.max),
    },
    reverse: {
        type: 'boolean',
    },
    bookmarked: {
        type: 'auto', // boolean undefined null
    },
    downloaded: {
        type: 'auto', // boolean undefined null
    },
    unread: {
        type: 'auto', // boolean undefined null
    },
    showChapterNumber: {
        type: 'boolean',
    },
    extensionLanguages: {
        type: 'string', // string[]
    },
    sourceLanguages: {
        type: 'string', // string[]
    },
    showNsfw: {
        type: 'boolean',
    },
    shouldUseInfiniteScroll: {
        type: 'boolean',
    },
    shouldShowTransitionPage: {
        type: 'boolean',
    },
    appTheme: {
        type: 'string',
    },
    themeMode: {
        type: 'string', // ThemeMode (enum)
    },
    shouldUsePureBlackMode: {
        type: 'boolean',
    },
    mangaGridItemWidth: {
        type: 'number',
        toValidValue: (value: number) => coerceIn(value, MANGA_GRID_WIDTH.min, MANGA_GRID_WIDTH.max),
    },
    isPinned: {
        type: 'boolean',
    },
    isEnabled: {
        type: 'boolean',
    },
    lastUsedSourceId: {
        type: 'string',
    },
    shouldShowOnlySourcesWithResults: {
        type: 'boolean',
    },
    excludedScanlators: {
        type: 'string', // string[]
    },
} as const;

export const VALID_APP_METADATA_KEYS = Object.keys(APP_METADATA);

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
