/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import { ISOLanguages, loadDefaultDayJsLocale } from '@/util/isoLanguages.ts';

export enum DefaultLanguage {
    ALL = 'all',
    OTHER = 'other',
    LOCAL_SOURCE = 'localsourcelang',
}

export function langCodeToName(code: string): string {
    const whereToCut = code.indexOf('-') !== -1 ? code.indexOf('-') : code.length;

    const proccessedCode = code.toLocaleLowerCase().substring(0, whereToCut);
    let result = t('global.language.label.language_with_code', { code });

    for (let i = 0; i < ISOLanguages.length; i++) {
        if (ISOLanguages[i].code === proccessedCode || ISOLanguages[i].code === code.toLocaleLowerCase()) {
            result = ISOLanguages[i].nativeName;
        }
    }

    return result;
}

function defaultNativeLang() {
    return 'en'; // TODO: infer from the browser
}

export function extensionDefaultLangs() {
    return [defaultNativeLang(), DefaultLanguage.ALL];
}

export function sourceDefualtLangs() {
    return [defaultNativeLang(), DefaultLanguage.LOCAL_SOURCE];
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
    if (a === DefaultLanguage.LOCAL_SOURCE) return 1;
    if (b === DefaultLanguage.LOCAL_SOURCE) return -1;

    return aLang > bLang ? 1 : -1;
};

export const loadDayJsLocale = async (locale: string) => {
    const lang = ISOLanguages.find(({ code }) => code.toLowerCase() === locale.toLowerCase());

    try {
        if (!lang) {
            await loadDefaultDayJsLocale();
            return false;
        }

        await lang.dayjsImport();
        return true;
    } catch (e) {
        return false;
        // ignore - dayjs falls back to en anyway
    }
};
