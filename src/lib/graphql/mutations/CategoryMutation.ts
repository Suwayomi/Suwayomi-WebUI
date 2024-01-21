/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_CATEGORY_FIELDS } from '@/lib/graphql/Fragments';

export const CREATE_CATEGORY = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation CREATE_CATEGORY($input: CreateCategoryInput!) {
        createCategory(input: $input) {
            clientMutationId
            category {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;

export const DELETE_CATEGORY = gql`
    mutation DELETE_CATEGORY($input: DeleteCategoryInput!) {
        deleteCategory(input: $input) {
            clientMutationId
            category {
                id
            }
        }
    }
`;

export const DELETE_CATEGORY_METADATA = gql`
    mutation DELETE_CATEGORY_METADATA($input: DeleteCategoryMetaInput!) {
        deleteCategoryMeta(input: $input) {
            clientMutationId
            meta {
                key
            }
            category {
                id
                meta {
                    key
                    value
                }
            }
        }
    }
`;

export const SET_CATEGORY_METADATA = gql`
    mutation SET_CATEGORY_METADATA($input: SetCategoryMetaInput!) {
        setCategoryMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                category {
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

export const UPDATE_CATEGORY = gql`
    mutation UPDATE_CATEGORY(
        $input: UpdateCategoryInput!
        $getDefault: Boolean!
        $getIncludeInUpdate: Boolean!
        $getIncludeInDownload: Boolean!
        $getName: Boolean!
    ) {
        updateCategory(input: $input) {
            clientMutationId
            category {
                id
                default @include(if: $getDefault)
                includeInUpdate @include(if: $getIncludeInUpdate)
                includeInDownload @include(if: $getIncludeInDownload)
                name @include(if: $getName)
            }
        }
    }
`;

export const UPDATE_CATEGORIES = gql`
    mutation UPDATE_CATEGORIES(
        $input: UpdateCategoriesInput!
        $getDefault: Boolean!
        $getIncludeInUpdate: Boolean!
        $getIncludeInDownload: Boolean!
        $getName: Boolean!
    ) {
        updateCategories(input: $input) {
            clientMutationId
            categories {
                id
                default @include(if: $getDefault)
                includeInUpdate @include(if: $getIncludeInUpdate)
                includeInDownload @include(if: $getIncludeInDownload)
                name @include(if: $getName)
            }
        }
    }
`;

export const UPDATE_CATEGORY_ORDER = gql`
    mutation UPDATE_CATEGORY_ORDER($input: UpdateCategoryOrderInput!) {
        updateCategoryOrder(input: $input) {
            clientMutationId
            categories {
                id
                order
            }
        }
    }
`;
