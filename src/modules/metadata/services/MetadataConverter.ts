/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MetaType } from '@/lib/graphql/generated/graphql.ts';
import { AllowedMetadataValueTypes, AppMetadataKeys, Metadata } from '@/modules/metadata/Metadata.types.ts';
import { APP_METADATA_KEY_TO_TYPE } from '@/modules/metadata/Metadata.constants.ts';

export const convertValueFromMetadata = <T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes>(
    key: string,
    value: string,
): T => {
    const typeOfKey = APP_METADATA_KEY_TO_TYPE[key as AppMetadataKeys];
    const isAutoType = typeOfKey === 'auto';

    if ((isAutoType && !Number.isNaN(+value)) || typeOfKey === 'number') {
        return +value as T;
    }

    if ((isAutoType && (value === 'true' || value === 'false')) || typeOfKey === 'boolean') {
        return (value === 'true') as T;
    }

    if (isAutoType && value === 'undefined') {
        return undefined as T;
    }

    if (isAutoType && value === 'null') {
        return null as T;
    }

    return value as T;
};

export const convertFromGqlMeta = (
    gqlMetadata?: MetaType[],
    filter: (key: string) => boolean = () => true,
): Metadata | undefined => {
    if (!gqlMetadata) {
        return undefined;
    }

    const metadata: Metadata = {};
    gqlMetadata.forEach(({ key, value }) => {
        if (filter(key)) {
            metadata[key] = value;
        }
    });

    return metadata;
};

export const convertToGqlMeta = (metadata?: Metadata): MetaType[] | undefined => {
    if (!metadata) {
        return undefined;
    }

    return Object.entries(metadata).map(([key, value]) => ({ key, value }));
};
