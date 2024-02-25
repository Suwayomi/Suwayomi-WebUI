/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const CHECK_LOGIN = gql`
    query CHECK_LOGIN($id: Int!) {
        trackers(condition: { id: $id }) {
            nodes {
                isLoggedIn
            }
        }
    }
`;
export const GET_LOGGED_IN_TRACKERS = gql`
    query GET_LOGGED_IN_TRACKERS {
        trackers(condition: { isLoggedIn: true }) {
            nodes {
                authUrl
                icon
                id
                name
            }
        }
    }
`;

export const SEARCH_MANGA_IN_TRACKER = gql`
    query SEARCH_MANGA_IN_TRACKER {
        searchTracker(input: { query: $mandaName, trackerId: $trackerId }) {
            trackSearches {
                remoteId
                title
                coverUrl
            }
        }
    }
`;
