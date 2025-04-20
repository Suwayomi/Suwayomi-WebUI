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

function getISOLanguage(code: string): ISOLanguage | null {
    if (IsoLanguages[code]) {
        return IsoLanguages[code];
    }

    if (IsoLanguages[code.toLocaleLowerCase()]) {
        return IsoLanguages[code.toLocaleLowerCase()];
    }

    const whereToCut = code.indexOf('-') !== -1 ? code.indexOf('-') : code.length;
    const processedCode = code.toLocaleLowerCase().substring(0, whereToCut);
    if (IsoLanguages[processedCode]) {
        return IsoLanguages[processedCode];
    }

    return null;
}

export function getLanguage(code: string): { name: string; nativeName: string } {
    const isoLanguage = getISOLanguage(code);

    if (isoLanguage) {
        return isoLanguage;
    }

    return {
        name: t('global.language.label.language_with_code', { code }),
        nativeName: t('global.language.label.language_with_code', { code }),
    };
}

export function langCodeToName(code: string): string {
    return getLanguage(code).nativeName;
}

function defaultNativeLang(): readonly string[] {
    return navigator.languages;
}

export function extensionDefaultLangs(): string[] {
    return [...defaultNativeLang()];
}

export function sourceDefualtLangs(): string[] {
    return [...defaultNativeLang(), DefaultLanguage.LOCAL_SOURCE];
}

export function sourceForcedDefaultLangs(): string[] {
    return [DefaultLanguage.LOCAL_SOURCE];
}

export const langSortCmp = (a: string, b: string) => {
    // puts english first for convience
    const aLang = langCodeToName(a);
    const bLang = langCodeToName(b);

    if (a === 'en') return -1;
    if (b === 'en') return 1;

    return aLang.localeCompare(bLang);
};
