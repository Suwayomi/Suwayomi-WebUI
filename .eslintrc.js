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

        "no-relative-import-paths/no-relative-import-paths": [
            "error",
            {
                rootDir: "src",
                prefix: false,
            },
        ],
    },
};
