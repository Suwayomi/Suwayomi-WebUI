module.exports = {
    extends: ['airbnb', 'airbnb-typescript', 'prettier'],
    plugins: ['@typescript-eslint', 'no-relative-import-paths', 'prettier'],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'prettier/prettier': 'error',

        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

        // just why
        'react/jsx-no-bind': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
        'react/function-component-definition': 'off',

        '@typescript-eslint/no-shadow': 'off',

        'react/no-unstable-nested-components': [
            'error',
            {
                allowAsProps: true,
            },
        ],

        'no-relative-import-paths/no-relative-import-paths': [
            'error',
            {
                rootDir: 'src',
                prefix: false,
            },
        ],
    },
};
