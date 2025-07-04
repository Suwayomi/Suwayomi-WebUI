/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DEFAULT_DEVICE } from '@/modules/device/services/Device.ts';
import { DEFAULT_SORT_SETTINGS } from '@/modules/migration/Migration.constants.ts';
import { MetadataServerSettings } from '@/modules/settings/Settings.types.ts';
import { GridLayout } from '@/modules/core/Core.types.ts';
import { getDefaultLanguages } from '@/modules/core/utils/Languages.ts';
import { ThemeMode } from '@/modules/theme/contexts/AppThemeContext.tsx';

export const MANGA_GRID_WIDTH = {
    min: 100,
    max: 1000,
    step: 10,
    default: 300,
};

export const SERVER_SETTINGS_METADATA_DEFAULT: MetadataServerSettings = {
    // downloads
    deleteChaptersManuallyMarkedRead: false,
    deleteChaptersWhileReading: 0,
    deleteChaptersWithBookmark: false,
    downloadAheadLimit: 0,

    // library
    showAddToLibraryCategorySelectDialog: true,
    ignoreFilters: false,
    removeMangaFromCategories: false,
    showTabSize: false,
    showContinueReadingButton: false,
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: GridLayout.Compact,

    // client
    devices: [DEFAULT_DEVICE],

    // migration
    migrateChapters: true,
    migrateCategories: true,
    migrateTracking: true,
    deleteChapters: true,
    migrateSortSettings: DEFAULT_SORT_SETTINGS,

    // browse
    hideLibraryEntries: false,
    extensionLanguages: getDefaultLanguages(),
    sourceLanguages: getDefaultLanguages(),
    showNsfw: true,
    lastUsedSourceId: null,
    shouldShowOnlySourcesWithResults: true,

    // history
    hideHistory: false,

    // tracking
    updateProgressAfterReading: true,
    updateProgressManualMarkRead: false,

    // updates
    webUIInformAvailableUpdate: true,
    serverInformAvailableUpdate: true,

    // themes
    appTheme: 'default',
    themeMode: ThemeMode.SYSTEM,
    shouldUsePureBlackMode: false,
    customThemes: {},
    mangaThumbnailBackdrop: true,
    mangaDynamicColorSchemes: true,
    mangaGridItemWidth: MANGA_GRID_WIDTH.default,
};
