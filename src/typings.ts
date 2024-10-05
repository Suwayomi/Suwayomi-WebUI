/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import {
    GetServerSettingsQuery,
    GetSourceBrowseQuery,
    GetSourceSettingsQuery,
    MetaType,
    SourcePreferenceChangeInput,
} from '@/lib/graphql/generated/graphql.ts';
import { AppTheme } from '@/lib/ui/AppThemes.ts';
import { SortSettings } from '@/screens/Migration.types.ts';
import { TranslationKey } from '@/Base.types.ts';
import { MangaMetadataKeys } from '@/modules/manga/MangaCard.types.tsx';
import { LibraryOptions, MetadataLibrarySettings } from '@/modules/library/Library.types.ts';

export interface IPos {
    type: 'selectState' | 'textState' | 'checkBoxState' | 'triState' | 'sortState';
    position: number;
    state: any;
    group?: number;
}

export type SavedSourceSearch = { query?: string; filters?: IPos[] };

export interface ISourceMetadata {
    savedSearches?: Record<string, SavedSourceSearch>;
}

export interface ICategoryMetadata extends LibraryOptions {}

export type SourceFilters = GetSourceBrowseQuery['source']['filters'][number];

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

export type SourceMetadataKeys = keyof ISourceMetadata;

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

export type SourcePreferences = GetSourceSettingsQuery['source']['preferences'][number];

export interface PreferenceProps {
    updateValue: <Key extends keyof Omit<SourcePreferenceChangeInput, 'position'>>(
        type: Key,
        value: SourcePreferenceChangeInput[Key],
    ) => void;
}

export type TwoStatePreferenceProps = (CheckBoxPreferenceProps | SwitchPreferenceCompatProps) & {
    // intetnal props
    twoStateType: 'Switch' | 'Checkbox';
};

export type CheckBoxPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'CheckBoxPreference'>;

export type SwitchPreferenceCompatProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'SwitchPreference'>;

export type ListPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'ListPreference'>;

export type MultiSelectListPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'MultiSelectListPreference'>;

export type EditTextPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'EditTextPreference'>;

export interface NavbarItem {
    path: string;
    title: TranslationKey;
    SelectedIconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    IconComponent: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    show: 'mobile' | 'desktop' | 'both';
}

export type ServerSettings = GetServerSettingsQuery['settings'];
