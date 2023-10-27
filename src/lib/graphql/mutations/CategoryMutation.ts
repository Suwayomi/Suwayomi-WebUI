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
    ${FULL_CATEGORY_FIELDS}
    mutation DELETE_CATEGORY($input: DeleteCategoryInput!) {
        deleteCategory(input: $input) {
            clientMutationId
            category {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;

export const DELETE_CATEGORY_METADATA = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation DELETE_CATEGORY_METADATA($input: DeleteCategoryMetaInput!) {
        deleteCategoryMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                category {
                    ...FULL_CATEGORY_FIELDS
                }
            }
            category {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;

export const SET_CATEGORY_METADATA = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation SET_CATEGORY_METADATA($input: SetCategoryMetaInput!) {
        setCategoryMeta(input: $input) {
            clientMutationId
            meta {
                key
                value
                category {
                    ...FULL_CATEGORY_FIELDS
                }
            }
        }
    }
`;

export const UPDATE_CATEGORY = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation UPDATE_CATEGORY($input: UpdateCategoryInput!) {
        updateCategory(input: $input) {
            clientMutationId
            category {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;

export const UPDATE_CATEGORIES = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation UPDATE_CATEGORIES($input: UpdateCategoriesInput!) {
        updateCategories(input: $input) {
            clientMutationId
            categories {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;

export const UPDATE_CATEGORY_ORDER = gql`
    ${FULL_CATEGORY_FIELDS}
    mutation UPDATE_CATEGORY_ORDER($input: UpdateCategoryOrderInput!) {
        updateCategoryOrder(input: $input) {
            clientMutationId
            categories {
                ...FULL_CATEGORY_FIELDS
            }
        }
    }
`;
