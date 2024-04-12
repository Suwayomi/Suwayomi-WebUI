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
    IMetadataMigration,
    Metadata,
    MetadataHolder,
    MetadataKeyValuePair,
    TCategory,
    TChapter,
    TManga,
} from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MetaType } from '@/lib/graphql/generated/graphql.ts';
import { DEFAULT_DEVICE, getActiveDevice } from '@/util/device.ts';

const APP_METADATA_KEY_PREFIX = 'webUI_';

const GLOBAL_METADATA_KEYS: AppMetadataKeys[] = [
    // downloads
    'deleteChaptersManuallyMarkedRead',
    'deleteChaptersWhileReading',
    'deleteChaptersWithBookmark',

    // library
    'showAddToLibraryCategorySelectDialog',
    'ignoreFilters',
    'removeMangaFromCategories',

    // client
    'devices',

    // migration
    'includeChapters',
    'includeCategories',
    'deleteChapters',
];

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
    {
        keys: [{ oldKey: 'deleteChaptersAutoMarkedRead', newKey: 'deleteChaptersWhileReading' }],
    },
];

const getAppKeyPrefixForMigration = (migrationId: number): string => {
    const appKeyPrefix = migrations
        .slice(0, migrationId)
        .reverse()
        .find((migration) => !!migration.appKeyPrefix);

    return appKeyPrefix?.appKeyPrefix?.newPrefix ?? APP_METADATA_KEY_PREFIX;
};

const getMetadataKey = (key: string, appPrefix: string = APP_METADATA_KEY_PREFIX) => {
    const isGlobalMetadataKey = GLOBAL_METADATA_KEYS.includes(key as AppMetadataKeys);
    const addActiveDevicePrefix = !isGlobalMetadataKey && getActiveDevice() !== DEFAULT_DEVICE;

    return `${appPrefix}${addActiveDevicePrefix ? `${getActiveDevice()}_` : ''}${key}`;
};

const doesMetadataKeyExistIn = (meta: Metadata | undefined, key: string, appPrefix?: string): boolean =>
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

const getAppMetadataFrom = (meta: Metadata, appPrefix: string = APP_METADATA_KEY_PREFIX): Metadata => {
    const appMetadata: Metadata = {};

    Object.entries(meta).forEach(([key, value]) => {
        if (key.startsWith(appPrefix)) {
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

const applyMetadataValueMigration = (meta: Metadata, migration: IMetadataMigration, appKeyPrefix: string): Metadata => {
    const migratedMetadata: Metadata = { ...meta };

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

const applyMetadataMigrations = (meta?: Metadata): Metadata | undefined => {
    if (!meta) {
        return undefined;
    }

    const migrationToMetadata: [number, Metadata][] = [[0, meta]];

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

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wrapMetadataWithMetaKey = (wrap: boolean, metadata: Metadata): MetadataHolder => {
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

type MetadataHolderType = 'manga' | 'chapter' | 'category' | 'global';

export const requestUpdateMetadataValue = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    key: AppMetadataKeys,
    value: AllowedMetadataValueTypes,
): Promise<void> => {
    const metadataKey = getMetadataKey(key);

    switch (holderType) {
        case 'category':
            await requestManager.setCategoryMeta((metadataHolder as TCategory).id, metadataKey, value).response;
            break;
        case 'chapter':
            await requestManager.setChapterMeta((metadataHolder as TChapter).id, metadataKey, value).response;
            break;
        case 'global':
            await requestManager.setGlobalMetadata(metadataKey, value).response;
            break;
        case 'manga':
            await requestManager.setMangaMeta((metadataHolder as TManga).id, metadataKey, value).response;
            break;
        default:
            throw new Error(`requestUpdateMetadataValue: unknown holderType "${holderType}"`);
    }
};

export const requestUpdateMetadata = async (
    metadataHolder: GqlMetaHolder,
    holderType: MetadataHolderType,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> =>
    Promise.all(keysToValues.map(([key, value]) => requestUpdateMetadataValue(metadataHolder, holderType, key, value)));

export const requestUpdateServerMetadata = async (keysToValues: MetadataKeyValuePair[]): Promise<void[]> =>
    requestUpdateMetadata({}, 'global', keysToValues);

export const requestUpdateMangaMetadata = async (
    manga: TManga,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(manga, 'manga', keysToValues);

export const requestUpdateChapterMetadata = async (
    chapter: TChapter,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(chapter, 'chapter', keysToValues);

export const requestUpdateCategoryMetadata = async (
    category: TCategory,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(category, 'category', keysToValues);
