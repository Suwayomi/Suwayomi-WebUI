/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';

import { getISOLanguage, getPreferredISOLanguageCodes, LanguageObject } from '@/lib/ISOLanguageUtil.ts';

import { i18n } from '@/i18n';

export enum DefaultLanguage {
    ALL = 'all',
    OTHER = 'other',
    LOCAL_SOURCE = 'localsourcelang',
    PINNED = 'pinned',
    LAST_USED_SOURCE = 'last_used_source',
}

const DEFAULT_LANGUAGE_TO_TRANSLATION: Record<DefaultLanguage, MessageDescriptor> = {
    [DefaultLanguage.ALL]: msg`All`,
    [DefaultLanguage.OTHER]: msg`Other`,
    [DefaultLanguage.LOCAL_SOURCE]: msg`Other`,
    [DefaultLanguage.PINNED]: msg`Pinned`,
    [DefaultLanguage.LAST_USED_SOURCE]: msg`Last used`,
};

export function getLanguage(code: string): LanguageObject {
    const isoLanguage = getISOLanguage(code);

    if (isoLanguage) {
        return isoLanguage;
    }

    return {
        orgCode: code,
        isoCode: code,
        name: t`Language with code: ${code}`,
        nativeName: t`Language with code: ${code}`,
    };
}

export function languageCodeToName(code: string): string {
    const isCustomLanguage = Object.keys(DEFAULT_LANGUAGE_TO_TRANSLATION).includes(code);
    if (isCustomLanguage) {
        return i18n._(DEFAULT_LANGUAGE_TO_TRANSLATION[code as DefaultLanguage]);
    }

    return getLanguage(code).nativeName;
}

export const toUniqueLanguageCodes = (codes: string[]): string[] => {
    const languages = codes.map((code) => getLanguage(code));
    const languagesByIsoCode = Object.groupBy(languages, (language) => language.isoCode);

    return Object.entries(languagesByIsoCode)
        .filter(([, languagesOfIsoCode]) => !!languagesOfIsoCode?.length)
        .map(([, languagesOfIsoCode]) => languagesOfIsoCode![0].orgCode);
};

export const toComparableLanguage = (code: string): string => getLanguage(code).isoCode;

export const toComparableLanguages = (codes: string[]): string[] => codes.map(toComparableLanguage);

export function getDefaultLanguages(): string[] {
    return [...getPreferredISOLanguageCodes(), DefaultLanguage.ALL];
}

/**
 * Sort languages by their native name.
 * Custom languages are optionally treated specially:
 * - All: first
 * - Other: last
 */
export const languageSortComparator = (a: string, b: string, specialCustomLanguagesHandling?: boolean) => {
    const isALanguageAll = a === DefaultLanguage.ALL;
    const isALanguageOther = a === DefaultLanguage.OTHER || a === DefaultLanguage.LOCAL_SOURCE;

    const isBLanguageAll = b === DefaultLanguage.ALL;
    const isBLanguageOther = b === DefaultLanguage.OTHER || b === DefaultLanguage.LOCAL_SOURCE;

    if (specialCustomLanguagesHandling) {
        if (isALanguageAll || isBLanguageOther) {
            return -1;
        }

        if (isALanguageOther || isBLanguageAll) {
            return 1;
        }
    }

    return languageCodeToName(a).localeCompare(languageCodeToName(b));
};

/**
 * Sort languages by their native name.
 * Custom languages are treated specially:
 * - All: first
 * - Other: last
 */
export const languageSpecialSortComparator = (a: string, b: string) => languageSortComparator(a, b, true);
