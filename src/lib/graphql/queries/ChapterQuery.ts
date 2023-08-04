/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_CHAPTER_FIELDS, PAGE_INFO } from '@/lib/graphql/Fragments';

// returns the current chapter from the database
export const GET_CHAPTER = gql`
    ${FULL_CHAPTER_FIELDS}
    query GET_CHAPTER($id: Int!) {
        chapter(id: $id) {
            ...FULL_CHAPTER_FIELDS
        }
    }
`;

// returns the current chapters from the database
export const GET_CHAPTERS = gql`
    ${FULL_CHAPTER_FIELDS}
    ${PAGE_INFO}
    query GET_CHAPTERS(
        $after: Cursor
        $before: Cursor
        $condition: ChapterConditionInput
        $filter: ChapterFilterInput
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: ChapterOrderBy
        $orderByType: SortOrder
    ) {
        chapters(
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
                ...FULL_CHAPTER_FIELDS
            }
            pageInfo {
                ...PAGE_INFO
            }
            totalCount
        }
    }
`;
