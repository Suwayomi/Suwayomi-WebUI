/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_METADATA_KEY_PREFIX, GLOBAL_METADATA_KEYS } from '@/modules/metadata/Metadata.constants.ts';
import { DEFAULT_DEVICE, getActiveDevice } from '@/modules/device/services/Device.ts';
import { applyMetadataMigrations } from '@/modules/metadata/services/MetadataMigrations.ts';
import { convertValueFromMetadata } from '@/modules/metadata/services/MetadataConverter.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    Metadata,
    MetadataHolder,
} from '@/modules/metadata/Metadata.types.ts';

export const getMetadataKey = (key: string, appPrefix: string = APP_METADATA_KEY_PREFIX) => {
    const isGlobalMetadataKey = GLOBAL_METADATA_KEYS.includes(key as AppMetadataKeys);
    const addActiveDevicePrefix = !isGlobalMetadataKey && getActiveDevice() !== DEFAULT_DEVICE;

    return `${appPrefix}${addActiveDevicePrefix ? `${getActiveDevice()}_` : ''}${key}`;
};

export const doesMetadataKeyExistIn = (meta: Metadata | undefined, key: string, appPrefix?: string): boolean =>
    Object.prototype.hasOwnProperty.call(meta ?? {}, getMetadataKey(key, appPrefix));

export const getMetadataValueFrom = <Key extends AppMetadataKeys, Value extends AllowedMetadataValueTypes>(
    { meta }: MetadataHolder,
    key: Key,
    defaultValue?: Value,
    applyMigrations: boolean = true,
): Value | undefined => {
    const metadata = applyMigrations ? applyMetadataMigrations(meta) : meta;

    if (metadata === undefined || !doesMetadataKeyExistIn(metadata, key)) {
        return defaultValue;
    }

    return convertValueFromMetadata(metadata[getMetadataKey(key)]);
};

export const getMetadataFrom = <METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    { meta }: MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
): METADATA => {
    const appMetadata = {} as METADATA;

    Object.entries(metadataWithDefaultValues).forEach(([key, defaultValue]) => {
        appMetadata[key as AppMetadataKeys] = getMetadataValueFrom(
            { meta },
            key as AppMetadataKeys,
            defaultValue,
            applyMigrations,
        );
    });

    return appMetadata;
};

export const getAppMetadataFrom = (meta: Metadata, appPrefix: string = APP_METADATA_KEY_PREFIX): Metadata => {
    const appMetadata: Metadata = {};

    Object.entries(meta).forEach(([key, value]) => {
        if (key.startsWith(appPrefix)) {
            appMetadata[key] = value;
        }
    });

    return appMetadata;
};
