/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_CHAPTER_FIELDS, FULL_MANGA_FIELDS, PAGE_INFO } from '@/lib/graphql/Fragments';

// returns the current manga from the database
export const GET_MANGA = gql`
    ${FULL_MANGA_FIELDS}
    ${FULL_CHAPTER_FIELDS}
    query GET_MANGA($id: Int!) {
        manga(id: $id) {
            ...FULL_MANGA_FIELDS
        }
    }
`;

// returns the current manga from the database
export const GET_MANGA_TO_MIGRATE = gql`
    query GET_MANGA_TO_MIGRATE($id: Int!, $getChapterData: Boolean!, $migrateCategories: Boolean!) {
        manga(id: $id) {
            id
            inLibrary
            title
            chapters @include(if: $getChapterData) {
                nodes {
                    id
                    manga {
                        id
                    }
                    chapterNumber
                    isRead
                    isDownloaded
                    isBookmarked
                }
                totalCount
            }
            categories @include(if: $migrateCategories) {
                nodes {
                    id
                }
            }
        }
    }
`;

// returns the current manga from the database
export const GET_MANGAS = gql`
    ${FULL_MANGA_FIELDS}
    ${FULL_CHAPTER_FIELDS}
    ${PAGE_INFO}
    query GET_MANGAS(
        $after: Cursor
        $before: Cursor
        $condition: MangaConditionInput
        $filter: MangaFilterInput
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: MangaOrderBy
        $orderByType: SortOrder
    ) {
        mangas(
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
                ...FULL_MANGA_FIELDS
            }
            pageInfo {
                ...PAGE_INFO
            }
            totalCount
        }
    }
`;

export const GET_MIGRATABLE_SOURCE_MANGAS = gql`
    query GET_MIGRATABLE_SOURCE_MANGAS($sourceId: LongString!) {
        mangas(condition: { sourceId: $sourceId, inLibrary: true }) {
            nodes {
                id
                title
                thumbnailUrl
                source {
                    id
                }
                categories {
                    nodes {
                        id
                    }
                }
            }
        }
    }
`;
