/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type {
    GetSourceBrowseQuery,
    GetSourceSettingsQuery,
    SourceMetaFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import type {
    ExtensionType,
    SourcePreferenceChangeInput,
    SourceType,
} from '@/lib/graphql/generated/graphql-base.types.ts';
import type { MangaCardMode, MangaIdInfo } from '@/features/manga/Manga.types.ts';

export interface IPos {
    type: 'selectState' | 'textState' | 'checkBoxState' | 'triState' | 'sortState';
    position: number;
    state: any;
    group?: number;
}

export type SavedSourceSearch = { query?: string; filters?: IPos[] };

export interface ISourceMetadata {
    savedSearches?: Record<string, SavedSourceSearch>;
    isPinned: boolean;
    isEnabled: boolean;
}

export type SourceFilters = GetSourceBrowseQuery['source']['filters'][number];

export type SourceMetadataKeys = keyof ISourceMetadata;

export type SourcePreferences = GetSourceSettingsQuery['source']['preferences'][number];

export interface PreferenceProps {
    updateValue: <Key extends keyof Omit<SourcePreferenceChangeInput, 'position'>>(
        type: Key,
        value: SourcePreferenceChangeInput[Key],
    ) => void;
}

export type CheckBoxPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, 'type', 'CheckBoxPreference'>;

export type SwitchPreferenceCompatProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, 'type', 'SwitchPreference'>;

export type TwoStatePreferenceProps = (CheckBoxPreferenceProps | SwitchPreferenceCompatProps) & {
    // intetnal props
    twoStateType: 'Switch' | 'Checkbox';
};

export type ListPreferenceProps = PreferenceProps &
    Omit<ExtractByKeyValue<SourcePreferences, 'type', 'ListPreference'>, '__typename'>;

export type MultiSelectListPreferenceProps = PreferenceProps &
    Omit<ExtractByKeyValue<SourcePreferences, 'type', 'MultiSelectListPreference'>, '__typename'>;

export type EditTextPreferenceProps = PreferenceProps &
    Omit<ExtractByKeyValue<SourcePreferences, 'type', 'EditTextPreference'>, '__typename'>;

export type SourceIdInfo = Pick<SourceType, 'id'>;
export type SourceLanguageInfo = Pick<SourceType, 'lang'>;
export type SourceNameInfo = Pick<SourceType, 'name'>;
export type SourceDisplayNameInfo = Pick<SourceType, 'displayName'>;
export type SourceNsfwInfo = Pick<SourceType, 'isNsfw'>;
export type SourceRepoInfo = { extension: Pick<ExtensionType, 'repo'> };
export type SourceMetaInfo = { meta: SourceMetaFieldsFragment[] };
export type SourceConfigurableInfo = Pick<SourceType, 'isConfigurable'>;
export type SourceIconInfo = Pick<SourceType, 'iconUrl'>;

export enum SourceContentType {
    POPULAR,
    LATEST,
    SEARCH,
}

export interface RouteStateSourceBrowse {
    contentType?: SourceContentType;
    clearCache?: boolean;
    mode?: MangaCardMode;
    mangaId?: MangaIdInfo['id'];
}
