/*
 * Minimal ESLint config — only rules not yet supported natively in oxlint.
 * The bulk of linting is done by oxlint (.oxlintrc.json).
 */
import tseslint from 'typescript-eslint';
import header from '@tony.ganchev/eslint-plugin-header';

export default tseslint.config(
    { ignores: ['src/lib/graphql/generated/**', 'eslint.config.js'] },

    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: tseslint.parser,
        },
        plugins: {
            header,
        },
        rules: {
            // MPL 2.0 license header
            'header/header': [
                'error',
                'block',
                [
                    '',
                    ' * Copyright (C) Contributors to the Suwayomi project',
                    ' *',
                    ' * This Source Code Form is subject to the terms of the Mozilla Public',
                    ' * License, v. 2.0. If a copy of the MPL was not distributed with this',
                    ' * file, You can obtain one at https://mozilla.org/MPL/2.0/.',
                    ' ',
                ],
                2,
            ],
        },
    },
);
