/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_CHAPTER_FIELDS } from '@/lib/graphql/Fragments';

export const DELETE_CHAPTER_METADATA = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation DELETE_CHAPTER_METADATA($input: DeleteChapterMetaInput!) {
        deleteChapterMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                chapter {
                    ...FULL_CHAPTER_FIELDS
                }
            }
            chapter {
                ...FULL_CHAPTER_FIELDS
            }
        }
    }
`;

// makes the server fetch and return the pages of a chapter
export const GET_CHAPTER_PAGES_FETCH = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation GET_CHAPTER_PAGES_FETCH($input: FetchChapterPagesInput!) {
        fetchChapterPages(input: $input) {
            clientMutationId
            chapter {
                ...FULL_CHAPTER_FIELDS
            }
            pages
        }
    }
`;

// makes the server fetch and return the chapters of the manga
export const GET_MANGA_CHAPTERS_FETCH = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation GET_MANGA_CHAPTERS_FETCH($input: FetchChaptersInput!) {
        fetchChapters(input: $input) {
            clientMutationId
            chapters {
                ...FULL_CHAPTER_FIELDS
            }
        }
    }
`;

export const SET_CHAPTER_METADATA = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation SET_CHAPTER_METADATA($input: SetChapterMetaInput!) {
        setChapterMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                chapter {
                    ...FULL_CHAPTER_FIELDS
                }
            }
        }
    }
`;

export const UPDATE_CHAPTER = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation UPDATE_CHAPTER($input: UpdateChapterInput!) {
        updateChapter(input: $input) {
            clientMutationId
            chapter {
                ...FULL_CHAPTER_FIELDS
            }
        }
    }
`;

export const UPDATE_CHAPTERS = gql`
    ${FULL_CHAPTER_FIELDS}
    mutation UPDATE_CHAPTERS($input: UpdateChaptersInput!) {
        updateChapters(input: $input) {
            clientMutationId
            chapters {
                ...FULL_CHAPTER_FIELDS
            }
        }
    }
`;
