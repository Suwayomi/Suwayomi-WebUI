module.exports = {
    extends: ['airbnb', 'airbnb-typescript', 'prettier'],
    plugins: [
        'unused-imports',
        'eslint-plugin-import',
        '@typescript-eslint',
        'no-relative-import-paths',
        'prettier',
        'header',
    ],
    parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json', './tools/scripts/tsconfig.json'],
    },
    overrides: [
        {
            files: ['*'],
            rules: {
                'unused-imports/no-unused-imports': 'error',

                'import/prefer-default-export': 'off',
                'import/no-default-export': 'error',

                'header/header': [
                    'error',
                    'block', // comment type
                    [
                        // expected file header comment
                        // the spaces are important, otherwise, the rule will mark it as an error
                        '',
                        ' * Copyright (C) Contributors to the Suwayomi project',
                        ' *',
                        ' * This Source Code Form is subject to the terms of the Mozilla Public',
                        ' * License, v. 2.0. If a copy of the MPL was not distributed with this',
                        ' * file, You can obtain one at https://mozilla.org/MPL/2.0/.',
                        ' ',
                    ],
                    2, // number of new lines after comment
                ],

                'prettier/prettier': 'error',

                'class-methods-use-this': 'off',

                'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

                // just why
                'react/jsx-uses-react': 'off',
                'react/react-in-jsx-scope': 'off',
                'react/jsx-no-bind': 'off',
                'react/jsx-props-no-spreading': 'off',
                'react/require-default-props': 'off',
                'react/function-component-definition': 'off',

                'react/no-unstable-nested-components': [
                    'error',
                    {
                        allowAsProps: true,
                    },
                ],

                // seems to be bugged for aliases
                'import/extensions': ['error', 'ignorePackages', { '': 'never' }],

                'no-relative-import-paths/no-relative-import-paths': [
                    'error',
                    {
                        rootDir: 'src',
                        prefix: '@',
                    },
                ],

                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                group: ['@mui/*', '!@mui/material/', '!@mui/icons-material/', '!@mui/x-date-pickers/'],
                            },
                            {
                                group: ['@mui/*/*/*'],
                            },
                        ],
                    },
                ],

                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'TSTypeReference[typeName.name="SxProps"]:not([typeParameters])',
                        message: 'SxProps must have Theme parameter to avoid significant compiler slowdown.',
                    },
                ],
            },
        },
        {
            files: ['tools/scripts/**/*'],
            rules: {
                'no-relative-import-paths/no-relative-import-paths': 'off',
                'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            },
        },
    ],
};
