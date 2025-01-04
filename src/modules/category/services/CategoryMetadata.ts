/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { requestUpdateCategoryMetadata } from '@/modules/metadata/services/MetadataUpdater.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LibraryOptions } from '@/modules/library/Library.types.ts';
import { CategoryIdInfo, CategoryMetadataKeys, ICategoryMetadata } from '@/modules/category/Category.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    Metadata,
    MetadataHolder,
} from '@/modules/metadata/Metadata.types.ts';
import { GridLayout } from '@/modules/core/Core.types.ts';

export const DEFAULT_CATEGORY_METADATA: ICategoryMetadata = {
    // display options
    gridLayout: GridLayout.Compact,

    // sort options
    sortDesc: undefined,
    sortBy: undefined,

    // filter options
    hasDownloadedChapters: undefined,
    hasBookmarkedChapters: undefined,
    hasUnreadChapters: undefined,
    hasReadChapters: undefined,
    hasDuplicateChapters: undefined,
    hasTrackerBinding: {},
    hasStatus: {} as LibraryOptions['hasStatus'],
};

const convertAppMetadataToGqlMetadata = (
    metadata: Partial<ICategoryMetadata>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...metadata,
    hasTrackerBinding: metadata.hasTrackerBinding ? JSON.stringify(metadata.hasTrackerBinding) : undefined,
    hasStatus: metadata.hasStatus ? JSON.stringify(metadata.hasStatus) : undefined,
});

const convertGqlMetadataToAppMetadata = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
): ICategoryMetadata => ({
    ...(metadata as unknown as ICategoryMetadata),
    hasTrackerBinding:
        jsonSaveParse<ICategoryMetadata['hasTrackerBinding']>(metadata.hasTrackerBinding as string) ??
        (undefined as any),
    hasStatus: jsonSaveParse<ICategoryMetadata['hasStatus']>(metadata.hasStatus as string) ?? (undefined as any),
});

const getCategoryMetadataWithDefaultValueFallback = (
    meta: CategoryIdInfo & MetadataHolder,
    defaultMetadata: ICategoryMetadata = DEFAULT_CATEGORY_METADATA,
    useEffectFn?: typeof useEffect,
): ICategoryMetadata =>
    convertGqlMetadataToAppMetadata(
        getMetadataFrom('category', meta, convertAppMetadataToGqlMetadata(defaultMetadata), undefined, useEffectFn),
    );

const getMetadata = (
    metaHolder: CategoryIdInfo & GqlMetaHolder,
    defaultMetadata?: ICategoryMetadata,
    useEffectFn?: typeof useEffect,
) =>
    getCategoryMetadataWithDefaultValueFallback(
        { ...metaHolder, meta: convertFromGqlMeta(metaHolder.meta) },
        defaultMetadata,
        useEffectFn,
    );

export const getCategoryMetadata = (
    metaHolder: CategoryIdInfo & GqlMetaHolder,
    defaultMetadata?: ICategoryMetadata,
): ICategoryMetadata => getMetadata(metaHolder, defaultMetadata);

export const useGetCategoryMetadata = (
    metaHolder: CategoryIdInfo & GqlMetaHolder,
    defaultMetadata?: ICategoryMetadata,
): ICategoryMetadata => {
    const metadata = getMetadata(metaHolder, defaultMetadata, useEffect);
    return useMemo(() => metadata, [metaHolder, defaultMetadata]);
};

export const updateCategoryMetadata = async <
    MetadataKeys extends CategoryMetadataKeys = CategoryMetadataKeys,
    MetadataKey extends MetadataKeys = MetadataKeys,
>(
    category: CategoryIdInfo & GqlMetaHolder,
    metadataKey: MetadataKey,
    value: ICategoryMetadata[MetadataKey],
): Promise<void[]> =>
    requestUpdateCategoryMetadata(category, [
        [metadataKey, convertAppMetadataToGqlMetadata({ [metadataKey]: value })[metadataKey]],
    ]);

export const createUpdateCategoryMetadata =
    <Settings extends CategoryMetadataKeys>(
        category: CategoryIdInfo & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateCategoryMetadata'),
    ): ((...args: OmitFirst<Parameters<typeof updateCategoryMetadata<Settings>>>) => Promise<void | void[]>) =>
    (metadataKey, value) =>
        updateCategoryMetadata(category, metadataKey, value).catch(handleError);
