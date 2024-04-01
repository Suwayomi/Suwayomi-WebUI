/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import {
    BASE_TRACK_RECORD_FIELDS,
    QUERY_TRACK_RECORD_FIELDS,
    FULL_TRACK_RECORD_FIELDS,
} from '@/lib/graphql/Fragments.ts';

export const TRACKER_LOGIN_OAUTH = gql`
    mutation TRACKER_LOGIN_OAUTH($input: LoginTrackerOAuthInput!) {
        loginTrackerOAuth(input: $input) {
            tracker {
                id
                isLoggedIn
                authUrl
            }
        }
    }
`;

export const TRACKER_LOGIN_CREDENTIALS = gql`
    mutation TRACKER_LOGIN_CREDENTIALS($input: LoginTrackerCredentialsInput!) {
        loginTrackerCredentials(input: $input) {
            isLoggedIn
            tracker {
                id
                isLoggedIn
                authUrl
            }
        }
    }
`;

export const TRACKER_LOGOUT = gql`
    mutation TRACKER_LOGOUT($trackerId: Int!) {
        logoutTracker(input: { trackerId: $trackerId }) {
            clientMutationId
            tracker {
                id
                isLoggedIn
                authUrl
            }
        }
    }
`;

export const TRACKER_BIND = gql`
    ${QUERY_TRACK_RECORD_FIELDS}
    mutation TRACKER_BIND($mangaId: Int!, $remoteId: LongString!, $trackerId: Int!) {
        bindTrack(input: { mangaId: $mangaId, remoteId: $remoteId, trackerId: $trackerId }) {
            trackRecord {
                ...QUERY_TRACK_RECORD_FIELDS
                tracker {
                    id
                }
                manga {
                    id
                    trackRecords {
                        totalCount
                        nodes {
                            id
                        }
                    }
                }
            }
        }
    }
`;

export const TRACKER_UNBIND = gql`
    mutation TRACKER_UNBIND($input: UnbindTrackInput!) {
        unbindTrack(input: $input) {
            trackRecord {
                id
                manga {
                    id
                    trackRecords {
                        totalCount
                        nodes {
                            id
                        }
                    }
                }
            }
        }
    }
`;

export const TRACKER_UPDATE_BIND = gql`
    ${QUERY_TRACK_RECORD_FIELDS}
    mutation TRACKER_UPDATE_BIND($input: UpdateTrackInput!) {
        updateTrack(input: $input) {
            trackRecord {
                ...QUERY_TRACK_RECORD_FIELDS
                manga {
                    id
                    trackRecords {
                        totalCount
                        nodes {
                            id
                        }
                    }
                }
            }
        }
    }
`;

export const TRACKER_FETCH_BIND = gql`
    ${BASE_TRACK_RECORD_FIELDS}
    mutation TRACKER_FETCH_BIND($recordId: Int!) {
        fetchTrack(input: { recordId: $recordId }) {
            trackRecord {
                ...BASE_TRACK_RECORD_FIELDS
            }
        }
    }
`;

export const TRACKER_REFRESH = gql`
    ${FULL_TRACK_RECORD_FIELDS}
    mutation TRACKER_REFRESH($input: FetchTrackInput!) {
        fetchTrack(input: $input) {
            trackRecord {
                ...FULL_TRACK_RECORD_FIELDS
            }
        }
    }
`;
