/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export default {
    '*.{ts,tsx,js,jsx}': [
        'biome check --write --no-errors-on-unmatched',
        () => `bun run i18n:extract`,
        'git add src/i18n/locales/*.po',
    ],
    '*.{json,md,yml,yaml,css,graphql}': 'biome format --write --no-errors-on-unmatched',
    '*.{ts,tsx,json}': () => 'bun run tsc',
};
