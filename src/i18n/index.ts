/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from 'i18n/translations';
import LanguageDetector from 'i18next-browser-languagedetector';

const i18n = use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,

        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
        debug: process.env.NODE_ENV !== 'production',
    });

export default i18n;
