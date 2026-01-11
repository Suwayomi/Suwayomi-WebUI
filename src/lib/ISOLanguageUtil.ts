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

export const toUniqueISOLanguageCodes = (codes: string[]): string[] => {
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
