/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { i18n } from '@lingui/core';
import { DEFAULT_LANGUAGE, getISOLanguage, getPreferredISOLanguageCodes } from '@/lib/ISOLanguageUtil.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import localesConfig from '@/i18n/locales.json';

export const i18nResources = localesConfig.locales;

export type I18nResourceCode = (typeof i18nResources)[number];

const DEFAULT_LOCALE = localesConfig.defaultLocale;

const SELECTED_LANGUAGE_CODE_KEY = 'i18n:selected-language';

export async function loadCatalog(locale: string): Promise<void> {
    const localeToLoad = i18nResources.includes(locale as (typeof i18nResources)[number]) ? locale : DEFAULT_LOCALE;

    const { messages } = await import(`./locales/${localeToLoad}.po`);
    i18n.loadAndActivate({ locale: localeToLoad, messages });

    AppStorage.local.setItem(SELECTED_LANGUAGE_CODE_KEY, localeToLoad);
}

function detectLocale(): string {
    const storedLanguage = AppStorage.local.getItem(SELECTED_LANGUAGE_CODE_KEY);
    const preferredLanguages = getPreferredISOLanguageCodes();
    const languageCodes = [storedLanguage, ...preferredLanguages];

    const normalizedLanguageCodes = languageCodes
        .filter((code) => code !== null)
        .filter((code) => getISOLanguage(code))
        .filter((code) => i18nResources.includes(code as (typeof i18nResources)[number]));

    return normalizedLanguageCodes[0] ?? DEFAULT_LANGUAGE;
}

export async function initializeLocalization(): Promise<void> {
    try {
        await loadCatalog(detectLocale());
    } catch (e) {
        await loadCatalog(DEFAULT_LOCALE);
    }
}

export { i18n };
