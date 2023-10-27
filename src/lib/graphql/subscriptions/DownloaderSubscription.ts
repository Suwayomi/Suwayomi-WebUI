/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_DOWNLOAD_STATUS } from '@/lib/graphql/Fragments';

export const DOWNLOAD_STATUS_SUBSCRIPTION = gql`
    ${FULL_DOWNLOAD_STATUS}
    subscription DOWNLOAD_STATUS_SUBSCRIPTION {
        downloadChanged {
            ...FULL_DOWNLOAD_STATUS
        }
    }
`;
