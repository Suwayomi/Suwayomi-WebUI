/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MetaType } from '@/lib/graphql/generated/graphql.ts';
import { AllowedMetadataValueTypes, Metadata } from '@/modules/metadata/Metadata.types.ts';

export const convertValueFromMetadata = <T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes>(
    value: string,
): T => {
    if (!Number.isNaN(+value)) {
        return +value as T;
    }

    if (value === 'true' || value === 'false') {
        return (value === 'true') as T;
    }

    if (value === 'undefined') {
        return undefined as T;
    }

    if (value === 'null') {
        return null as T;
    }

    return value as T;
};

export const convertFromGqlMeta = (gqlMetadata?: MetaType[]): Metadata | undefined => {
    if (!gqlMetadata) {
        return undefined;
    }

    const metadata: Metadata = {};
    gqlMetadata.forEach(({ key, value }) => {
        metadata[key] = value;
    });

    return metadata;
};

export const convertToGqlMeta = (metadata?: Metadata): MetaType[] | undefined => {
    if (!metadata) {
        return undefined;
    }

    return Object.entries(metadata).map(([key, value]) => ({ key, value }));
};
