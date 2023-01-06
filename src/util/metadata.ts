/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mutate } from 'swr';
import client from './client';

const APP_METADATA_KEY_PREFIX = 'webUI_';

const getMetadataKey = (key: string) => `${APP_METADATA_KEY_PREFIX}${key}`;

const convertValueFromMetadata = <
    T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes,
>(
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

export const getMetadataValueFrom = <
    T extends AllowedMetadataValueTypes = AllowedMetadataValueTypes,
>(
    { meta }: IMetadataHolder,
    key: AppMetadataKeys,
    defaultValue?: T,
): T | undefined => {
    const metadataKey = getMetadataKey(key);

    const isMissingKey = !Object.prototype.hasOwnProperty.call(meta ?? {}, metadataKey);
    if (meta === undefined || isMissingKey) {
        return defaultValue;
    }

    return convertValueFromMetadata(meta[metadataKey]);
};

export const getMetadataFrom = (
    { meta }: IMetadataHolder,
    keysToDefaultValues: MetadataKeyValuePair[],
): IMetadata<AllowedMetadataValueTypes> => {
    const appMetadata: IMetadata<AllowedMetadataValueTypes> = {};

    keysToDefaultValues.forEach(([key, defaultValue]) => {
        appMetadata[key] = getMetadataValueFrom({ meta }, key, defaultValue);
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
): Promise<void[]> => Promise.all(keysToValues.map(
    ([key, value]) => requestUpdateMetadataValue(
        endpoint, metadataHolder, key, value, endpointToMutate, wrapWithMetaKey,
    ),
));

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
): Promise<void[]> => requestUpdateMetadata(`/manga/${mangaChapter.manga.id}/chapter/${mangaChapter.chapter.index}`, mangaChapter.chapter, keysToValues);

export const requestUpdateCategoryMetadata = async (
    category: ICategory,
    keysToValues: MetadataKeyValuePair[],
): Promise<void[]> => requestUpdateMetadata(`/category/${category.id}`, category, keysToValues);
