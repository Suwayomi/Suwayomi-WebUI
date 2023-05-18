/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';

export enum DefaultLanguage {
    ALL = 'all',
    OTHER = 'other',
    LOCAL_SOURCE = 'localsourcelang',
}

export const ISOLanguages = [
    // full list: https://github.com/meikidd/iso-639-1/blob/master/src/data.js
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ca', name: 'Catalan; Valencian', nativeName: 'Català' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'es', name: 'Spanish; Castilian', nativeName: 'Español' },
    { code: 'es-419', name: 'Spanish; Castilian', nativeName: 'Español (Latinoamérica)' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'id', name: 'Indonesian', nativeName: 'Indonesia' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'pt-pt', name: 'Portuguese', nativeName: 'Português (Portugal)' },
    { code: 'pt-br', name: 'Portuguese; Brasil', nativeName: 'Português (Brasil)' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'ru', name: 'Russian', nativeName: 'русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'zh-hans', name: 'Chinese', nativeName: '中文 (HANS)' },
    { code: 'zh-hant', name: 'Chinese', nativeName: '中文 (HANT)' },
    { code: 'zh-rhk', name: 'Chinese', nativeName: '中文 (RHK)' },
    { code: 'zh-rtw', name: 'Chinese', nativeName: '中文 (RTW)' },

    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'български' },
    { code: 'cs', name: 'Czech', nativeName: 'čeština' },
    { code: 'pl', name: 'Polish', nativeName: 'polski' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'my', name: 'Burmese', nativeName: 'ဗမာစာ' },
    { code: 'ms', name: 'Malay', nativeName: 'Malaysia' },
    { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
    { code: 'fi', name: 'Finnish', nativeName: 'suomi' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'eu', name: 'Basque', nativeName: 'euskara' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'da', name: 'Danish', nativeName: 'dansk' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'lt', name: 'Lithuanian', nativeName: 'lietuvių kalba' },
    { code: 'sh', name: 'Serbo-Croatian', nativeName: 'srpskohrvatski' },

    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
    { code: 'be', name: 'Belarusian', nativeName: 'беларуская' },
    { code: 'bs', name: 'Bosnian', nativeName: 'bosanski' },
    { code: 'sv', name: 'Swedish', nativeName: 'svenska' },
    { code: 'sv', name: 'Swedish', nativeName: 'svenska' },
];

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
