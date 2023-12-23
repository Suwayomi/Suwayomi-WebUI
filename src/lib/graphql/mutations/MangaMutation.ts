/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_MANGA_FIELDS } from '@/lib/graphql/Fragments';

export const DELETE_MANGA_METADATA = gql`
    mutation DELETE_MANGA_METADATA($input: DeleteMangaMetaInput!) {
        deleteMangaMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                manga {
                    id
                    meta {
                        key
                        value
                    }
                }
            }
            manga {
                id
                meta {
                    key
                    value
                }
            }
        }
    }
`;

// makes the server fetch and return the manga
export const GET_MANGA_FETCH = gql`
    ${FULL_MANGA_FIELDS}
    mutation GET_MANGA_FETCH($input: FetchMangaInput!) {
        fetchManga(input: $input) {
            clientMutationId
            manga {
                ...FULL_MANGA_FIELDS
            }
        }
    }
`;

export const SET_MANGA_METADATA = gql`
    mutation SET_MANGA_METADATA($input: SetMangaMetaInput!) {
        setMangaMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                manga {
                    id
                    meta {
                        key
                        value
                    }
                }
            }
        }
    }
`;

export const UPDATE_MANGA = gql`
    mutation UPDATE_MANGA($input: UpdateMangaInput!) {
        updateManga(input: $input) {
            clientMutationId
            manga {
                id
                inLibrary
                inLibraryAt
            }
        }
    }
`;

export const UPDATE_MANGAS = gql`
    mutation UPDATE_MANGAS($input: UpdateMangasInput!) {
        updateMangas(input: $input) {
            clientMutationId
            mangas {
                id
                inLibrary
                inLibraryAt
            }
        }
    }
`;

export const UPDATE_MANGA_CATEGORIES = gql`
    mutation UPDATE_MANGA_CATEGORIES($input: UpdateMangaCategoriesInput!) {
        updateMangaCategories(input: $input) {
            clientMutationId
            manga {
                id
                categories {
                    nodes {
                        id
                        mangas {
                            totalCount
                        }
                    }
                    totalCount
                }
            }
        }
    }
`;

export const UPDATE_MANGAS_CATEGORIES = gql`
    mutation UPDATE_MANGAS_CATEGORIES($input: UpdateMangasCategoriesInput!) {
        updateMangasCategories(input: $input) {
            clientMutationId
            mangas {
                id
                categories {
                    nodes {
                        id
                        mangas {
                            totalCount
                        }
                    }
                    totalCount
                }
            }
        }
    }
`;
