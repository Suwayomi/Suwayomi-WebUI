/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MetadataDownloadSettings } from '@/features/downloads/Downloads.types.ts';
import { MetadataLibrarySettings } from '@/features/library/Library.types.ts';
import { MetadataClientSettings } from '@/features/device/Device.types.ts';
import { MetadataMigrationSettings } from '@/features/migration/Migration.types.ts';
import { MetadataBrowseSettings } from '@/features/browse/Browse.types.ts';
import { MetadataTrackingSettings } from '@/features/tracker/Tracker.types.ts';
import { MetadataUpdateSettings } from '@/features/app-updates/AppUpdateChecker.types.ts';
import { MetadataThemeSettings } from '@/features/theme/AppTheme.types.ts';
import { GetServerSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { MetadataHistorySettings } from '@/features/history/History.types.ts';
import { ServerSettings as GqlServerSettings } from '@/features/settings/Settings.types.ts';

export type MetadataServerSettingKeys = keyof MetadataServerSettings;

export type SearchMetadataKeys = keyof ISearchSettings;

export type MetadataServerSettings = MetadataDownloadSettings &
    MetadataLibrarySettings &
    MetadataClientSettings &
    MetadataMigrationSettings &
    MetadataBrowseSettings &
    MetadataTrackingSettings &
    MetadataUpdateSettings &
    MetadataThemeSettings &
    MetadataHistorySettings;

export interface ISearchSettings {
    ignoreFilters: boolean;
}

export type ServerSettings = Omit<GetServerSettingsQuery['settings'], '__typename'>;
export type ServerSettingsType = Pick<
    GqlServerSettings,
    | 'ip'
    | 'port'
    | 'socksProxyEnabled'
    | 'socksProxyVersion'
    | 'socksProxyHost'
    | 'socksProxyPort'
    | 'socksProxyUsername'
    | 'socksProxyPassword'
    | 'debugLogsEnabled'
    | 'systemTrayEnabled'
    | 'maxLogFiles'
    | 'maxLogFileSize'
    | 'maxLogFolderSize'
    | 'authMode'
    | 'authUsername'
    | 'authPassword'
    | 'flareSolverrEnabled'
    | 'flareSolverrTimeout'
    | 'flareSolverrUrl'
    | 'flareSolverrSessionName'
    | 'flareSolverrSessionTtl'
    | 'flareSolverrAsResponseFallback'
    | 'opdsUseBinaryFileSizes'
    | 'opdsItemsPerPage'
    | 'opdsEnablePageReadProgress'
    | 'opdsMarkAsReadOnDownload'
    | 'opdsShowOnlyUnreadChapters'
    | 'opdsShowOnlyDownloadedChapters'
    | 'opdsChapterSortOrder'
>;

export type WebUISettingsType = Pick<
    ServerSettings,
    | 'webUIFlavor'
    | 'initialOpenInBrowserEnabled'
    | 'webUIInterface'
    | 'electronPath'
    | 'webUIChannel'
    | 'webUIUpdateCheckInterval'
>;

export type GlobalUpdateSkipEntriesSettings = Pick<
    ServerSettings,
    'excludeUnreadChapters' | 'excludeNotStarted' | 'excludeCompleted'
>;

export type LibrarySettingsType = Pick<ServerSettings, 'updateMangas'>;
