/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ISOLanguage, IsoLanguages } from '@/base/IsoLanguages.ts';

export type LanguageObject = ISOLanguage & { orgCode: string; isoCode: string };

export const DEFAULT_LANGUAGE = 'en';

// source: https://github.com/i18next/i18next/blob/485b4ec8183952b3de8fe5e79dff6467c3afd9d3/src/i18next.js#L561
const RTL_LANGUAGES = [
    'ar',
    'shu',
    'sqr',
    'ssh',
    'xaa',
    'yhd',
    'yud',
    'aao',
    'abh',
    'abv',
    'acm',
    'acq',
    'acw',
    'acx',
    'acy',
    'adf',
    'ads',
    'aeb',
    'aec',
    'afb',
    'ajp',
    'apc',
    'apd',
    'arb',
    'arq',
    'ars',
    'ary',
    'arz',
    'auz',
    'avl',
    'ayh',
    'ayl',
    'ayn',
    'ayp',
    'bbz',
    'pga',
    'he',
    'iw',
    'ps',
    'pbt',
    'pbu',
    'pst',
    'prp',
    'prd',
    'ug',
    'ur',
    'ydd',
    'yds',
    'yih',
    'ji',
    'yi',
    'hbo',
    'men',
    'xmn',
    'fa',
    'jpr',
    'peo',
    'pes',
    'prs',
    'dv',
    'sam',
    'ckb',
];

export function getISOLanguageFor(code: string, orgCode: string = code, isoCode: string = code): LanguageObject | null {
    if (IsoLanguages[code]) {
        return {
            ...IsoLanguages[code],
            orgCode,
            isoCode,
        };
    }

    return null;
}

export function getISOLanguage(code: string): LanguageObject | null {
    return (
        getISOLanguageFor(code) ??
        getISOLanguageFor(code.toLowerCase(), code) ??
        getISOLanguageFor(code.replace('-', '_'), code) ??
        getISOLanguageFor(code.replace('_', '-'), code) ??
        getISOLanguageFor(code.split('-')[0], code) ??
        getISOLanguageFor(code.split('_')[0], code)
    );
}

const toUniqueISOLanguageCodes = (codes: string[]): string[] => {
    const languages = codes.map((code) => getISOLanguage(code)).filter((code) => code !== null);
    const languagesByIsoCode = Object.groupBy(languages, (language) => language.isoCode);

    return Object.entries(languagesByIsoCode)
        .filter(([, languagesOfIsoCode]) => !!languagesOfIsoCode?.length)
        .map(([, languagesOfIsoCode]) => languagesOfIsoCode![0].orgCode);
};

export function getPreferredISOLanguageCodes(): readonly string[] {
    const preferredLanguages = toUniqueISOLanguageCodes([...navigator.languages]);

    if (!preferredLanguages.length) {
        return [DEFAULT_LANGUAGE];
    }

    return preferredLanguages;
}

export function getLanguageReadingDirection(code: string): 'ltr' | 'rtl' {
    const language = getISOLanguage(code);

    if (code.toLowerCase().includes('-latn') || language?.isoCode.includes('-latn')) {
        return 'ltr';
    }

    if (code.toLowerCase().includes('-arab') || language?.isoCode.toLowerCase().includes('-arab')) {
        return 'rtl';
    }

    if (RTL_LANGUAGES.includes(code) || RTL_LANGUAGES.includes(language?.isoCode as string)) {
        return 'rtl';
    }

    return 'ltr';
}
