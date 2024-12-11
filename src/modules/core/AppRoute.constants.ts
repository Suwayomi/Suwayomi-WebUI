/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { ChapterSourceOrderInfo } from '@/modules/chapter/services/Chapters.ts';

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
    settings: {
        path: '/settings',
        match: 'settings',
        childRoutes: {
            about: {
                match: 'about',
                path: '/settings/about',
            },
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
                path: '/sources/all/search',
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
        path: '/library',
    },
    updates: {
        match: 'updates',
        path: '/updates',
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
        match: '/manga/:mangaId/chapter/:chapterIndex/*',
        path: (mangaId: MangaIdInfo['id'], chapterIndex: ChapterSourceOrderInfo['sourceOrder']) =>
            `/manga/${mangaId}/chapter/${chapterIndex}`,
    },
} satisfies TAppRoutes;
