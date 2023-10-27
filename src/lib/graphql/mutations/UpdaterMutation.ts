/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { PARTIAL_UPDATER_STATUS } from '@/lib/graphql/Fragments';

export const UPDATE_CATEGORY_MANGAS = gql`
    ${PARTIAL_UPDATER_STATUS}
    mutation UPDATE_CATEGORY_MANGAS($input: UpdateCategoryMangaInput!) {
        updateCategoryManga(input: $input) {
            clientMutationId
            updateStatus {
                ...PARTIAL_UPDATER_STATUS
            }
        }
    }
`;

export const UPDATE_LIBRARY_MANGAS = gql`
    ${PARTIAL_UPDATER_STATUS}
    mutation UPDATE_LIBRARY_MANGAS($input: UpdateLibraryMangaInput = {}) {
        updateLibraryManga(input: $input) {
            clientMutationId
            updateStatus {
                ...PARTIAL_UPDATER_STATUS
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
