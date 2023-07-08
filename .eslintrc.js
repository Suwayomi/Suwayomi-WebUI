module.exports = {
    extends: ['airbnb', 'airbnb-typescript', 'prettier'],
    plugins: ['@typescript-eslint', 'no-relative-import-paths', 'prettier', 'header'],
    parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json', './tools/scripts/tsconfig.json'],
    },
    overrides: [
        {
            files: ['*'],
            rules: {
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
            },
        },
        {
            files: ['tools/scripts/*'],
            rules: {
                'no-relative-import-paths/no-relative-import-paths': 'off',
                'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            },
        },
    ],
};
