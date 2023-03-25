/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import en from 'i18n/locale/en.json';

import ar from 'i18n/resources/ar.json';
import de from 'i18n/resources/de.json';
import es from 'i18n/resources/es.json';
import fr from 'i18n/resources/fr.json';

const translationHelper = <T>(lng: T) => ({
    translation: lng,
});

const resources = {
    en: translationHelper(en),

    ar: translationHelper(ar),
    de: translationHelper(de),
    es: translationHelper(es),
    fr: translationHelper(fr),
} as const;

export default resources;
