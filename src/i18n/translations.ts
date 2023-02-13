/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import en from 'i18n/resources/en.json';
import fr from 'i18n/resources/fr.json';

const translationHelper = (lng: any) => ({
    translation: lng,
});

const resources = {
    en: translationHelper(en),
    fr: translationHelper(fr),
};

export default resources;
