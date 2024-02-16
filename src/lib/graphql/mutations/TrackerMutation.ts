/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

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
