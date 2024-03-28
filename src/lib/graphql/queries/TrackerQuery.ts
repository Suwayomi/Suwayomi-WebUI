/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_TRACKER_FIELDS, PAGE_INFO } from '@/lib/graphql/Fragments.ts';

export const GET_TRACKERS = gql`
    ${PAGE_INFO}
    ${FULL_TRACKER_FIELDS}
    query GET_TRACKERS {
        trackers {
            totalCount
            pageInfo {
                ...PAGE_INFO
            }
            nodes {
                ...FULL_TRACKER_FIELDS
            }
        }
    }
`;

export const TRACKER_SEARCH = gql`
    query TRACKER_SEARCH($query: String!, $trackerId: Int!) {
        searchTracker(input: { query: $query, trackerId: $trackerId }) {
            trackSearches {
                id
                title
                coverUrl
                publishingStatus
                publishingType
                remoteId
                startDate
                summary
                totalChapters
                trackerId
                trackingUrl
            }
        }
    }
`;
