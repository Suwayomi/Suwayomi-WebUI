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
    GqlMetaHolder,
    ISourceMetadata,
    Metadata,
    SourceMetadataKeys,
    TPartialSource,
} from '@/typings.ts';
import { jsonSaveParse } from '@/util/HelperFunctions.ts';
import { convertFromGqlMeta, getMetadataFrom, requestUpdateSourceMetadata } from '@/lib/metadata/metadata.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

const convertAppMetadataToGqlMetadata = (
    metadata: Partial<ISourceMetadata>,
): Metadata<string, AllowedMetadataValueTypes> => ({
    ...metadata,
    savedSearches: metadata.savedSearches ? JSON.stringify(metadata.savedSearches) : undefined,
});

export const convertGqlMetadataToAppMetadata = (
    metadata: Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>,
): ISourceMetadata => ({
    ...(metadata as unknown as ISourceMetadata),
    savedSearches: jsonSaveParse<ISourceMetadata['savedSearches']>(metadata.savedSearches as string) ?? undefined,
});

export const getSourceMetadata = ({ meta }: GqlMetaHolder = {}, applyMetadataMigration?: boolean): ISourceMetadata =>
    convertGqlMetadataToAppMetadata(
        getMetadataFrom({ meta: convertFromGqlMeta(meta) }, { savedSearches: undefined }, applyMetadataMigration),
    );

export const updateSourceMetadata = async <
    MetadataKeys extends SourceMetadataKeys = SourceMetadataKeys,
    MetadataKey extends MetadataKeys = MetadataKeys,
>(
    source: TPartialSource,
    metadataKey: MetadataKey,
    value: ISourceMetadata[MetadataKey],
): Promise<void[]> =>
    requestUpdateSourceMetadata(source, [
        [metadataKey, convertAppMetadataToGqlMetadata({ [metadataKey]: value })[metadataKey]],
    ]);

export const createUpdateSourceMetadata =
    <Settings extends SourceMetadataKeys>(
        source: TPartialSource,
        handleError: (error: any) => void = defaultPromiseErrorHandler('createUpdateSourceMetadata'),
    ): ((...args: OmitFirst<Parameters<typeof updateSourceMetadata<Settings>>>) => Promise<void | void[]>) =>
    (metadataKey, value) =>
        updateSourceMetadata(source, metadataKey, value).catch(handleError);
