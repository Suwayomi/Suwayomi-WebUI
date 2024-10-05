/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { GetServerSettingsQuery, MetaType } from '@/lib/graphql/generated/graphql.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';
import { MangaMetadataKeys } from '@/modules/manga/MangaCard.types.tsx';
import { MetadataLibrarySettings } from '@/modules/library/Library.types.ts';
import { SourceMetadataKeys } from '@/modules/source/Source.types.ts';
import { MetadataTrackingSettings } from '@/modules/tracker/Tracker.types.ts';
import { CategoryMetadataKeys } from '@/modules/category/Category.types.ts';
import { MetadataUpdateSettings } from '@/modules/app-updates/AppUpdateChecker.types.ts';
import { MetadataThemeSettings } from '@/modules/theme/AppTheme.types.ts';
import { MetadataClientSettings } from '@/modules/device/Device.types.ts';
import { MetadataBrowseSettings } from '@/modules/browse/Browse.types.ts';
import { MetadataDownloadSettings } from '@/modules/downloads/Downloads.types.ts';

export interface IMetadataMigration {
    appKeyPrefix?: { oldPrefix: string; newPrefix: string };
    values?: {
        /**
         * In case the migration should only be applied to a specific metadata key.
         * Otherwise, all metadata keys will get migrated.
         */
        key?: string;
        oldValue: string;
        newValue: string;
    }[];
    keys?: { oldKey: string; newKey: string }[];
}

export type Metadata<Keys extends string = string, Values = string> = {
    [key in Keys]: Values;
};

export type GqlMetaHolder = { meta?: MetaType[] };

export type MetadataHolder<Keys extends string = string, Values = string> = {
    meta?: Metadata<Keys, Values>;
};

export type AllowedMetadataValueTypes = string | boolean | number | undefined | null;

export type MetadataServerSettingKeys = keyof MetadataServerSettings;

export type SearchMetadataKeys = keyof ISearchSettings;

export type AppMetadataKeys =
    | MetadataServerSettingKeys
    | MangaMetadataKeys
    | SearchMetadataKeys
    | SourceMetadataKeys
    | CategoryMetadataKeys;

export type MetadataKeyValuePair = [AppMetadataKeys, AllowedMetadataValueTypes];

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

export type ServerSettings = GetServerSettingsQuery['settings'];
