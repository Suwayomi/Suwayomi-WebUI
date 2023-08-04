/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_SOURCE_FIELDS, PARTIAL_SOURCE_FIELDS } from '@/lib/graphql/Fragments';

export const GET_SOURCE = gql`
    ${FULL_SOURCE_FIELDS}
    query GET_SOURCE($id: LongString!) {
        source(id: $id) {
            ...FULL_SOURCE_FIELDS
        }
    }
`;

export const GET_SOURCES = gql`
    ${PARTIAL_SOURCE_FIELDS}
    query GET_SOURCES {
        sources {
            nodes {
                ...PARTIAL_SOURCE_FIELDS
            }
        }
    }
`;
