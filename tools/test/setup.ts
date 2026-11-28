/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { plugin } from 'bun';
import { afterEach, mock } from 'bun:test';
import { transform } from '@swc/core';

// Bun does not run SWC plugins, so the Lingui macros have to be compiled while loading the sources
plugin({
    name: 'lingui-macro',
    setup(build) {
        build.onLoad({ filter: /\/src\/.*\.tsx?$/ }, async ({ path }) => {
            const source = await Bun.file(path).text();
            const loader = path.endsWith('x') ? 'tsx' : 'ts';
            if (!source.includes('/macro')) {
                return { contents: source, loader };
            }

            const { code } = await transform(source, {
                filename: path,
                jsc: {
                    parser: { syntax: 'typescript', tsx: loader === 'tsx' },
                    transform: { react: { runtime: 'automatic' } },
                    target: 'esnext',
                    experimental: { plugins: [['@lingui/swc-plugin', {}]] },
                },
            });

            return { contents: code, loader: 'js' };
        });
    },
});

// Bun cannot detect the named exports of the CommonJS entry of notistack
plugin({
    name: 'notistack-esm',
    setup(build) {
        build.onLoad({ filter: /\/node_modules\/notistack\/index\.js$/ }, () => ({
            contents: "export * from './notistack.esm.js';",
            loader: 'js',
        }));
    },
});

// same global setup as src/index.tsx
await import('@/lib/dayjs/Setup.ts');
await import('@/lib/koration/Setup.ts');

afterEach(() => mock.restore());
