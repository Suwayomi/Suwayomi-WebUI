module.exports = {
    extends: [
        'airbnb',
        'airbnb-typescript'
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        // Indent with 4 spaces
        '@typescript-eslint/indent': ['error', 4],

        // Indent JSX with 4 spaces
        'react/jsx-indent': ['error', 4],

        // Indent props with 4 spaces
        'react/jsx-indent-props': ['error', 4],

        'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],


        // just why
        'react/jsx-no-bind' : 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
    },
};
