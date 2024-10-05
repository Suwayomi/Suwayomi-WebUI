/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { GetServerSettingsQuery, MetaType } from '@/lib/graphql/generated/graphql.ts';
import { AppTheme } from '@/lib/ui/AppThemes.ts';
import { SortSettings } from '@/screens/Migration.types.ts';
import { TranslationKey } from '@/Base.types.ts';
import { MangaMetadataKeys } from '@/modules/manga/MangaCard.types.tsx';
import { LibraryOptions, MetadataLibrarySettings } from '@/modules/library/Library.types.ts';
import { SourceMetadataKeys } from '@/modules/source/Source.types.ts';

export interface ICategoryMetadata extends LibraryOptions {}

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

export type CategoryMetadataKeys = keyof ICategoryMetadata;

export type AppMetadataKeys =
    | MetadataServerSettingKeys
    | MangaMetadataKeys
    | SearchMetadataKeys
    | SourceMetadataKeys
    | CategoryMetadataKeys;

export type MetadataKeyValuePair = [AppMetadataKeys, AllowedMetadataValueTypes];

export interface INavbarOverride {
    status: boolean;
    value: any;
}

export type MetadataDownloadSettings = {
    deleteChaptersManuallyMarkedRead: boolean;
    deleteChaptersWhileReading: number;
    deleteChaptersWithBookmark: boolean;
    downloadAheadLimit: number;
};

export type MetadataClientSettings = {
    devices: string[];
};

export type MetadataMigrationSettings = {
    migrateChapters: boolean;
    migrateCategories: boolean;
    migrateTracking: boolean;
    deleteChapters: boolean;
    migrateSortSettings: SortSettings;
};

export type MetadataBrowseSettings = {
    hideLibraryEntries: boolean;
};

export type MetadataTrackingSettings = {
    updateProgressAfterReading: boolean;
    updateProgressManualMarkRead: boolean;
};

export type MetadataUpdateSettings = {
    webUIInformAvailableUpdate: boolean;
    serverInformAvailableUpdate: boolean;
};

export type MetadataThemeSettings = {
    customThemes: Record<string, AppTheme>;
    mangaThumbnailBackdrop: boolean;
};

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

export interface NavbarItem {
    path: string;
    title: TranslationKey;
    SelectedIconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    IconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    show: 'mobile' | 'desktop' | 'both';
}

export type ServerSettings = GetServerSettingsQuery['settings'];
