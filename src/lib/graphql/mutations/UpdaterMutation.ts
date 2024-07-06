/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { UPDATER_START_STOP_FIELDS } from '@/lib/graphql/fragments/UpdaterFragments.ts';

export const UPDATE_CATEGORY_MANGAS = gql`
    ${UPDATER_START_STOP_FIELDS}

    mutation UPDATE_CATEGORY_MANGAS($input: UpdateCategoryMangaInput!) {
        updateCategoryManga(input: $input) {
            clientMutationId
            updateStatus {
                ...UPDATER_START_STOP_FIELDS
            }
        }
    }
`;

export const UPDATE_LIBRARY_MANGAS = gql`
    ${UPDATER_START_STOP_FIELDS}

    mutation UPDATE_LIBRARY_MANGAS($input: UpdateLibraryMangaInput = {}) {
        updateLibraryManga(input: $input) {
            clientMutationId
            updateStatus {
                ...UPDATER_START_STOP_FIELDS
            }
        }
    }
`;

export const STOP_UPDATER = gql`
    mutation STOP_UPDATER($input: UpdateStopInput = {}) {
        updateStop(input: $input) {
            clientMutationId
        }
    }
`;
