/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import en from 'i18n/locale/en.json';

import ar from 'i18n/locale/ar.json';
import de from 'i18n/locale/de.json';
import es from 'i18n/locale/es.json';
import fr from 'i18n/locale/fr.json';
import ja from 'i18n/locale/ja.json';
import pt from 'i18n/locale/pt.json';
import uk from 'i18n/locale/uk.json';
import zh_Hans from 'i18n/locale/zh_Hans.json';
import zh_Hant from 'i18n/locale/zh_Hant.json';

const translationHelper = <T>(lng: T) => ({
    translation: lng,
});

/**
 * Keys have to match {@link ISOLanguages} codes, they're used for showing the language name in the dropdown in the {@link Settings}.<br/>
 * In case there is no language code for the key in {@link ISOLanguages}, the corresponding language has to be added
 */
const resources = {
    en: translationHelper(en),

    ar: translationHelper(ar),
    de: translationHelper(de),
    es: translationHelper(es),
    fr: translationHelper(fr),
    ja: translationHelper(ja),
    pt: translationHelper(pt),
    uk: translationHelper(uk),
    'zh-Hans': translationHelper(zh_Hans),
    'zh-Hant': translationHelper(zh_Hant),
} as const;

export default resources;
