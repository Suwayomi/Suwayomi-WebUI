/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/**
 * Keys have to match {@link ISOLanguages} codes, they're used for showing the language name in the dropdown in the {@link Settings}.<br/>
 * In case there is no language code for the key in {@link ISOLanguages}, the corresponding language has to be added
 */
export const i18nResources = [
    'ar',
    'de',
    'en',
    'es',
    'fr',
    'id',
    'it',
    'ja',
    'ko',
    'nb_NO',
    'pt',
    'sv',
    'uk',
    'vi',
    'zh_Hans',
    'zh_Hant',
];

export const i18n = use(initReactI18next)
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
        fallbackLng: 'en',

        backend: {
            loadPath: '/locales/{{lng}}.json',
            allowMultiLoading: true,
        },

        interpolation: {
            escapeValue: false,
            format: (value, format) => {
                switch (format) {
                    case 'lowercase':
                        return value.toLocaleLowerCase();
                    default:
                        return value;
                }
            },
        },

        returnNull: false,
        debug: process.env.NODE_ENV !== 'production',
    });
