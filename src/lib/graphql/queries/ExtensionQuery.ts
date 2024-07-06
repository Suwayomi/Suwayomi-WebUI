/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { PAGE_INFO } from '@/lib/graphql/Fragments';
import { EXTENSION_LIST_FIELDS } from '@/lib/graphql/fragments/ExtensionFragments.ts';

// returns the current extensions from the database
export const GET_EXTENSIONS = gql`
    ${EXTENSION_LIST_FIELDS}
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
                ...EXTENSION_LIST_FIELDS
            }
            pageInfo {
                ...PAGE_INFO
            }
            totalCount
        }
    }
`;
