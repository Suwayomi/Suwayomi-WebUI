/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { defineConfig } from '@lingui/cli';
// eslint-disable-next-line import/no-extraneous-dependencies
import { formatter } from '@lingui/format-po';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import localesConfig from './src/i18n/locales.json';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    sourceLocale: localesConfig.defaultLocale,
    locales: localesConfig.locales,
    catalogs: [
        {
            path: '<rootDir>/src/i18n/locales/{locale}',
            include: ['src'],
        },
    ],
    format: formatter({ lineNumbers: false }),
});
