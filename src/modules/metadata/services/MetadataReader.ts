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
    GLOBAL_METADATA_KEYS,
    METADATA_MIGRATIONS,
    VALID_APP_METADATA_KEYS,
} from '@/modules/metadata/Metadata.constants.ts';
import { DEFAULT_DEVICE, getActiveDevice } from '@/modules/device/services/Device.ts';
import { applyMetadataMigrations } from '@/modules/metadata/services/MetadataMigrations.ts';
import { convertToGqlMeta, convertValueFromMetadata } from '@/modules/metadata/services/MetadataConverter.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    Metadata,
    MetadataHolder,
    MetadataHolderType,
    MetadataKeyValuePair,
} from '@/modules/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import {
    requestDeleteCategoryMetadata,
    requestDeleteChapterMetadata,
    requestDeleteMangaMetadata,
    requestDeleteServerMetadata,
    requestDeleteSourceMetadata,
    requestUpdateCategoryMetadata,
    requestUpdateChapterMetadata,
    requestUpdateMangaMetadata,
    requestUpdateServerMetadata,
    requestUpdateSourceMetadata,
} from '@/modules/metadata/services/MetadataUpdater.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';

export const extractOriginalKey = (key: string): string => key.split('_').slice(-1)[0];

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
    const requiresMigration = Number(meta?.migration) !== METADATA_MIGRATIONS.length;
    const doMigration = requiresMigration && applyMigrations;
    const metadata = doMigration ? applyMetadataMigrations(meta) : meta;

    if (
        metadata === undefined ||
        !doesMetadataKeyExistIn(metadata, key) ||
        metadata[getMetadataKey(key)] === undefined
    ) {
        return defaultValue;
    }

    return convertValueFromMetadata(metadata[getMetadataKey(key)]);
};

const getMetadataUpdateFunction = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (Pick<SourceType, 'id'> & MetadataHolder),
): ((appliedMigration: [MetadataKeyValuePair]) => Promise<void[]>) => {
    switch (type) {
        case 'global':
            return (appliedMigration) => requestUpdateServerMetadata(appliedMigration);
        case 'manga':
            return (appliedMigration) =>
                requestUpdateMangaMetadata(
                    { id: (metadataHolder as MangaIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'chapter':
            return (appliedMigration) =>
                requestUpdateChapterMetadata(
                    { id: (metadataHolder as ChapterIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'category':
            return (appliedMigration) =>
                requestUpdateCategoryMetadata(
                    { id: (metadataHolder as CategoryIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'source':
            return (appliedMigration) =>
                requestUpdateSourceMetadata(
                    {
                        id: (metadataHolder as Pick<SourceType, 'id'>).id,
                        meta: convertToGqlMeta(metadataHolder.meta),
                    },
                    appliedMigration,
                );
        default:
            throw new Error(`Unexpected "type" (${type})`);
    }
};

const getMetadataDeleteFunction = (
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (Pick<SourceType, 'id'> & MetadataHolder),
): ((metadataToDelete: AppMetadataKeys[]) => Promise<void[]>) => {
    switch (type) {
        case 'global':
            return (appliedMigration) => requestDeleteServerMetadata(appliedMigration);
        case 'manga':
            return (appliedMigration) =>
                requestDeleteMangaMetadata(
                    { id: (metadataHolder as MangaIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'chapter':
            return (appliedMigration) =>
                requestDeleteChapterMetadata(
                    { id: (metadataHolder as ChapterIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'category':
            return (appliedMigration) =>
                requestDeleteCategoryMetadata(
                    { id: (metadataHolder as CategoryIdInfo).id, meta: convertToGqlMeta(metadataHolder.meta) },
                    appliedMigration,
                );
        case 'source':
            return (appliedMigration) =>
                requestDeleteSourceMetadata(
                    {
                        id: (metadataHolder as Pick<SourceType, 'id'>).id,
                        meta: convertToGqlMeta(metadataHolder.meta),
                    },
                    appliedMigration,
                );
        default:
            throw new Error(`Unexpected "type" (${type})`);
    }
};

/**
 * Prevent spamming requests due to frequent metadata reads while the migration hasn't been commited to the server yet
 */
const commitedMigrations = new Set<string>();

export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'global',
    metadataHolder: MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'manga',
    metadataHolder: MangaIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'chapter',
    metadataHolder: ChapterIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'category',
    metadataHolder: CategoryIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'source',
    metadataHolder: Pick<SourceType, 'id'> & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (Pick<SourceType, 'id'> & MetadataHolder),
    metadataWithDefaultValues: METADATA,
    applyMigrations?: boolean,
    useEffectFn: typeof useEffect = (fn: () => void) => fn(),
): METADATA {
    const wasMigrated =
        !!metadataHolder?.meta &&
        !!applyMigrations &&
        Number(getMetadataValueFrom(metadataHolder, 'migration')) !== METADATA_MIGRATIONS.length;
    const appMetadata = {} as METADATA;

    Object.entries(metadataWithDefaultValues).forEach(([key, defaultValue]) => {
        appMetadata[key as AppMetadataKeys] = getMetadataValueFrom(
            metadataHolder,
            key as AppMetadataKeys,
            defaultValue,
            applyMigrations,
        );
    });

    useEffectFn(() => {
        const itemMigrationKey = `${type}_${type === 'global' ? '' : (metadataHolder as { id: any }).id}`;
        const commitMigration = !commitedMigrations.has(itemMigrationKey);
        if (wasMigrated && commitMigration) {
            const metadataToDelete = Object.keys(metadataHolder.meta ?? {})
                .map(extractOriginalKey)
                .filter((key) => !VALID_APP_METADATA_KEYS.includes(key)) as AppMetadataKeys[];

            commitedMigrations.add(itemMigrationKey);

            getMetadataDeleteFunction(
                type,
                metadataHolder,
            )(metadataToDelete)
                .then(() =>
                    getMetadataUpdateFunction(type, metadataHolder)([['migration', METADATA_MIGRATIONS.length]]),
                )
                .catch((error) => {
                    defaultPromiseErrorHandler(`MetadataReader#getMetadataFromServer`)(error);
                    commitedMigrations.delete(itemMigrationKey);
                });
        }
    });

    return appMetadata;
}

export const getAppMetadataFrom = (meta: Metadata, appPrefix: string = APP_METADATA_KEY_PREFIX): Metadata => {
    const appMetadata: Metadata = {};

    Object.entries(meta).forEach(([key, value]) => {
        if (key.startsWith(appPrefix)) {
            appMetadata[key] = value;
        }
    });

    return appMetadata;
};
