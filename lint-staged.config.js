/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export default {
    '*.{ts,tsx,js,jsx}': ['oxfmt --write', 'oxlint --fix', () => `yarn i18n:extract`, 'git add src/i18n/locales/*.po'],
    '*.{json,md,yml,yaml,css,scss,html,graphql}': 'oxfmt --write',
    '*.{ts,tsx,json}': () => 'yarn tsc',
};
