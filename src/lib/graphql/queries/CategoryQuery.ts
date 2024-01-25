/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_CATEGORY_FIELDS, FULL_MANGA_FIELDS, PAGE_INFO } from '@/lib/graphql/Fragments';

export const GET_CATEGORIES = gql`
    ${FULL_CATEGORY_FIELDS}
    ${PAGE_INFO}
    query GET_CATEGORIES(
        $after: Cursor
        $before: Cursor
        $condition: CategoryConditionInput
        $filter: CategoryFilterInput
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: CategoryOrderBy
        $orderByType: SortOrder
    ) {
        categories(
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
                ...FULL_CATEGORY_FIELDS
            }
            pageInfo {
                ...PAGE_INFO
            }
            totalCount
        }
    }
`;

export const GET_CATEGORY = gql`
    ${FULL_CATEGORY_FIELDS}
    query GET_CATEGORY($id: Int!) {
        category(id: $id) {
            ...FULL_CATEGORY_FIELDS
        }
    }
`;

export const GET_CATEGORY_MANGAS = gql`
    ${FULL_MANGA_FIELDS}
    ${PAGE_INFO}
    query GET_CATEGORY_MANGAS($id: Int!) {
        category(id: $id) {
            id
            mangas {
                nodes {
                    ...FULL_MANGA_FIELDS
                }
                pageInfo {
                    ...PAGE_INFO
                }
                totalCount
            }
        }
    }
`;
