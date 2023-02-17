/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mutate } from 'swr';
import client from 'util/client';

const APP_METADATA_KEY_PREFIX = 'webUI_';

/**
 * Once all changes have been done in the current branch, a new migration for all changes should be
 * created.
 *
 * In case a value should be migrated for a specific key, and in the same migration the key is
 * getting migrated, the key in the value migration is the "old" key (before the migration to the
 * new key).
 *
 * Migration order (function "applyMetadataMigrations"):
 * 1. app metadata key prefix
 * 2. app metadata values
 * 3. app metadata keys
 *
 * @example
 * // changes:
 * // commit: change key "X" to "Z"
 * // commit: change key "Y" to "A"
 * // commit: fix typo in reader setting "someTipo"
 * // commit: add metadata migration
 *
 * // result:
 * // old migrations:
 * // const migrations = [
 * //   {
 * //     keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
 * //   }
 * // ];
 *
 * // updated migrations
 * const migrations = [
 *   {
 *     keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
 *   },
 *   {
 *     keys: [
 *       { oldKey: 'X', newKey: 'Z' },
 *       { oldKey: 'Y', newKey: 'A' },
 *     ],
 *     // all stored values in the metadata (of this app) will get migrated
 *     values: [
 *       {
 *         oldValue: 'someTipo',
 *         newValue: 'someTypo'
 *       },
 *     ],
 *     // to migrate only the value of a specific key (in this case of "someKey"):
 *     // values: [
 *     //   {
 *     //     key: 'someKey',
 *     //     oldValue: 'someTipo',
 *     //     newValue: 'someTypo',
 *     //   },
 *     // ],
 *   },
 * ];
 */
const migrations: IMetadataMigration[] = [
    {
        keys: [{ oldKey: 'loadNextonEnding', newKey: 'loadNextOnEnding' }],
    },
];

const getAppKeyPrefixForMigration = (migrationId: number): string => {
    const appKeyPrefix = migrations
        .slice(0, migrationId)
        .reverse()
        .find((migration) => !!migration.appKeyPrefix);

    return appKeyPrefix?.appKeyPrefix?.newPrefix ?? APP_METADATA_KEY_PREFIX;
};

const getMetadataKey = (key: string, appPrefix: string = APP_METADATA_KEY_PREFIX) => `${appPrefix}${key}`;

const doesMetadataKeyExistIn = (meta: IMetadata | undefined, key: string, appPrefix?: string): boolean =>
    Object.prototype.hasOwnProperty.call(meta ?? {}, getMetadataKey(key, appPrefix));

const convertValueFromMetadata = <T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes>(
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

    return value as T;
};

const getAppMetadataFrom = (meta: IMetadata, appPrefix: string = APP_METADATA_KEY_PREFIX): IMetadata => {
    const appMetadata: IMetadata = {};

    Object.entries(meta).forEach(([key, value]) => {
        if (key.startsWith(appPrefix)) {
            appMetadata[key] = value;
        }
    });

    return appMetadata;
};

const applyAppKeyPrefixMigration = (meta: IMetadata, migration: IMetadataMigration): IMetadata => {
    const migratedMetadata: IMetadata = { ...meta };

    if (!migration.appKeyPrefix) {
        return migratedMetadata;
    }

    const { oldPrefix, newPrefix } = migration.appKeyPrefix;

    const oldAppMetadata = getAppMetadataFrom(meta, oldPrefix);
    const newAppMetadata = getAppMetadataFrom(meta, newPrefix);

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

const applyMetadataValueMigration = (
    meta: IMetadata,
    migration: IMetadataMigration,
    appKeyPrefix: string,
): IMetadata => {
    const migratedMetadata: IMetadata = { ...meta };

    if (!migration.values) {
        return migratedMetadata;
    }

    const appMetadata = getAppMetadataFrom(meta, appKeyPrefix);
    const metadataValueChanges = migration.values;

    metadataValueChanges.forEach(({ key, oldValue, newValue }) => {
        const migrateValue = (metaKey: string) => {
            if (meta[metaKey] === oldValue) {
                migratedMetadata[metaKey] = newValue;
            }
        };

        const migrateValueOfAllAppKeys = key === undefined;
        if (migrateValueOfAllAppKeys) {
            Object.keys(appMetadata).forEach((metaKey) => {
                migrateValue(metaKey);
            });
            return;
        }

        if (!doesMetadataKeyExistIn(meta, key, appKeyPrefix)) {
            return;
        }

        migrateValue(getMetadataKey(key, appKeyPrefix));
    });

    return migratedMetadata;
};

const applyMetadataKeyMigration = (meta: IMetadata, migration: IMetadataMigration): IMetadata => {
    const migratedMetadata: IMetadata = { ...meta };

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

const applyMetadataMigrations = (meta?: IMetadata): IMetadata | undefined => {
    if (!meta) {
        return undefined;
    }

    const migrationToMetadata: [number, IMetadata][] = [[0, meta]];

    migrations.forEach((migration, index) => {
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

export const getMetadataValueFrom = <T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes>(
    { meta }: IMetadataHolder,
    key: AppMetadataKeys,
    defaultValue?: T,
    applyMigrations: boolean = true,
): T | undefined => {
    const metadata = applyMigrations ? applyMetadataMigrations(meta) : meta;

    if (metadata === undefined || !doesMetadataKeyExistIn(metadata, key)) {
        return defaultValue;
    }

    return convertValueFromMetadata(metadata[getMetadataKey(key)]);
};

export const getMetadataFrom = (
    { meta }: IMetadataHolder,
    keysToDefaultValues: MetadataKeyValuePair[],
    applyMigrations?: boolean,
): IMetadata<AllowedMetadataValueTypes> => {
    const appMetadata: IMetadata<AllowedMetadataValueTypes> = {};

    keysToDefaultValues.forEach(([key, defaultValue]) => {
        appMetadata[key] = getMetadataValueFrom({ meta }, key, defaultValue, applyMigrations);
    });

    return appMetadata;
};

const wrapMetadataWithMetaKey = (wrap: boolean, metadata: IMetadata): IMetadataHolder => {
    if (wrap) {
        return {
            meta: {
                ...metadata,
            },
        };
    }

    return {
        ...metadata,
    };
};

export const requestUpdateMetadataValue = async (
    endpoint: string,
    metadataHolder: IMetadataHolder,
    key: AppMetadataKeys,
    value: AllowedMetadataValueTypes,
    endpointToMutate: string = endpoint,
    wrapWithMetaKey: boolean = true,
): Promise<void> => {
    const restApiVersion = '/api/v1';
    const url = `${restApiVersion}${endpoint}/meta`;
    const urlToMutate = `${restApiVersion}${endpointToMutate}`;

    const metadataKey = getMetadataKey(key);
    const valueAsString = `${value}`;

    const formData = new FormData();
    formData.append('key', metadataKey);
    formData.append('value', valueAsString);

    const mutatedMetadata = {
        ...metadataHolder.meta,
        [metadataKey]: valueAsString,
    };

    await client.patch(url, formData);
    await mutate(
        urlToMutate,
        { ...metadataHolder, ...wrapMetadataWithMetaKey(wrapWithMetaKey, mutatedMetadata) },
        { revalidate: false },
    );
};

export const requestUpdateMetadata = async (
    endpoint: string,
    metadataHolder: IMetadataHolder,
    keysToValues: [AppMetadataKeys, AllowedMetadataValueTypes][],
    endpointToMutate?: string,
    wrapWithMetaKey?: boolean,
): Promise<void[]> =>
    Promise.all(
        keysToValues.map(([key, value]) =>
            requestUpdateMetadataValue(endpoint, metadataHolder, key, value, endpointToMutate, wrapWithMetaKey),
        ),
    );

export const requestUpdateServerMetadata = async (
    serverMetadata: IMetadata,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata('', { meta: serverMetadata }, keysToValues, '/meta', false);

export const requestUpdateMangaMetadata = async (
    manga: IMangaCard | IManga,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(`/manga/${manga.id}`, manga, keysToValues);

export const requestUpdateChapterMetadata = async (
    mangaChapter: IMangaChapter,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> =>
    requestUpdateMetadata(
        `/manga/${mangaChapter.manga.id}/chapter/${mangaChapter.chapter.index}`,
        mangaChapter.chapter,
        keysToValues,
    );

export const requestUpdateCategoryMetadata = async (
    category: ICategory,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(`/category/${category.id}`, category, keysToValues);
