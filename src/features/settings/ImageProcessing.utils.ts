/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { d } from 'koration';
import {
    ImageProcessingTargetMode,
    TSettingsDownloadConversion,
    TSettingsDownloadConversionKeyValueItem,
} from '@/features/settings/Settings.types.ts';
import {
    DEFAULT_MIME_TYPE,
    IMAGE_PROCESSING_CALL_TIMEOUT,
    IMAGE_PROCESSING_COMPRESSION,
    IMAGE_PROCESSING_CONNECT_TIMEOUT,
    MIME_TYPE_PREFIX,
    TARGET_DISABLED,
} from '@/features/settings/Settings.constants.ts';
import {
    Maybe,
    SettingsDownloadConversion,
    SettingsDownloadConversionHeader,
    SettingsDownloadConversionType,
} from '@/lib/graphql/generated/graphql.ts';
import { UrlUtil } from '@/lib/UrlUtil.ts';
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';

let COUNTER = 0;

const normalizeMimeType = (mimeType: string): string => mimeType.replace(MIME_TYPE_PREFIX, '');

export const isDefaultMimeType = (mimeType: string): boolean =>
    normalizeMimeType(mimeType.toLowerCase().trim()) === DEFAULT_MIME_TYPE;

export const isDuplicateKeyValueItem = (
    header: string,
    index: number,
    headers: SettingsDownloadConversionType['headers'],
): boolean => headers?.slice(0, index).some(({ name }) => name === header) ?? false;

const hasDuplicateKeyValueItems = (headers: SettingsDownloadConversionType['headers']): boolean =>
    headers?.some((header, index) => isDuplicateKeyValueItem(header.name, index, headers)) ?? false;

export const isDuplicateConversion = (
    mimeType: string,
    index: number,
    conversions: SettingsDownloadConversion[],
): boolean => conversions.slice(0, index).some((conversion) => conversion.mimeType === mimeType);

export const isUrlTargetMode = (target: string): boolean => target !== '' && !!target.match(/^https?:\/\/.+/);

const isValidNumberSetting = (value: number | null | undefined, min: number, max: number): boolean =>
    value == null || (value >= min && value <= max);

export const isValidCallTimeoutSetting = (timeout: string | null | undefined): boolean =>
    isValidNumberSetting(
        timeout ? d(timeout).seconds.inWholeSeconds : null,
        IMAGE_PROCESSING_CALL_TIMEOUT.min,
        IMAGE_PROCESSING_CALL_TIMEOUT.max,
    );

export const isValidConnectTimeoutSetting = (timeout: string | null | undefined): boolean =>
    isValidNumberSetting(
        timeout ? d(timeout).seconds.inWholeSeconds : null,
        IMAGE_PROCESSING_CONNECT_TIMEOUT.min,
        IMAGE_PROCESSING_CONNECT_TIMEOUT.max,
    );

export const isValidCompressionLevel = (compression: number | null | undefined): boolean =>
    isValidNumberSetting(compression, IMAGE_PROCESSING_COMPRESSION.min, IMAGE_PROCESSING_COMPRESSION.max);

const isUnsetConversion = (mimeType: string, target: string): boolean => mimeType === '' && target === '';

const isInvalidTarget = (target: string, mode: ImageProcessingTargetMode, mimeType: string): boolean => {
    if (isDefaultMimeType(mimeType) && !target) {
        return false;
    }

    return mode === ImageProcessingTargetMode.URL && !isUrlTargetMode(target);
};

export const containsInvalidConversion = (conversions: TSettingsDownloadConversion[]): boolean =>
    conversions.some(
        ({ mimeType, compressionLevel, target, callTimeout, connectTimeout, headers, searchParams, mode }, index) =>
            isUnsetConversion(mimeType, target) ||
            isInvalidTarget(target, mode, mimeType) ||
            !isValidCompressionLevel(compressionLevel) ||
            !isValidCallTimeoutSetting(callTimeout) ||
            !isValidConnectTimeoutSetting(connectTimeout) ||
            isDuplicateConversion(mimeType, index, conversions) ||
            hasDuplicateKeyValueItems(headers) ||
            hasDuplicateKeyValueItems(searchParams),
    );

export const getTargetMode = (target: string): ImageProcessingTargetMode => {
    const normalizedTargetMode = normalizeMimeType(target);

    if (normalizedTargetMode === TARGET_DISABLED) {
        return ImageProcessingTargetMode.DISABLED;
    }

    if (isUrlTargetMode(normalizedTargetMode)) {
        return ImageProcessingTargetMode.URL;
    }

    return ImageProcessingTargetMode.IMAGE;
};

export const extractSearchParams = (url: string): SettingsDownloadConversionHeader[] => {
    const urlObject = UrlUtil.asUrl(url);

    return [...(urlObject?.searchParams ?? []).entries()].map(([key, value]) => ({
        name: String(key),
        value: jsonSaveParse(value) ?? value,
    }));
};

export const addStableIdToKeyValueItems = (
    items: (SettingsDownloadConversionHeader | TSettingsDownloadConversionKeyValueItem)[],
): TSettingsDownloadConversionKeyValueItem[] =>
    items.map((item) => ({
        // eslint-disable-next-line no-plusplus
        id: (item as TSettingsDownloadConversionKeyValueItem).id ?? COUNTER++,
        ...item,
    }));

export const addStableIdToConversions = (
    conversions: (SettingsDownloadConversion | TSettingsDownloadConversion)[],
): TSettingsDownloadConversion[] =>
    conversions.map((conversion) => ({
        // eslint-disable-next-line no-plusplus
        id: (conversion as TSettingsDownloadConversion).id ?? COUNTER++,
        ...conversion,
        mode: getTargetMode(normalizeMimeType(conversion.target)),
        headers: conversion.headers ? addStableIdToKeyValueItems(conversion.headers) : null,
        searchParams: addStableIdToKeyValueItems(extractSearchParams(conversion.target)),
    }));

export const getUpdatedSearchParams = (
    url: string,
    existingParams: Maybe<TSettingsDownloadConversionKeyValueItem[] | undefined>,
): TSettingsDownloadConversionKeyValueItem[] => {
    const urlObject = UrlUtil.asUrl(url);

    const params = [...(urlObject?.searchParams?.entries() ?? [])].map(([key, value]) => ({ name: key, value }));
    const paramsWithRetainedStableId = params.map((param) => {
        const existingParam = existingParams?.find(({ name }) => name === param.name);

        return {
            id: existingParam?.id,
            ...param,
        };
    });

    return addStableIdToKeyValueItems(paramsWithRetainedStableId);
};

export const normalizeConversions = (conversions: TSettingsDownloadConversion[]): TSettingsDownloadConversion[] =>
    conversions.map((conversion) => ({
        ...conversion,
        mimeType: normalizeMimeType(conversion.mimeType),
        target: normalizeMimeType(conversion.target),
    }));

const toValidServerMimeType = (mimeType: string): string => {
    if (isDefaultMimeType(mimeType)) {
        return DEFAULT_MIME_TYPE;
    }

    return `${MIME_TYPE_PREFIX}${mimeType}`;
};

export const toValidServerConversions = (conversions: TSettingsDownloadConversion[]): SettingsDownloadConversion[] =>
    conversions
        .filter(({ mimeType, target }) => !!mimeType && !!target)
        .map(({ id, mode, searchParams, ...conversion }) => ({
            ...conversion,
            mimeType: toValidServerMimeType(conversion.mimeType),
            target: isUrlTargetMode(conversion.target) ? conversion.target : `${MIME_TYPE_PREFIX}${conversion.target}`,
            headers: conversion.headers?.map(({ id: headerId, ...header }) => header) ?? null,
        }));

export const maybeAddDefault = (conversions: TSettingsDownloadConversion[]): TSettingsDownloadConversion[] => {
    const isDefaultDefined = conversions.some(({ mimeType }) => isDefaultMimeType(mimeType));

    return [
        ...(isDefaultDefined
            ? []
            : [
                  {
                      id: -1,
                      mode: ImageProcessingTargetMode.IMAGE,
                      mimeType: DEFAULT_MIME_TYPE,
                      target: '',
                      compressionLevel: null,
                      headers: null,
                      callTimeout: null,
                      connectTimeout: null,
                  },
              ]),
        ...conversions,
    ];
};

const normalizeHeaders = (
    headers: SettingsDownloadConversionType['headers'],
): SettingsDownloadConversionType['headers'] => headers?.filter(({ name }) => name !== '');

export const didUpdateConversions = (
    conversions: TSettingsDownloadConversion[],
    tmpConversions: TSettingsDownloadConversion[],
): boolean => {
    if (conversions.length !== tmpConversions.length) {
        return true;
    }

    return conversions.some(({ mimeType, target, compressionLevel, callTimeout, connectTimeout, headers }, index) => {
        const tmpConversion = tmpConversions[index];

        const orgHeaders = normalizeHeaders(headers);
        const tmpHeaders = normalizeHeaders(tmpConversion.headers);

        return (
            normalizeMimeType(mimeType) !== tmpConversion.mimeType ||
            normalizeMimeType(target) !== tmpConversion.target ||
            compressionLevel !== tmpConversion.compressionLevel ||
            callTimeout !== tmpConversion.callTimeout ||
            connectTimeout !== tmpConversion.connectTimeout ||
            (orgHeaders?.length ?? 0) !== (tmpHeaders?.length ?? 0) ||
            !!orgHeaders?.some(
                (header, headerIndex) =>
                    header.name !== tmpHeaders?.[headerIndex]?.name ||
                    header.value !== tmpHeaders?.[headerIndex]?.value,
            )
        );
    });
};
