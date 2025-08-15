/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { convertValueFromMetadata } from '@/features/metadata/services/MetadataConverter.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    Metadata,
    MetadataHolder,
    MetadataHolderType,
} from '@/features/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/features/manga/Manga.types.ts';

import { CategoryIdInfo } from '@/features/category/Category.types.ts';
import { doesMetadataKeyExistIn, getMetadataKey } from '@/features/metadata/Metadata.utils.ts';
import { applyMetadataMigrations } from '@/features/metadata/services/MetadataMigrations.ts';
import { SourceIdInfo } from '@/features/source/Source.types.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { APP_METADATA } from '@/features/metadata/Metadata.constants.ts';

const getMetadataValueFrom = <Key extends AppMetadataKeys, Value extends AllowedMetadataValueTypes>(
    metadata: Metadata | undefined,
    key: Key,
    defaultValue?: Value,
    prefixes?: string[],
): Value | undefined => {
    if (
        metadata === undefined ||
        !doesMetadataKeyExistIn(metadata, key, prefixes) ||
        metadata[getMetadataKey(key, prefixes)] === undefined
    ) {
        return defaultValue;
    }

    const convertedValue = convertValueFromMetadata(key, metadata[getMetadataKey(key, prefixes)], defaultValue);

    return APP_METADATA[key].toConstrainedValue?.(convertedValue) ?? convertedValue;
};

export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: 'global',
    metadataHolder: MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: 'manga',
    metadataHolder: MangaIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: 'chapter',
    metadataHolder: ChapterIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: 'category',
    metadataHolder: CategoryIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: 'source',
    metadataHolder: SourceIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, any>>>(
    type: MetadataHolderType,
    metadataHolder:
        | MetadataHolder
        | (MangaIdInfo & MetadataHolder)
        | (ChapterIdInfo & MetadataHolder)
        | (CategoryIdInfo & MetadataHolder)
        | (SourceIdInfo & MetadataHolder),
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn: typeof useEffect = (fn: () => void) => fn(),
): METADATA {
    const migratedMetadata = applyMetadataMigrations(type, metadataHolder, useEffectFn);
    const appMetadata = {} as METADATA;

    Object.entries(metadataWithDefaultValues).forEach(([key, defaultValue]) => {
        appMetadata[key as AppMetadataKeys] = getMetadataValueFrom(
            migratedMetadata,
            key as AppMetadataKeys,
            defaultValue,
            prefixes,
        );
    });

    return appMetadata;
}
