/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
    sourceLocale: 'en',
    locales: ['en'],
    catalogs: [
        {
            path: '<rootDir>/src/i18n/locales/{locale}',
            include: ['src'],
        },
    ],
    format: formatter({ lineNumbers: false }),
});
