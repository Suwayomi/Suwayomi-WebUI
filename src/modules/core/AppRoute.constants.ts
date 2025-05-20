/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';

import { ChapterSourceOrderInfo } from '@/modules/chapter/Chapter.types.ts';

type AppRouteInfo = {
    match: string;
    path?: string | ((...args: any[]) => string);
};

type TAppRoutes = Record<string, AppRouteInfo & { childRoutes?: TAppRoutes }>;

export const AppRoutes = {
    root: {
        match: '/',
        path: '/',
    },
    matchAll: {
        match: '*',
    },
    about: {
        match: 'about',
        path: '/about',
    },
    settings: {
        path: '/settings',
        match: 'settings',
        childRoutes: {
            categories: {
                match: 'categories',
                path: '/settings/categories',
            },
            reader: {
                match: 'reader',
                path: '/settings/reader',
            },
            library: {
                match: 'library',
                path: '/settings/library',

                childRoutes: {
                    duplicates: {
                        match: 'duplicates',
                        path: '/settings/library/duplicates',
                    },
                },
            },
            download: {
                match: 'download',
                path: '/settings/download',
            },
            backup: {
                match: 'backup',
                path: '/settings/backup',
            },
            server: {
                match: 'server',
                path: '/settings/server',
            },
            webui: {
                match: 'webui',
                path: '/settings/webui',
            },
            browse: {
                match: 'browse',
                path: '/settings/browse',
            },
            device: {
                match: 'device',
                path: '/settings/device',
            },
            tracking: {
                match: 'tracking',
                path: '/settings/tracking',
            },
            appearance: {
                match: 'appearance',
                path: '/settings/appearance',
            },
            history: {
                match: 'history',
                path: '/settings/history',
            },
        },
    },
    sources: {
        match: 'sources',
        path: '/sources',

        childRoutes: {
            browse: {
                match: ':sourceId',
                path: (sourceId: SourceType['id']) => `/sources/${sourceId}`,
            },
            configure: {
                match: ':sourceId/configure',
                path: (sourceId: SourceType['id']) => `/sources/${sourceId}/configure`,
            },
            searchAll: {
                match: 'all/search',
                path: (query?: string | null | undefined) => {
                    const queryParam = query ? `query=${encodeURIComponent(query)}` : '';

                    return `/sources/all/search${queryParam ? `?${queryParam}` : ''}`;
                },
            },
        },
    },
    downloads: {
        match: 'downloads',
        path: '/downloads',
    },
    manga: {
        match: 'manga/:id',
        path: (mangaId: MangaIdInfo['id']) => `/manga/${mangaId}`,

        childRoutes: {
            reader: {
                match: 'chapter/:chapterNum',
                path: (mangaId: MangaIdInfo['id'], chapterNum: ChapterSourceOrderInfo['sourceOrder']) =>
                    `/manga/${mangaId}/chapter/${chapterNum}`,
            },
        },
    },
    library: {
        match: 'library',
        path: (tab?: string, search?: string) => {
            const tabParam = tab ? `tab=${tab}` : '';
            const searchParam = search ? `query=${encodeURIComponent(search)}` : '';

            const params = [tabParam, searchParam].filter(Boolean).join('&');

            return `/library${params ? `?${params}` : ''}`;
        },
    },
    updates: {
        match: 'updates',
        path: '/updates',
    },
    history: {
        match: 'history',
        path: '/history',
    },
    recent: {
        match: 'recent',
        path: '/recent',
    },
    browse: {
        match: 'browse',
        path: '/browse',
    },
    migrate: {
        match: 'migrate/source/:sourceId',
        path: (sourceId: SourceType['id']) => `/migrate/source/${sourceId}`,

        childRoutes: {
            search: {
                match: 'manga/:mangaId/search',
                path: (sourceId: SourceType['id'], mangaId: MangaIdInfo['id']) =>
                    `/migrate/source/${sourceId}/manga/${mangaId}/search`,
            },
        },
    },
    tracker: {
        match: 'tracker/login/oauth',
        path: '/tracker/login/oauth',
    },
    reader: {
        match: '/manga/:mangaId/chapter/:chapterSourceOrder/*',
        path: (mangaId: MangaIdInfo['id'], chapterSourceOrder: ChapterSourceOrderInfo['sourceOrder']) =>
            `/manga/${mangaId}/chapter/${chapterSourceOrder}`,
    },
    more: {
        match: '/more',
        path: '/more',
    },
} as const satisfies TAppRoutes;

type ExtractChildRouteStringPaths<T> = T extends { childRoutes: infer U } ? ExtractStringPaths<U[keyof U]> : never;

type ExtractStringPaths<T> = T extends { path: infer P }
    ? P extends string
        ? P | ExtractChildRouteStringPaths<T>
        : ExtractChildRouteStringPaths<T>
    : ExtractChildRouteStringPaths<T>;

export type StaticAppRoute = ExtractStringPaths<(typeof AppRoutes)[keyof typeof AppRoutes]>;

export const GROUPED_VIRTUOSO_Z_INDEX = 2;
