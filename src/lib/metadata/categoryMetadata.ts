/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    CategoryMetadataKeys,
    GqlMetaHolder,
    ICategoryMetadata,
    LibraryOptions,
    Metadata,
} from '@/typings.ts';
import { jsonSaveParse } from '@/util/HelperFunctions.ts';
import { convertFromGqlMeta, getMetadataFrom, requestUpdateCategoryMetadata } from '@/lib/metadata/metadata.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { CategoryIdInfo } from '@/lib/data/Categories.ts';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';

export const getDefaultCategoryMetadata = (): ICategoryMetadata => ({
    // display options
    showContinueReadingButton: false,
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: GridLayout.Compact,

    // sort options
    sortDesc: undefined,
    sortBy: undefined,

    // filter options
    hasDownloadedChapters: undefined,
    hasBookmarkedChapters: undefined,
    hasUnreadChapters: undefined,
    hasDuplicateChapters: undefined,
    hasTrackerBinding: {},
    hasStatus: {} as LibraryOptions['hasStatus'],
});

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
    meta?: Metadata,
    defaultMetadata: ICategoryMetadata = getDefaultCategoryMetadata(),
    applyMetadataMigration: boolean = true,
): ICategoryMetadata =>
    convertGqlMetadataToAppMetadata(
        getMetadataFrom({ meta }, convertAppMetadataToGqlMetadata(defaultMetadata), applyMetadataMigration),
    );

export const getCategoryMetadata = (
    { meta }: GqlMetaHolder = {},
    defaultMetadata?: ICategoryMetadata,
    applyMetadataMigration?: boolean,
): ICategoryMetadata =>
    getCategoryMetadataWithDefaultValueFallback(convertFromGqlMeta(meta), defaultMetadata, applyMetadataMigration);

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
