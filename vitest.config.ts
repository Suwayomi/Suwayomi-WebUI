/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    plugins: [react({ plugins: [['@lingui/swc-plugin', {}]] }), lingui()],
    test: {
        environment: 'happy-dom',
        // same global setup as src/index.tsx
        setupFiles: ['./src/lib/dayjs/Setup.ts', './src/lib/koration/Setup.ts'],
        include: ['src/**/*.test.ts'],
        restoreMocks: true,
    },
});
