/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { BASE_MANGA_FIELDS, FULL_SOURCE_FIELDS } from '@/lib/graphql/Fragments';

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
    ${FULL_SOURCE_FIELDS}
    mutation UPDATE_SOURCE_PREFERENCES($input: UpdateSourcePreferenceInput!) {
        updateSourcePreference(input: $input) {
            clientMutationId
            source {
                ...FULL_SOURCE_FIELDS
            }
        }
    }
`;
