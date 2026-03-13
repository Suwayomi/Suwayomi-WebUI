/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_META_FIELDS, SOURCE_SETTING_FIELDS } from '@/lib/graphql/source/SourceFragments.ts';
import { MANGA_BASE_FIELDS, MANGA_MIGRATION_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';

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

export const GET_MIGRATION_SOURCE_MANGAS_FETCH = gql`
    ${MANGA_MIGRATION_FIELDS}

    mutation GET_MIGRATION_SOURCE_MANGAS_FETCH($input: FetchSourceMangaInput!) {
        fetchSourceManga(input: $input) {
            hasNextPage
            mangas {
                ...MANGA_MIGRATION_FIELDS
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

export const UPDATE_SOURCE_METADATA = gql`
    ${SOURCE_META_FIELDS}

    mutation UPDATE_SOURCE_METADATA(
        $preUpdateDeleteInput: DeleteSourceMetasInput!
        $hasPreUpdateDeletions: Boolean!
        $updateInput: SetSourceMetasInput!
        $hasUpdates: Boolean!
        $postUpdateDeleteInput: DeleteSourceMetasInput!
        $hasPostUpdateDeletions: Boolean!
        $migrateInput: SetSourceMetasInput!
        $isMigration: Boolean!
    ) {
        preUpdateDeletedMeta: deleteSourceMetas(input: $preUpdateDeleteInput) @include(if: $hasPreUpdateDeletions) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
        updatedMeta: setSourceMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...SOURCE_META_FIELDS
            }
        }
        postUpdateDeletedMeta: deleteSourceMetas(input: $postUpdateDeleteInput) @include(if: $hasPostUpdateDeletions) {
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
