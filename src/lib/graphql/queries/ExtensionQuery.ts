/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_EXTENSION_FIELDS, PAGE_INFO } from '@/lib/graphql/Fragments';

// returns the current extension from the database
export const GET_EXTENSION = gql`
    ${FULL_EXTENSION_FIELDS}
    query GET_EXTENSION($pkgName: String!) {
        extension(pkgName: $pkgName) {
            ...FULL_EXTENSION_FIELDS
        }
    }
`;

// returns the current extensions from the database
export const GET_EXTENSIONS = gql`
    ${FULL_EXTENSION_FIELDS}
    ${PAGE_INFO}
    query GET_EXTENSIONS(
        $after: Cursor
        $before: Cursor
        $condition: ExtensionConditionInput
        $filter: ExtensionFilterInput
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: ExtensionOrderBy
        $orderByType: SortOrder
    ) {
        extensions(
            after: $after
            before: $before
            condition: $condition
            filter: $filter
            first: $first
            last: $last
            offset: $offset
            orderBy: $orderBy
            orderByType: $orderByType
        ) {
            nodes {
                ...FULL_EXTENSION_FIELDS
            }
            pageInfo {
                ...PAGE_INFO
            }
            totalCount
        }
    }
`;
