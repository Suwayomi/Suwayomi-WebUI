/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_UPDATER_STATUS } from '@/lib/graphql/Fragments';

// eslint-disable-next-line import/prefer-default-export
export const GET_UPDATE_STATUS = gql`
    ${FULL_UPDATER_STATUS}
    query GET_UPDATE_STATUS {
        updateStatus {
            ...FULL_UPDATER_STATUS
        }
    }
`;

export const GET_LAST_UPDATE_TIMESTAMP = gql`
    query GET_LAST_UPDATE_TIMESTAMP {
        lastUpdateTimestamp {
            timestamp
        }
    }
`;
