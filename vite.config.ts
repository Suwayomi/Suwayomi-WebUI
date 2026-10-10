/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import { lingui } from '@lingui/vite-plugin';
import 'dotenv/config';
import { d } from 'koration';
import type { RuntimeCaching } from 'workbox-build';

const createCacheFirstRuntimeCache = (cache: Omit<RuntimeCaching, 'handler'>): RuntimeCaching => ({
    ...cache,
    handler: 'CacheFirst',
    options: {
        ...cache.options,
        expiration: {
            purgeOnQuotaError: true,
            ...cache.options.expiration,
            matchOptions: {
                ignoreVary: true,
                ...cache.options.expiration.matchOptions,
            },
        },
        cacheableResponse: {
            statuses: [0, 200],
            ...cache.options.cacheableResponse,
        },
        matchOptions: {
            ignoreVary: true,
            ...cache.options.matchOptions,
        },
    },
});

export default defineConfig(({ command }) => ({
    base: command === 'serve' ? process.env.VITE_SUBPATH || './' : './',
    build: {
        outDir: 'build',
        // NOTE: don't try to merge the many tiny shared chunks via rolldown's "codeSplitting.groups": both a broad
        // group (everything shared by >= 2 chunks) and a narrow one (small node_modules modules only) produced
        // circular chunks that break the legacy (SystemJS) execution order ("x is not a constructor/function"
        // at chunk evaluation), and the narrow one even increased the chunk count.
    },
    server: {
        port: Number(process.env.PORT),
        allowedHosts: process.env.ALLOWED_HOSTS?.split(',').map((s) => s.trim()),
    },
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    optimizeDeps: {
        include: ['@mui/material/Tooltip'],
    },
    plugins: [
        react({
            plugins: [['@lingui/swc-plugin', {}]],
        }),
        lingui({
            failOnCompileError: true,
        }),
        legacy({
            // The plugin's default targets drop Safari 12 (iOS 12.5.8 iPad Air), so the legacy chunks still
            // contained ES2020 syntax (?. ??) that is a hard parse error there. Including it makes babel
            // lower the syntax and lets the usage-based core-js detection pick the polyfills it really needs
            // (instead of shipping the whole of core-js).
            targets: ['last 2 versions and not dead', '> 0.3%', 'Firefox ESR', 'safari >= 12', 'iOS >= 12'],
            modernPolyfills: [
                'es/array/to-spliced',
                'es/array/to-sorted',
                'es/array/find-last',
                'es/array/find-last-index',
                'es/object/group-by',
            ],
            // DOM/Intl shims babel can't provide (bundled into "polyfills-legacy-*.js" only, see the file).
            // The polyfill chunk is built from the plugin's own directory, so the path has to be absolute.
            additionalLegacyPolyfills: [
                path.resolve(import.meta.dirname, 'src/legacy/ios12-shims.js').replaceAll('\\', '/'),
            ],
        }),
        {
            // "marked" detects regex lookbehind support with `!!new RegExp("(?<=1)(?<!1)" + flags)`. The oxc
            // minifier constant-folds that into `true` (a RegExp with constant arguments is treated as never
            // throwing), so every browser without lookbehind (Safari < 16.4) died with "invalid group specifier
            // name" as soon as the Manga chunk was evaluated. Building the pattern at runtime keeps the probe
            // honest. Fails the build if marked changes the probe, so this can't silently regress.
            name: 'marked-keep-lookbehind-probe',
            enforce: 'pre',
            transform(code, id) {
                if (!/[\\/]node_modules[\\/]marked[\\/]/.test(id) || !code.includes('(?<=1)(?<!1)')) {
                    return null;
                }

                // marked 17 (pulled in by the tiptap markdown extension): `new RegExp("(?<=1)(?<!1)")`
                // marked 18: `new RegExp("(?<=1)(?<!1)" + flags)`
                const probe = /new RegExp\("\(\?<=1\)\(\?<!1\)"(\+\w+)?\)/;
                if (!probe.test(code)) {
                    this.error(
                        `marked's lookbehind probe has changed, update the "marked-keep-lookbehind-probe" plugin (${id})`,
                    );
                }

                return {
                    code: code.replace(probe, 'new RegExp(["(?<=1)", "(?<!1)"].join("")$1)'),
                    map: null,
                };
            },
        },
        // Only setup image runtime caching
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false, // Use existing manifest
            devOptions: {
                enabled: true,
            },
            workbox: {
                globPatterns: [],
                runtimeCaching: [
                    createCacheFirstRuntimeCache({
                        urlPattern: ({ url }) => {
                            const { pathname } = url;
                            return pathname.match(/\/chapter\/[0-9]+\/page\/[0-9]+/g);
                        },
                        options: {
                            // !!! IMPORTANT !!! - Update along with ImageCache.ts
                            cacheName: 'image-cache-chapter-pages',
                            expiration: {
                                // Max age from server
                                maxAgeSeconds: d(1).days.inWholeSeconds,
                                maxEntries: 2500,
                            },
                        },
                    }),
                    createCacheFirstRuntimeCache({
                        urlPattern: ({ url }) => {
                            const { pathname } = url;
                            return pathname.match(/\/manga\/[0-9]+\/thumbnail/g);
                        },
                        options: {
                            // !!! IMPORTANT !!! - Update along with ImageCache.ts
                            cacheName: 'image-cache-manga-thumbnails',
                            expiration: {
                                // Max age from server
                                maxAgeSeconds: d(1).days.inWholeSeconds,
                                maxEntries: 5000,
                            },
                        },
                    }),
                    createCacheFirstRuntimeCache({
                        urlPattern: ({ url }) => {
                            const { pathname } = url;
                            return pathname.includes('/extension/icon/');
                        },
                        options: {
                            // !!! IMPORTANT !!! - Update along with ImageCache.ts
                            cacheName: 'image-cache-extension-icons',
                            expiration: {
                                // Max age from server
                                maxAgeSeconds: d(365).days.inWholeSeconds,
                                maxEntries: 300,
                            },
                        },
                    }),
                    createCacheFirstRuntimeCache({
                        urlPattern: ({ request }) => request.destination === 'image',
                        options: {
                            // !!! IMPORTANT !!! - Update along with ImageCache.ts
                            cacheName: 'image-cache-other',
                            expiration: {
                                maxAgeSeconds: d(4).days.inWholeSeconds,
                                maxEntries: 500,
                            },
                        },
                    }),
                ],
            },
        }),
        {
            name: 'inject-base-tag',
            enforce: 'post',
            transformIndexHtml() {
                // Ensure the base tag is placed at the top of the header before any vite injected script
                // For example, the plugin-legacy injects the modern polyfill script at the top of the header above the base tag, resulting in an invalid url
                return { tags: [{ tag: 'base', attrs: { href: '/' } }] };
            },
        },
    ],
}));
