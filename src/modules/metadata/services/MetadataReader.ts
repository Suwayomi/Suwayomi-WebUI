/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { convertValueFromMetadata } from '@/modules/metadata/services/MetadataConverter.ts';
import {
    AllowedMetadataValueTypes,
    AppMetadataKeys,
    Metadata,
    MetadataHolder,
    MetadataHolderType,
} from '@/modules/metadata/Metadata.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';

import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { doesMetadataKeyExistIn, getMetadataKey } from '@/modules/metadata/Metadata.utils.ts';
import { applyMetadataMigrations } from '@/modules/metadata/services/MetadataMigrations.ts';
import { SourceIdInfo } from '@/modules/source/Source.types.ts';

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

    return convertValueFromMetadata(metadata[getMetadataKey(key, prefixes)]);
};

export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'global',
    metadataHolder: MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'manga',
    metadataHolder: MangaIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'chapter',
    metadataHolder: ChapterIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'category',
    metadataHolder: CategoryIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
    type: 'source',
    metadataHolder: SourceIdInfo & MetadataHolder,
    metadataWithDefaultValues: METADATA,
    prefixes?: string[],
    useEffectFn?: typeof useEffect,
): METADATA;
export function getMetadataFrom<METADATA extends Partial<Metadata<AppMetadataKeys, AllowedMetadataValueTypes>>>(
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
