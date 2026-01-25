/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { GLOBAL_METADATA } from '@/lib/graphql/common/Fragments.ts';

export const DELETE_GLOBAL_METADATA = gql`
    ${GLOBAL_METADATA}
    mutation DELETE_GLOBAL_METADATA($input: DeleteGlobalMetasInput!) {
        deleteGlobalMetas(input: $input) {
            metas {
                ...GLOBAL_METADATA
            }
        }
    }
`;

export const SET_GLOBAL_METADATA = gql`
    ${GLOBAL_METADATA}
    mutation SET_GLOBAL_METADATA($input: SetGlobalMetasInput!) {
        setGlobalMetas(input: $input) {
            metas {
                ...GLOBAL_METADATA
            }
        }
    }
`;

export const UPDATE_GLOBAL_METADATA = gql`
    ${GLOBAL_METADATA}
    mutation UPDATE_GLOBAL_METADATA(
        $updateInput: SetGlobalMetasInput!
        $hasUpdates: Boolean!
        $deleteInput: DeleteGlobalMetasInput!
        $hasDeletions: Boolean!
        $migrateInput: SetGlobalMetasInput!
        $isMigration: Boolean!
    ) {
        updatedMeta: setGlobalMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...GLOBAL_METADATA
            }
        }
        deletedMeta: deleteGlobalMetas(input: $deleteInput) @include(if: $hasDeletions) {
            metas {
                ...GLOBAL_METADATA
            }
        }
        migrationMeta: setGlobalMetas(input: $migrateInput) @include(if: $isMigration) {
            metas {
                ...GLOBAL_METADATA
            }
        }
    }
`;
