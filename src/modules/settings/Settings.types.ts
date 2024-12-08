/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MetadataDownloadSettings } from '@/modules/downloads/Downloads.types.ts';
import { MetadataLibrarySettings } from '@/modules/library/Library.types.ts';
import { MetadataClientSettings } from '@/modules/device/Device.types.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';
import { MetadataBrowseSettings } from '@/modules/browse/Browse.types.ts';
import { MetadataTrackingSettings } from '@/modules/tracker/Tracker.types.ts';
import { MetadataUpdateSettings } from '@/modules/app-updates/AppUpdateChecker.types.ts';
import { MetadataThemeSettings } from '@/modules/theme/AppTheme.types.ts';
import { GetServerSettingsQuery } from '@/lib/graphql/generated/graphql.ts';

export type MetadataServerSettingKeys = keyof MetadataServerSettings;

export type SearchMetadataKeys = keyof ISearchSettings;

export type MetadataServerSettings = MetadataDownloadSettings &
    MetadataLibrarySettings &
    MetadataClientSettings &
    MetadataMigrationSettings &
    MetadataBrowseSettings &
    MetadataTrackingSettings &
    MetadataUpdateSettings &
    MetadataThemeSettings;

export interface ISearchSettings {
    ignoreFilters: boolean;
}

export type ServerSettings = Omit<GetServerSettingsQuery['settings'], '__typename'>;
