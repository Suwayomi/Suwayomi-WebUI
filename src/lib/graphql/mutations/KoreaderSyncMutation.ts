/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SERVER_SETTINGS } from '@/lib/graphql/fragments/SettingsFragments.ts';

export const CONNECT_KOSYNC_ACCOUNT = gql`
    ${SERVER_SETTINGS}
    mutation CONNECT_KOSYNC_ACCOUNT($input: ConnectKoSyncAccountInput!) {
        connectKoSyncAccount(input: $input) {
            success
            message
            username
            settings {
                ...SERVER_SETTINGS
            }
        }
    }
`;

export const LOGOUT_KOSYNC_ACCOUNT = gql`
    ${SERVER_SETTINGS}
    mutation LOGOUT_KOSYNC_ACCOUNT($input: LogoutKoSyncAccountInput!) {
        logoutKoSyncAccount(input: $input) {
            success
            settings {
                ...SERVER_SETTINGS
            }
        }
    }
`;
