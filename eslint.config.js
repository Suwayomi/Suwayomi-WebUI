import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX, { importXResolverCompat } from 'eslint-plugin-import-x';
import * as tsResolver from 'eslint-import-resolver-typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import header from '@tony.ganchev/eslint-plugin-header';
import lingui from 'eslint-plugin-lingui';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    { ignores: ['src/lib/graphql/generated/**'] },

    // Base configs
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    reactHooksPlugin.configs['recommended-latest'],
    jsxA11y.flatConfigs.recommended,
    importX.flatConfigs.recommended,
    lingui.configs['flat/recommended'],

    // Main rules
    {
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            react: { version: 'detect' },
            'import-x/extensions': ['.ts', '.tsx', '.js', '.jsx'],
            'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
            'import-x/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import-x/resolver-next': [
                importXResolverCompat(tsResolver, {
                    extensions: ['.ts', '.tsx', '.js', '.jsx'],
                }),
            ],
        },
        plugins: {
            'unused-imports': unusedImports,
            'no-relative-import-paths': noRelativeImportPaths,
            header,
        },
        rules: {
            // Lingui
            'lingui/no-expression-in-message': 'off',

            // Core JS rules from Airbnb
            'no-console': 'warn',
            'no-nested-ternary': 'error',
            'no-else-return': ['error', { allowElseIf: false }],
            'no-lonely-if': 'error',
            'no-unneeded-ternary': ['error', { defaultAssignment: false }],
            'no-multi-assign': 'error',
            'no-return-assign': ['error', 'always'],
            'no-sequences': 'error',
            'no-new': 'error',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-eval': 'error',
            'no-script-url': 'error',
            'no-self-compare': 'error',
            'no-proto': 'error',
            'no-extend-native': 'error',
            'no-caller': 'error',
            'no-alert': 'warn',
            'no-void': 'error',
            'no-bitwise': 'error',
            'no-continue': 'error',
            'no-restricted-globals': ['error', 'isFinite', 'isNaN'],
            'no-await-in-loop': 'error',
            'no-promise-executor-return': 'error',
            'no-template-curly-in-string': 'error',
            'no-constructor-return': 'error',
            'no-unreachable-loop': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-rename': 'error',
            'no-underscore-dangle': 'error',
            'no-restricted-exports': ['error', { restrictedNamedExports: ['default', 'then'] }],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'consistent-return': 'error',
            'guard-for-in': 'error',
            'default-case': ['error', { commentPattern: '^no default$' }],
            'default-case-last': 'error',
            radix: 'error',
            yoda: 'error',
            'one-var': ['error', 'never'],
            'max-classes-per-file': ['error', 1],
            'prefer-template': 'error',
            'prefer-destructuring': [
                'error',
                {
                    VariableDeclarator: { array: false, object: true },
                    AssignmentExpression: { array: true, object: false },
                },
                { enforceForRenamedProperties: false },
            ],
            'prefer-exponentiation-operator': 'error',
            'prefer-object-spread': 'error',
            'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
            'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
            'object-shorthand': ['error', 'always', { ignoreConstructors: false, avoidQuotes: true }],
            'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^draft'] }],
            'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
            'class-methods-use-this': 'off',

            // TypeScript rules (non-type-checked)
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'error',
            'no-loop-func': 'off',
            '@typescript-eslint/no-loop-func': 'error',
            '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
            'default-param-last': 'off',
            '@typescript-eslint/default-param-last': 'error',

            // TypeScript rules (type-checked)
            'no-implied-eval': 'off',
            '@typescript-eslint/no-implied-eval': 'error',
            '@typescript-eslint/only-throw-error': 'error',
            'dot-notation': 'off',
            '@typescript-eslint/dot-notation': 'error',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
                { selector: 'function', format: ['camelCase', 'PascalCase'] },
                { selector: 'typeLike', format: ['PascalCase'] },
            ],

            // TypeScript — relax rules not effectively enforced in old config
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_|^e$|^error$',
                },
            ],
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',

            // Unused imports
            'unused-imports/no-unused-imports': 'error',

            // Import rules from Airbnb
            'import-x/no-cycle': 'off', // TODO: enable after resolving circular dependencies
            'import-x/no-mutable-exports': 'error',
            'import-x/first': 'error',
            'import-x/newline-after-import': 'error',
            'import-x/no-amd': 'error',
            'import-x/no-absolute-path': 'error',
            'import-x/no-self-import': 'error',
            'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
            'import-x/no-extraneous-dependencies': 'error',
            'import-x/order': ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] }],

            // Import rules (import → import-x)
            'import-x/prefer-default-export': 'off',
            'import-x/no-default-export': 'error',
            'import-x/extensions': 'off',
            'import-x/no-named-as-default': 'off',
            'import-x/no-named-as-default-member': 'off',
            'import-x/named': 'off',
            'import-x/no-unresolved': ['error', { ignore: ['^@dnd-kit/core/dist', '^i18next$', '^public/'] }],

            // Header
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

            // Prettier
            'prettier/prettier': 'error',

            // React hooks — relax rules that are stricter in v5
            'react-hooks/exhaustive-deps': 'off',

            // React rules from Airbnb
            'react/destructuring-assignment': ['error', 'always'],
            'react/no-unused-prop-types': 'error',
            'react/no-array-index-key': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-no-constructed-context-values': 'error',
            'react/self-closing-comp': 'error',
            'react/jsx-boolean-value': ['error', 'never'],
            'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
            'react/button-has-type': 'error',
            'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
            'react/jsx-fragments': ['error', 'syntax'],
            'react/jsx-no-script-url': 'error',
            'react/style-prop-object': 'error',
            'react/void-dom-elements-no-children': 'error',
            'react/no-danger': 'warn',
            'react/no-this-in-sfc': 'error',
            'react/state-in-constructor': ['error', 'always'],

            // React — match Airbnb overrides
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-no-bind': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/require-default-props': 'off',
            'react/function-component-definition': 'off',
            'react/display-name': 'off',
            'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

            // jsx-a11y — match Airbnb (allow autoFocus on non-DOM elements)
            'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],

            // Restricted imports (MUI pattern)
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

            // Restricted syntax (SxProps check)
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSTypeReference[typeName.name="SxProps"]:not([typeArguments])',
                    message: 'SxProps must have Theme parameter to avoid significant compiler slowdown.',
                },
            ],

            // No relative import paths
            'no-relative-import-paths/no-relative-import-paths': [
                'error',
                {
                    rootDir: 'src',
                    prefix: '@',
                },
            ],
        },
    },

    // Files using hooks in class static methods (valid namespace pattern, flagged by react-hooks v5)
    {
        files: [
            'src/base/components/settings/NumberSetting.tsx',
            'src/base/utils/MediaQuery.tsx',
            'src/features/authentication/AuthManager.ts',
            'src/features/browse/extensions/components/ExtensionCard.tsx',
            'src/features/chapter/services/Chapters.ts',
            'src/features/extension/info/components/ActionButton.tsx',
            'src/features/manga/components/TrackMangaButton.tsx',
            'src/features/manga/services/Mangas.ts',
            'src/features/metadata/services/MetadataMigrations.ts',
            'src/features/migration/components/MigrateDialog.tsx',
            'src/features/navigation-bar/components/MobileBottomBar.tsx',
            'src/features/reader/services/ReaderControls.ts',
            'src/features/reader/services/ReaderService.ts',
            'src/features/settings/screens/ImageProcessingSetting.tsx',
            'src/features/source/browse/components/SourceOptions.tsx',
            'src/features/source/browse/components/filters/SelectFilter.tsx',
            'src/features/source/services/Sources.ts',
            'src/lib/dayjs/LocaleImporter.ts',
            'src/lib/dnd-kit/DndKitUtil.ts',
            'src/lib/requests/RequestManager.ts',
            'src/lib/requests/client/GraphQLClient.ts',
            'src/lib/service-worker/ImageCache.ts',
            'src/lib/virtuoso/Virtuoso.util.tsx',
        ],
        rules: {
            'react-hooks/rules-of-hooks': 'off',
        },
    },

    // Tools/scripts override
    {
        files: ['tools/scripts/**/*'],
        rules: {
            'no-console': 'off',
            'no-relative-import-paths/no-relative-import-paths': 'off',
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
            '@typescript-eslint/naming-convention': 'off',
        },
    },

    // Config files — not part of tsconfig, disable type-checked linting and project-specific rules
    {
        files: ['eslint.config.js'],
        ...tseslint.configs.disableTypeChecked,
        rules: {
            ...tseslint.configs.disableTypeChecked.rules,
            'header/header': 'off',
            'import-x/no-default-export': 'off',
            'import-x/no-extraneous-dependencies': 'off',
            'import-x/default': 'off',
        },
    },

    // Prettier must be last
    prettierRecommended,
);
