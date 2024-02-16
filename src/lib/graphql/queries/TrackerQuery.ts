/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { PAGE_INFO } from '@/lib/graphql/Fragments.ts';

export const GET_TRACKERS = gql`
    ${PAGE_INFO}
    query GET_TRACKERS {
        trackers {
            totalCount
            pageInfo {
                ...PAGE_INFO
            }
            nodes {
                id
                name
                authUrl
                icon
                isLoggedIn
            }
        }
    }
`;
