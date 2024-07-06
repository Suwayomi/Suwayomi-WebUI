/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { UPDATER_SUBSCRIPTION_FIELDS } from '@/lib/graphql/fragments/UpdaterFragments.ts';

export const GET_UPDATE_STATUS = gql`
    ${UPDATER_SUBSCRIPTION_FIELDS}

    query GET_UPDATE_STATUS {
        updateStatus {
            ...UPDATER_SUBSCRIPTION_FIELDS
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
