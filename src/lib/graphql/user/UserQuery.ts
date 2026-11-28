/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const GET_USERS = gql`
    query GET_USERS {
        users {
            nodes {
                id
                username
                roles
                permissions
            }
        }
    }
`;

export const GET_USER_DELETION_SUPPORT = gql`
    query GET_USER_DELETION_SUPPORT {
        mutationType: __type(name: "Mutation") {
            fields {
                name
            }
        }
    }
`;
