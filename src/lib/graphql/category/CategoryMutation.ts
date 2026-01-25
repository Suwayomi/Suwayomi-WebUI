/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { CATEGORY_META_FIELDS, CATEGORY_SETTING_FIELDS } from '@/lib/graphql/category/CategoryFragments.ts';

export const CREATE_CATEGORY = gql`
    ${CATEGORY_SETTING_FIELDS}
    mutation CREATE_CATEGORY($input: CreateCategoryInput!) {
        createCategory(input: $input) {
            category {
                ...CATEGORY_SETTING_FIELDS
            }
        }
    }
`;

export const DELETE_CATEGORY = gql`
    mutation DELETE_CATEGORY($input: DeleteCategoryInput!) {
        deleteCategory(input: $input) {
            category {
                id
            }
        }
    }
`;

export const DELETE_CATEGORY_METADATA = gql`
    ${CATEGORY_META_FIELDS}

    mutation DELETE_CATEGORY_METADATA($input: DeleteCategoryMetasInput!) {
        deleteCategoryMetas(input: $input) {
            metas {
                ...CATEGORY_META_FIELDS
            }
        }
    }
`;

export const SET_CATEGORY_METADATA = gql`
    ${CATEGORY_META_FIELDS}

    mutation SET_CATEGORY_METADATA($input: SetCategoryMetasInput!) {
        setCategoryMetas(input: $input) {
            metas {
                ...CATEGORY_META_FIELDS
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
            categories {
                id
                order
            }
        }
    }
`;

export const UPDATE_CATEGORY_METADATA = gql`
    ${CATEGORY_META_FIELDS}

    mutation UPDATE_CATEGORY_METADATA(
        $updateInput: SetCategoryMetasInput!
        $hasUpdates: Boolean!
        $deleteInput: DeleteCategoryMetasInput!
        $hasDeletions: Boolean!
        $migrateInput: SetCategoryMetasInput!
        $isMigration: Boolean!
    ) {
        updatedMeta: setCategoryMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...CATEGORY_META_FIELDS
            }
        }
        deletedMeta: deleteCategoryMetas(input: $deleteInput) @include(if: $hasDeletions) {
            metas {
                ...CATEGORY_META_FIELDS
            }
        }
        migrationMeta: setCategoryMetas(input: $migrateInput) @include(if: $isMigration) {
            metas {
                ...CATEGORY_META_FIELDS
            }
        }
    }
`;
