/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import { ISOLanguage, IsoLanguages } from '@/modules/core/IsoLanguages.ts';

export enum DefaultLanguage {
    ALL = 'all',
    OTHER = 'other',
    LOCAL_SOURCE = 'localsourcelang',
}

type LanguageObject = ISOLanguage & { orgCode: string; isoCode: string };

function getISOLanguage(code: string): LanguageObject | null {
    if (IsoLanguages[code]) {
        return {
            ...IsoLanguages[code],
            orgCode: code,
            isoCode: code,
        };
    }

    if (IsoLanguages[code.toLocaleLowerCase()]) {
        return {
            ...IsoLanguages[code.toLocaleLowerCase()],
            orgCode: code,
            isoCode: code.toLocaleLowerCase(),
        };
    }

    const whereToCut = code.indexOf('-') !== -1 ? code.indexOf('-') : code.length;
    const processedCode = code.toLocaleLowerCase().substring(0, whereToCut);
    if (IsoLanguages[processedCode]) {
        return {
            ...IsoLanguages[processedCode],
            orgCode: code,
            isoCode: processedCode,
        };
    }

    return null;
}

export function getLanguage(code: string): LanguageObject {
    const isoLanguage = getISOLanguage(code);

    if (isoLanguage) {
        return isoLanguage;
    }

    return {
        orgCode: code,
        isoCode: code,
        name: t('global.language.label.language_with_code', { code }),
        nativeName: t('global.language.label.language_with_code', { code }),
    };
}

export function languageCodeToName(code: string): string {
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

function defaultNativeLang(): readonly string[] {
    const preferredLanguages = toUniqueLanguageCodes([...navigator.languages]);

    if (!preferredLanguages.length) {
        return ['en'];
    }

    return preferredLanguages;
}

export function getDefaultLanguages(): string[] {
    return [...defaultNativeLang(), DefaultLanguage.ALL];
}

export const languageSortComparator = (a: string, b: string) =>
    languageCodeToName(a).localeCompare(languageCodeToName(b));
