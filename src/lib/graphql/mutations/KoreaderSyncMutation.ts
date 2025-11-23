/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { KO_SYNC_STATUS } from '@/lib/graphql/fragments/KoreaderSyncFragments.ts';
import { SERVER_SETTINGS } from '@/lib/graphql/fragments/SettingsFragments.ts';

export const KO_SYNC_LOGIN = gql`
    ${SERVER_SETTINGS}
    ${KO_SYNC_STATUS}

    mutation KO_SYNC_LOGIN($username: String!, $password: String!, $serverAddress: String!) {
        setSettings(input: { settings: { koreaderSyncServerUrl: $serverAddress } }) {
            settings {
                ...SERVER_SETTINGS
            }
        }
        connectKoSyncAccount(input: { username: $username, password: $password }) {
            message
            status {
                ...KO_SYNC_STATUS
            }
        }
    }
`;

export const KO_SYNC_LOGOUT = gql`
    ${KO_SYNC_STATUS}

    mutation KO_SYNC_LOGOUT {
        logoutKoSyncAccount(input: {}) {
            status {
                ...KO_SYNC_STATUS
            }
        }
    }
`;
