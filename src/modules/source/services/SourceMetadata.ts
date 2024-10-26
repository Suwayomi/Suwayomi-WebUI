/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { requestUpdateSourceMetadata } from '@/modules/metadata/services/MetadataUpdater.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { ISourceMetadata, SourceMetadataKeys } from '@/modules/source/Source.types.ts';
import { convertFromGqlMeta } from '@/modules/metadata/services/MetadataConverter.ts';
import { getMetadataFrom } from '@/modules/metadata/services/MetadataReader.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    GqlMetaHolder,
    Metadata,
} from '@/modules/metadata/Metadata.types.ts';

const DEFAULT_SOURCE_METADATA: ISourceMetadata = {
    savedSearches: undefined,
};

const convertAppMetadataToGqlMetadata = (
    metadata: Partial<ISourceMetadata>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...metadata,
    savedSearches: metadata.savedSearches ? JSON.stringify(metadata.savedSearches) : undefined,
});

const convertGqlMetadataToAppMetadata = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
): ISourceMetadata => ({
    ...(metadata as unknown as ISourceMetadata),
    savedSearches: jsonSaveParse<ISourceMetadata['savedSearches']>(metadata.savedSearches as string) ?? undefined,
});

const getMetadata = (
    metaHolder: Pick<SourceType, 'id'> & GqlMetaHolder,
    useEffectFn?: typeof useEffect,
): ISourceMetadata =>
    convertGqlMetadataToAppMetadata(
        getMetadataFrom(
            'source',
            { ...metaHolder, meta: convertFromGqlMeta(metaHolder.meta) },
            convertAppMetadataToGqlMetadata(DEFAULT_SOURCE_METADATA),
            true,
            useEffectFn,
        ),
    );

export const getSourceMetadata = (metaHolder: Pick<SourceType, 'id'> & GqlMetaHolder): ISourceMetadata =>
    getMetadata(metaHolder);

export const useGetSourceMetadata = (metaHolder: Pick<SourceType, 'id'> & GqlMetaHolder): ISourceMetadata => {
    const metadata = getMetadata(metaHolder, useEffect);
    return useMemo(() => metadata, [metaHolder]);
};

export const updateSourceMetadata = async <
    MetadataKeys extends SourceMetadataKeys = SourceMetadataKeys,
    MetadataKey extends MetadataKeys = MetadataKeys,
>(
    source: Pick<SourceType, 'id'> & GqlMetaHolder,
    metadataKey: MetadataKey,
    value: ISourceMetadata[MetadataKey],
): Promise<void[]> =>
    requestUpdateSourceMetadata(source, [
        [metadataKey, convertAppMetadataToGqlMetadata({ [metadataKey]: value })[metadataKey]],
    ]);

export const createUpdateSourceMetadata =
    <Settings extends SourceMetadataKeys>(
        source: Pick<SourceType, 'id'> & GqlMetaHolder,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateSourceMetadata'),
    ): ((...args: OmitFirst<Parameters<typeof updateSourceMetadata<Settings>>>) => Promise<void | void[]>) =>
    (metadataKey, value) =>
        updateSourceMetadata(source, metadataKey, value).catch(handleError);
