/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_METADATA_KEY_PREFIX, METADATA_MIGRATIONS } from '@/modules/metadata/Metadata.constants.ts';
import {
    doesMetadataKeyExistIn,
    getAppMetadataFrom,
    getMetadataKey,
} from '@/modules/metadata/services/MetadataReader.ts';
import { IMetadataMigration, Metadata } from '@/modules/metadata/Metadata.types.ts';

export const getAppKeyPrefixForMigration = (migrationId: number): string => {
    const appKeyPrefix = METADATA_MIGRATIONS.slice(0, migrationId)
        .reverse()
        .find((migration) => !!migration.appKeyPrefix);

    return appKeyPrefix?.appKeyPrefix?.newPrefix ?? APP_METADATA_KEY_PREFIX;
};

export const applyAppKeyPrefixMigration = (meta: Metadata, migration: IMetadataMigration): Metadata => {
    const migratedMetadata: Metadata = { ...meta };

    if (!migration.appKeyPrefix) {
        return migratedMetadata;
    }

    const { oldPrefix, newPrefix } = migration.appKeyPrefix;

    const oldAppMetadata = getAppMetadataFrom(meta, undefined, oldPrefix);
    const newAppMetadata = getAppMetadataFrom(meta, undefined, newPrefix);

    const missingMetadataKeys = Object.keys(oldAppMetadata).filter((key) => !Object.keys(newAppMetadata).includes(key));

    const isMissingOldMetadata = missingMetadataKeys.length;
    if (isMissingOldMetadata) {
        missingMetadataKeys.forEach((oldKey) => {
            const keyWithNewPrefix = oldKey.replace(oldPrefix, newPrefix);
            migratedMetadata[keyWithNewPrefix] = oldAppMetadata[oldKey];
        });
    }

    return migratedMetadata;
};

const applyMetadataValueMigration = (meta: Metadata, migration: IMetadataMigration, appKeyPrefix: string): Metadata => {
    const migratedMetadata: Metadata = { ...meta };

    if (!migration.values) {
        return migratedMetadata;
    }

    const appMetadata = getAppMetadataFrom(meta, undefined, appKeyPrefix);
    const metadataValueChanges = migration.values;

    metadataValueChanges.forEach(({ key, oldValue, newValue }) => {
        const migrateValue = (metaKey: string) => {
            if (meta[metaKey].match(oldValue)) {
                migratedMetadata[metaKey] = typeof newValue === 'function' ? newValue(meta[metaKey]) : newValue;
            }
        };

        const migrateValueOfAllAppKeys = key === undefined;
        if (migrateValueOfAllAppKeys) {
            Object.keys(appMetadata).forEach((metaKey) => {
                migrateValue(metaKey);
            });
            return;
        }

        if (!doesMetadataKeyExistIn(meta, key, undefined, appKeyPrefix)) {
            return;
        }

        migrateValue(getMetadataKey(key, undefined, appKeyPrefix));
    });

    return migratedMetadata;
};

const applyMetadataKeyMigration = (meta: Metadata, migration: IMetadataMigration): Metadata => {
    const migratedMetadata: Metadata = { ...meta };

    if (!migration.keys) {
        return migratedMetadata;
    }

    const metadataKeyChanges = migration.keys;

    metadataKeyChanges.forEach(({ oldKey, newKey }) => {
        if (!doesMetadataKeyExistIn(meta, oldKey)) {
            return;
        }

        if (doesMetadataKeyExistIn(meta, newKey)) {
            return;
        }

        migratedMetadata[getMetadataKey(newKey)] = meta[getMetadataKey(oldKey)];
    });

    return migratedMetadata;
};

export const applyMetadataMigrations = (meta?: Metadata): Metadata | undefined => {
    if (!meta) {
        return undefined;
    }

    const appliedMigrationId = Number.isNaN(Number(meta.migration)) ? 0 : Math.max(0, Number(meta.migration) - 1);
    const migrationToMetadata: [number, Metadata][] = [[appliedMigrationId, meta]];

    METADATA_MIGRATIONS.forEach((migration, index) => {
        const migrationId = index + 1;
        const metadataToMigrate = migrationToMetadata[migrationId - 1][1];
        const appKeyPrefixMigrated = applyAppKeyPrefixMigration(metadataToMigrate, migration);
        const metadataValuesMigrated = applyMetadataValueMigration(
            appKeyPrefixMigrated,
            migration,
            getAppKeyPrefixForMigration(migrationId),
        );
        const metadataKeysMigrated = applyMetadataKeyMigration(metadataValuesMigrated, migration);

        migrationToMetadata.push([migrationId, metadataKeysMigrated]);
    });

    const appliedMigration = migrationToMetadata.length > 1;
    if (!appliedMigration) {
        return { ...meta };
    }

    return migrationToMetadata.pop()![1];
};
