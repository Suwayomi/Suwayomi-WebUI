/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { BASE_MANGA_FIELDS } from '@/lib/graphql/Fragments';

export const GET_SOURCE_MANGAS_FETCH = gql`
    ${BASE_MANGA_FIELDS}
    mutation GET_SOURCE_MANGAS_FETCH($input: FetchSourceMangaInput!) {
        fetchSourceManga(input: $input) {
            clientMutationId
            hasNextPage
            mangas {
                ...BASE_MANGA_FIELDS
            }
        }
    }
`;

export const UPDATE_SOURCE_PREFERENCES = gql`
    mutation UPDATE_SOURCE_PREFERENCES($input: UpdateSourcePreferenceInput!) {
        updateSourcePreference(input: $input) {
            clientMutationId
            source {
                id
                preferences {
                    ... on CheckBoxPreference {
                        type: __typename
                        CheckBoxCheckBoxCurrentValue: currentValue
                        summary
                        CheckBoxDefault: default
                        key
                        CheckBoxTitle: title
                    }
                    ... on EditTextPreference {
                        type: __typename
                        EditTextPreferenceCurrentValue: currentValue
                        EditTextPreferenceDefault: default
                        EditTextPreferenceTitle: title
                        text
                        summary
                        key
                        dialogTitle
                        dialogMessage
                    }
                    ... on SwitchPreference {
                        type: __typename
                        SwitchPreferenceCurrentValue: currentValue
                        summary
                        key
                        SwitchPreferenceDefault: default
                        SwitchPreferenceTitle: title
                    }
                    ... on MultiSelectListPreference {
                        type: __typename
                        dialogMessage
                        dialogTitle
                        MultiSelectListPreferenceTitle: title
                        summary
                        key
                        entryValues
                        entries
                        MultiSelectListPreferenceDefault: default
                        MultiSelectListPreferenceCurrentValue: currentValue
                    }
                    ... on ListPreference {
                        type: __typename
                        ListPreferenceCurrentValue: currentValue
                        ListPreferenceDefault: default
                        ListPreferenceTitle: title
                        summary
                        key
                        entryValues
                        entries
                    }
                }
            }
        }
    }
`;
