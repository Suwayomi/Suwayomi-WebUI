/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SourceIdInfo } from '@/features/source/Source.types.ts';

import { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

export type MetadataBrowseSettings = {
    hideLibraryEntries: boolean;
    browseLanguages: string[];
    showNsfw: boolean;
    lastUsedSourceId: SourceIdInfo['id'] | null;
    shouldShowOnlySourcesWithResults: boolean;
};

export enum BrowseTab {
    SOURCE_DEPRECATED = 'source',
    SOURCES = 'sources',
    EXTENSIONS = 'extensions',

    MANGA_SOURCES = 'manga-sources',
    MANGA_EXTENSIONS = 'manga-extensions',
    LIGHT_NOVEL_SOURCES = 'light-novel-sources',
    LIGHT_NOVEL_EXTENSIONS = 'light-novel-extensions',
    MIGRATE = 'migrate',
}

export function normalizeBrowseParams(params: { tab?: string | null; type?: string | null }) {
    const isLightNovel =
        params.type?.toLowerCase() === 'light-novel' || params.type?.toUpperCase() === SourceContentType.LightNovel;

    switch (params.tab) {
        case BrowseTab.MANGA_SOURCES:
        case BrowseTab.MANGA_EXTENSIONS:
        case BrowseTab.LIGHT_NOVEL_SOURCES:
        case BrowseTab.LIGHT_NOVEL_EXTENSIONS:
        case BrowseTab.MIGRATE:
            return params.tab;
        case BrowseTab.EXTENSIONS:
            return isLightNovel ? BrowseTab.LIGHT_NOVEL_EXTENSIONS : BrowseTab.MANGA_EXTENSIONS;
        default:
            return isLightNovel ? BrowseTab.LIGHT_NOVEL_SOURCES : BrowseTab.MANGA_SOURCES;
    }
}
