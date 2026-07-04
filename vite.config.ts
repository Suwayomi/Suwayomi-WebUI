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
            modernPolyfills: [
                'es/array/to-spliced',
                'es/array/to-sorted',
                'es/array/find-last',
                'es/array/find-last-index',
                'es/object/group-by',
            ],
        }),
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
