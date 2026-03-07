/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { GLOBAL_METADATA } from '@/lib/graphql/common/Fragments.ts';

export const UPDATE_GLOBAL_METADATA = gql`
    ${GLOBAL_METADATA}
    mutation UPDATE_GLOBAL_METADATA(
        $preUpdateDeleteInput: DeleteGlobalMetasInput!
        $hasPreUpdateDeletions: Boolean!
        $updateInput: SetGlobalMetasInput!
        $hasUpdates: Boolean!
        $postUpdateDeleteInput: DeleteGlobalMetasInput!
        $hasPostUpdateDeletions: Boolean!
        $migrateInput: SetGlobalMetasInput!
        $isMigration: Boolean!
    ) {
        preUpdateDeletedMeta: deleteGlobalMetas(input: $preUpdateDeleteInput) @include(if: $hasPreUpdateDeletions) {
            metas {
                ...GLOBAL_METADATA
            }
        }
        updatedMeta: setGlobalMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...GLOBAL_METADATA
            }
        }
        postUpdateDeletedMeta: deleteGlobalMetas(input: $postUpdateDeleteInput) @include(if: $hasPostUpdateDeletions) {
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
