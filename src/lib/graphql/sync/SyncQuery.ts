/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SYNC_STATUS_FIELDS } from '@/lib/graphql/sync/SyncFragments.ts';

export const GET_SYNC_STATUS = gql`
    ${SYNC_STATUS_FIELDS}

    query GET_SYNC_STATUS {
        lastSyncStatus {
            ...SYNC_STATUS_FIELDS
        }
    }
`;
