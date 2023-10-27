/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SERVER_SETTINGS } from '@/lib/graphql/Fragments';

export const RESET_SERVER_SETTINGS = gql`
    ${SERVER_SETTINGS}
    mutation RESET_SERVER_SETTINGS($input: ResetSettingsInput!) {
        resetSettings(input: $input) {
            clientMutationId
            settings {
                ...SERVER_SETTINGS
            }
        }
    }
`;

export const UPDATE_SERVER_SETTINGS = gql`
    ${SERVER_SETTINGS}
    mutation UPDATE_SERVER_SETTINGS($input: SetSettingsInput!) {
        setSettings(input: $input) {
            clientMutationId
            settings {
                ...SERVER_SETTINGS
            }
        }
    }
`;
