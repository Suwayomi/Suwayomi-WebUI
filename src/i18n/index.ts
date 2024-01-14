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
import { resources } from '@/i18n/translations';

export const i18n = use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,

        fallbackLng: 'en',
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
