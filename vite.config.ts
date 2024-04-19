/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import legacy from '@vitejs/plugin-legacy';

// TODO - switch to ESM - with Vite v5.x the CJS build is deprecated (https://vitejs.dev/guide/migration)

// eslint-disable-next-line import/no-default-export
export default defineConfig(() => ({
    build: {
        outDir: 'build',
    },
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        include: ['@mui/material/Tooltip'],
    },
    plugins: [
        react(),
        viteTsconfigPaths(),
        legacy({
            modernPolyfills: [
                'es/array/to-spliced',
                'es/array/to-sorted',
                'es/array/find-last',
                'es/array/find-last-index',
                'es/object/group-by',
            ],
        }),
    ],
}));
