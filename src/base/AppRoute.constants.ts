/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { MangaIdInfo } from '@/features/manga/Manga.types.ts';

import { ChapterSourceOrderInfo } from '@/features/chapter/Chapter.types.ts';
import { BrowseTab } from '@/features/browse/Browse.types.ts';
import { SearchParam } from '@/base/Base.types.ts';

type AppRouteInfo = {
    match: string;
    path?: string | ((...args: any[]) => string);
};

type TAppRoutes = Record<string, AppRouteInfo & { childRoutes?: TAppRoutes }>;

const createParam = (name: string, value: any): string => (value ? `${name}=${encodeURIComponent(value)}` : '');

const createQueryParam = (query: string | null | undefined): string => createParam(SearchParam.QUERY, query);

const addParams = (path: string, ...params: string[]) => {
    const joinedParams = params.filter(Boolean).join('&');

    return `${path}${joinedParams ? `?${joinedParams}` : ''}`;
};

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
                path: (sourceId: SourceType['id'], query?: string | null | undefined) =>
                    addParams(`/sources/${sourceId}`, createQueryParam(query)),
            },
            configure: {
                match: ':sourceId/configure',
                path: (sourceId: SourceType['id']) => `/sources/${sourceId}/configure`,
            },
            searchAll: {
                match: 'all/search',
                path: (query?: string | null | undefined) => addParams('/sources/all/search', createQueryParam(query)),
            },
        },
    },

    extension: {
        match: 'extension',
        path: '/extension',
        childRoutes: {
            info: {
                match: ':pkgName',
                path: (pkgName: string) => `/extension/${pkgName}`,
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
        path: (tab?: string, search?: string) =>
            addParams('/library', createParam(SearchParam.TAB, tab), createQueryParam(search)),
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
        path: (tab?: BrowseTab) => addParams('/browse', createParam(SearchParam.TAB, tab)),
    },
    migrate: {
        match: 'migrate/source/:sourceId',
        path: (sourceId: SourceType['id']) => `/migrate/source/${sourceId}`,

        childRoutes: {
            search: {
                match: 'manga/:mangaId/search',
                path: (sourceId: SourceType['id'], mangaId: MangaIdInfo['id'], query?: string | null | undefined) =>
                    addParams(`/migrate/source/${sourceId}/manga/${mangaId}/search`, createQueryParam(query)),
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
