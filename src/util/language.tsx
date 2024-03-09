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

const loadDefaultDayJsLocale = () => import('dayjs/locale/en.js');

export const ISOLanguages = [
    // full list: https://github.com/meikidd/iso-639-1/blob/master/src/data.js
    { dayjsImport: loadDefaultDayJsLocale, code: 'en', name: 'English', nativeName: 'English' },
    { dayjsImport: () => import('dayjs/locale/ca.js'), code: 'ca', name: 'Catalan; Valencian', nativeName: 'Català' },
    { dayjsImport: () => import('dayjs/locale/de.js'), code: 'de', name: 'German', nativeName: 'Deutsch' },
    { dayjsImport: () => import('dayjs/locale/es.js'), code: 'es', name: 'Spanish; Castilian', nativeName: 'Español' },
    {
        dayjsImport: () => import('dayjs/locale/es.js'),
        code: 'es-419',
        name: 'Spanish; Castilian',
        nativeName: 'Español (Latinoamérica)',
    },
    { dayjsImport: () => import('dayjs/locale/fr.js'), code: 'fr', name: 'French', nativeName: 'Français' },
    { dayjsImport: () => import('dayjs/locale/id.js'), code: 'id', name: 'Indonesian', nativeName: 'Indonesia' },
    { dayjsImport: () => import('dayjs/locale/it.js'), code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { dayjsImport: () => import('dayjs/locale/pt.js'), code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    {
        dayjsImport: () => import('dayjs/locale/pt.js'),
        code: 'pt-pt',
        name: 'Portuguese',
        nativeName: 'Português (Portugal)',
    },
    {
        dayjsImport: () => import('dayjs/locale/pt-br.js'),
        code: 'pt-br',
        name: 'Portuguese; Brasil',
        nativeName: 'Português (Brasil)',
    },
    { dayjsImport: () => import('dayjs/locale/vi.js'), code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { dayjsImport: () => import('dayjs/locale/tr.js'), code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { dayjsImport: () => import('dayjs/locale/ru.js'), code: 'ru', name: 'Russian', nativeName: 'русский' },
    { dayjsImport: () => import('dayjs/locale/ar.js'), code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { dayjsImport: () => import('dayjs/locale/hi.js'), code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { dayjsImport: () => import('dayjs/locale/th.js'), code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { dayjsImport: () => import('dayjs/locale/zh.js'), code: 'zh', name: 'Chinese', nativeName: '中文' },
    { dayjsImport: () => import('dayjs/locale/zh-cn.js'), code: 'zh-hans', name: 'Chinese', nativeName: '中文 (HANS)' },
    { dayjsImport: () => import('dayjs/locale/zh-hk.js'), code: 'zh-hant', name: 'Chinese', nativeName: '中文 (HANT)' },
    { dayjsImport: () => import('dayjs/locale/zh-hk.js'), code: 'zh-rhk', name: 'Chinese', nativeName: '中文 (RHK)' },
    { dayjsImport: () => import('dayjs/locale/zh-tw.js'), code: 'zh-rtw', name: 'Chinese', nativeName: '中文 (RTW)' },

    { dayjsImport: () => import('dayjs/locale/ja.js'), code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { dayjsImport: () => import('dayjs/locale/ko.js'), code: 'ko', name: 'Korean', nativeName: '한국어' },
    { dayjsImport: () => import('dayjs/locale/af.js'), code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
    { dayjsImport: () => import('dayjs/locale/af.js'), code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
    { dayjsImport: () => import('dayjs/locale/uk.js'), code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { dayjsImport: () => import('dayjs/locale/ro.js'), code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { dayjsImport: () => import('dayjs/locale/bg.js'), code: 'bg', name: 'Bulgarian', nativeName: 'български' },
    { dayjsImport: () => import('dayjs/locale/cs.js'), code: 'cs', name: 'Czech', nativeName: 'čeština' },
    { dayjsImport: () => import('dayjs/locale/pl.js'), code: 'pl', name: 'Polish', nativeName: 'polski' },
    {
        dayjsImport: () => import('dayjs/locale/nb.js'),
        code: 'nb',
        name: 'Norwegian Bokmål',
        nativeName: 'Norsk bokmål',
    },
    { dayjsImport: () => import('dayjs/locale/nb.js'), code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { dayjsImport: () => import('dayjs/locale/nl.js'), code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { dayjsImport: () => import('dayjs/locale/my.js'), code: 'my', name: 'Burmese', nativeName: 'ဗမာစာ' },
    { dayjsImport: () => import('dayjs/locale/ms.js'), code: 'ms', name: 'Malay', nativeName: 'Malaysia' },
    { dayjsImport: () => import('dayjs/locale/mn.js'), code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
    { dayjsImport: () => import('dayjs/locale/ml.js'), code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { dayjsImport: () => import('dayjs/locale/ku.js'), code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
    { dayjsImport: () => import('dayjs/locale/hu.js'), code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { dayjsImport: () => import('dayjs/locale/hr.js'), code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
    { dayjsImport: () => import('dayjs/locale/he.js'), code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { dayjsImport: () => import('dayjs/locale/tl-ph'), code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
    { dayjsImport: () => import('dayjs/locale/fi.js'), code: 'fi', name: 'Finnish', nativeName: 'suomi' },
    { dayjsImport: () => import('dayjs/locale/fa.js'), code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { dayjsImport: () => import('dayjs/locale/eu.js'), code: 'eu', name: 'Basque', nativeName: 'euskara' },
    { dayjsImport: () => import('dayjs/locale/el.js'), code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { dayjsImport: () => import('dayjs/locale/da.js'), code: 'da', name: 'Danish', nativeName: 'dansk' },
    { dayjsImport: () => import('dayjs/locale/bn.js'), code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { dayjsImport: () => import('dayjs/locale/lt.js'), code: 'lt', name: 'Lithuanian', nativeName: 'lietuvių kalba' },
    {
        dayjsImport: loadDefaultDayJsLocale,
        code: 'sh',
        name: 'Serbo-Croatian',
        nativeName: 'srpskohrvatski',
    },

    { dayjsImport: () => import('dayjs/locale/af.js'), code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { dayjsImport: () => import('dayjs/locale/am.js'), code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { dayjsImport: () => import('dayjs/locale/az.js'), code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
    { dayjsImport: () => import('dayjs/locale/be.js'), code: 'be', name: 'Belarusian', nativeName: 'беларуская' },
    { dayjsImport: () => import('dayjs/locale/bs.js'), code: 'bs', name: 'Bosnian', nativeName: 'bosanski' },
    { dayjsImport: () => import('dayjs/locale/sv.js'), code: 'sv', name: 'Swedish', nativeName: 'svenska' },
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
