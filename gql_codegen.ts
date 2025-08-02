/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CodegenConfig } from '@graphql-codegen/cli';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';

const config: CodegenConfig = {
    overwrite: true,
    schema: process.env.CODEGEN_SERVER_URL_GQL,
    documents: [
        'src/lib/graphql/queries/**',
        'src/lib/graphql/mutations/**',
        'src/lib/graphql/subscriptions/**',
        'src/lib/graphql/fragments/**',
        'src/lib/graphql/Fragments.ts',
    ],
    ignoreNoDocuments: true,
    generates: {
        'src/lib/graphql/generated/graphql.ts': {
            plugins: ['typescript', 'typescript-operations'],
            config: {
                namingConvention: {
                    typeNames: 'change-case-all#pascalCase',
                    transformUnderscore: true,
                },
                scalars: {
                    LongString: 'string',
                    Cursor: 'string',
                },
            },
        },
        'src/lib/graphql/generated/apollo-helpers.ts': {
            plugins: ['typescript-apollo-client-helpers'],
        },
    },
};

// eslint-disable-next-line import/no-default-export
export default config;
