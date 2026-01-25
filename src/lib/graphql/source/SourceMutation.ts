/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_META_FIELDS, SOURCE_SETTING_FIELDS } from '@/lib/graphql/source/SourceFragments.ts';
import { MANGA_BASE_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';

export const GET_SOURCE_MANGAS_FETCH = gql`
    ${MANGA_BASE_FIELDS}

    mutation GET_SOURCE_MANGAS_FETCH($input: FetchSourceMangaInput!) {
        fetchSourceManga(input: $input) {
            hasNextPage
            mangas {
                ...MANGA_BASE_FIELDS
            }
        }
    }
`;

export const UPDATE_SOURCE_PREFERENCES = gql`
    ${SOURCE_SETTING_FIELDS}

    mutation UPDATE_SOURCE_PREFERENCES($input: UpdateSourcePreferenceInput!) {
        updateSourcePreference(input: $input) {
            source {
                ...SOURCE_SETTING_FIELDS
            }
        }
    }
`;

export const SET_SOURCE_METADATA = gql`
    ${SOURCE_META_FIELDS}

    mutation SET_SOURCE_METADATA($input: SetSourceMetasInput!) {
        setSourceMetas(input: $input) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
    }
`;

export const DELETE_SOURCE_METADATA = gql`
    ${SOURCE_META_FIELDS}

    mutation DELETE_SOURCE_METADATA($input: DeleteSourceMetasInput!) {
        deleteSourceMetas(input: $input) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
    }
`;

export const UPDATE_SOURCE_METADATA = gql`
    ${SOURCE_META_FIELDS}

    mutation UPDATE_SOURCE_METADATA(
        $updateInput: SetSourceMetasInput!
        $hasUpdates: Boolean!
        $deleteInput: DeleteSourceMetasInput!
        $hasDeletions: Boolean!
        $migrateInput: SetSourceMetasInput!
        $isMigration: Boolean!
    ) {
        updatedMeta: setSourceMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
        deletedMeta: deleteSourceMetas(input: $deleteInput) @include(if: $hasDeletions) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
        migrationMeta: setSourceMetas(input: $migrateInput) @include(if: $isMigration) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
    }
`;
