/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    GetSourceBrowseQuery,
    GetSourceSettingsQuery,
    SourcePreferenceChangeInput,
} from '@/lib/graphql/generated/graphql.ts';

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
    ExtractByKeyValue<SourcePreferences, '__typename', 'CheckBoxPreference'>;

export type SwitchPreferenceCompatProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'SwitchPreference'>;

export type TwoStatePreferenceProps = (CheckBoxPreferenceProps | SwitchPreferenceCompatProps) & {
    // intetnal props
    twoStateType: 'Switch' | 'Checkbox';
};

export type ListPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'ListPreference'>;

export type MultiSelectListPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'MultiSelectListPreference'>;

export type EditTextPreferenceProps = PreferenceProps &
    ExtractByKeyValue<SourcePreferences, '__typename', 'EditTextPreference'>;
