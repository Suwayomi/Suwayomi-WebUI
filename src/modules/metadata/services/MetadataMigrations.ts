/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import {
    APP_METADATA_KEY_PREFIX,
    METADATA_MIGRATIONS,
    VALID_APP_METADATA_KEYS,
} from '@/modules/metadata/Metadata.constants.ts';
import {
    AppMetadataKeys,
    IMetadataMigration,
    Metadata,
    MetadataHolder,
    MetadataHolderType,
    MetadataKeyValuePair,
} from '@/modules/metadata/Metadata.types.ts';
import { doesMetadataKeyExistIn, extractOriginalKey, getMetadataKey } from '@/modules/metadata/Metadata.utils.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getMetadataDeleteFunction, getMetadataUpdateFunction } from '@/modules/metadata/services/MetadataUpdater.ts';

const getAppKeyPrefixForMigration = (migrationId: number): string => {
    const appKeyPrefix = METADATA_MIGRATIONS.slice(0, migrationId)
        .reverse()
        .find((migration) => !!migration.appKeyPrefix);

    return appKeyPrefix?.appKeyPrefix?.newPrefix ?? APP_METADATA_KEY_PREFIX;
};

const getAppMetadataFrom = (
    meta: Metadata,
    prefixes: string[] = [],
    appPrefix: string = APP_METADATA_KEY_PREFIX,
): Metadata => {
    const appMetadata: Metadata = {};

    Object.entries(meta).forEach(([key, value]) => {
        if (key.startsWith([appPrefix, ...prefixes].join('_'))) {
            appMetadata[key] = value;
        }
    });

    return appMetadata;
};

const applyAppKeyPrefixMigration = (meta: Metadata, migration: IMetadataMigration): Metadata => {
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
        Object.keys(appMetadata).forEach((metaKey) => {
            if (migrateValueOfAllAppKeys || metaKey.endsWith(key)) {
                migrateValue(metaKey);
            }
        });
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

const getOutdatedMetadataKeys = (metadata?: Metadata): AppMetadataKeys[] => {
    if (!metadata) {
        return [];
    }

    const oldAppKeyPrefixes = METADATA_MIGRATIONS.reduce((acc, migration) => {
        const oldPrefix = migration.appKeyPrefix?.oldPrefix;
        if (!oldPrefix) {
            return acc;
        }

        return [...acc, oldPrefix];
    }, [] as string[]);

    return Object.keys(metadata).filter((key) => {
        const appKeyPrefixOfKey = key.split('_')[0];

        const isMetadataKeyOfApp = [...oldAppKeyPrefixes, APP_METADATA_KEY_PREFIX].includes(appKeyPrefixOfKey);
        if (!isMetadataKeyOfApp) {
            return false;
        }

        const isOldKeyPrefix = oldAppKeyPrefixes.includes(appKeyPrefixOfKey);
        if (isOldKeyPrefix) {
            return true;
        }

        return !VALID_APP_METADATA_KEYS.includes(extractOriginalKey(key));
    }) as AppMetadataKeys[];
};

const getNewMetadataKeys = (
    metadata: Metadata | undefined,
    migratedMetadata: Metadata,
    metadataKeyToDelete: string[],
): string[] => {
    if (!metadata) {
        return [];
    }

    const newKeys = METADATA_MIGRATIONS.reduce((acc, migration) => {
        if (!migration.keys) {
            return acc;
        }

        const keys = migration.keys.map(({ newKey }) => newKey).filter((key) => key !== undefined);

        return [...acc, ...keys];
    }, [] as string[]);

    return Object.keys(migratedMetadata).filter((metadataKey) => {
        const key = extractOriginalKey(metadataKey);

        const isNewKeyOfAMigration = newKeys.includes(key);
        const isOldKeyOfAMigration = metadataKeyToDelete.includes(key);
        const isAlreadyCommited = Object.hasOwn(metadata, metadataKey);

        return !isAlreadyCommited && isNewKeyOfAMigration && !isOldKeyOfAMigration;
    });
};

/**
 * Prevent spamming requests due to frequent metadata reads while the migration hasn't been commited to the server yet
 */
const commitedMigrations = new Set<string>();
const commitMigratedMetadata = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (Pick<SourceType, 'id'> & MetadataHolder)
        | undefined,
    migratedMetadata: Metadata,
    useEffectFn: typeof useEffect = (fn: () => void) => fn(),
): void => {
    const metadata = metadataHolder?.meta;

    const metadataKeysToDelete = getOutdatedMetadataKeys(metadata);
    const metadataKeysToCommit = getNewMetadataKeys(metadata, migratedMetadata, metadataKeysToDelete);
    const metadataToUpdate = metadataKeysToCommit.map((key) => [key, migratedMetadata[key]]) as MetadataKeyValuePair[];

    const updateMetadata = getMetadataUpdateFunction(type, metadataHolder ?? { id: -1, meta: {} });
    const deleteMetadata = getMetadataDeleteFunction(type, metadataHolder ?? { id: -1, meta: {} });

    useEffectFn(() => {
        (async () => {
            const itemMigrationKey = `${type}_${type === 'global' ? '' : (metadataHolder as { id: any }).id}`;

            const commitMigration = !commitedMigrations.has(itemMigrationKey);
            if (!commitMigration) {
                return;
            }

            const isMetadataAlreadyMigrated =
                !metadata || Number(metadata[getMetadataKey('migration')]) === METADATA_MIGRATIONS.length;

            const isCommitRequired =
                !isMetadataAlreadyMigrated || !!metadataKeysToDelete.length || !!metadataToUpdate.length;
            if (!isCommitRequired) {
                return;
            }

            commitedMigrations.add(itemMigrationKey);

            try {
                await deleteMetadata(metadataKeysToDelete, undefined, true);
                await updateMetadata(
                    [...metadataToUpdate, [getMetadataKey('migration') as AppMetadataKeys, METADATA_MIGRATIONS.length]],
                    undefined,
                    true,
                );
            } catch (e) {
                commitedMigrations.delete(itemMigrationKey);

                defaultPromiseErrorHandler(
                    `MetadataMigrations#commitMigrateMetadata(${type}, ${(metadataHolder as { id: any })?.id})`,
                );
            }
        })();
    });
};

export const applyMetadataMigrations = (
    type: MetadataHolderType,
    metadataHolder?:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (Pick<SourceType, 'id'> & MetadataHolder),
    useEffectFn: typeof useEffect = (fn: () => void) => fn(),
): Metadata | undefined => {
    const meta = { ...(metadataHolder?.meta ?? {}) };

    const migrationIdKey = getMetadataKey('migration');
    const appliedMigrationId = Number.isNaN(Number(meta[migrationIdKey]))
        ? 0
        : Math.max(0, Number(meta[migrationIdKey]) - 1);

    const migrationToMetadata: [number, Metadata][] = [[0, meta]];

    METADATA_MIGRATIONS.forEach((migration, index) => {
        const migrationId = index + 1;
        const metadataToMigrate = migrationToMetadata[migrationId - 1][1];

        const isMigrationRequired = appliedMigrationId < migrationId;
        if (!isMigrationRequired) {
            migrationToMetadata.push([migrationId, metadataToMigrate]);
            return;
        }

        const appKeyPrefixMigrated = applyAppKeyPrefixMigration(metadataToMigrate, migration);
        const metadataValuesMigrated = applyMetadataValueMigration(
            appKeyPrefixMigrated,
            migration,
            getAppKeyPrefixForMigration(migrationId),
        );
        const metadataKeysMigrated = applyMetadataKeyMigration(metadataValuesMigrated, migration);

        migrationToMetadata.push([migrationId, metadataKeysMigrated]);
    });

    const migratedMetadata = migrationToMetadata.pop()?.[1] ?? meta;

    commitMigratedMetadata(type, metadataHolder, migratedMetadata, useEffectFn);

    return migratedMetadata;
};
