/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import MangaGrid, { IMangaGridProps } from 'components/MangaGrid';
import useLibraryOptions from 'util/useLibraryOptions';

const FILTERED_OUT_MESSAGE = 'There are no Manga matching this filter';

function unreadFilter(unread: NullAndUndefined<boolean>, { unreadCount }: IMangaCard): boolean {
    switch (unread) {
        case true:
            return !!unreadCount && unreadCount >= 1;
        case false:
            return unreadCount === 0;
        default:
            return true;
    }
}

function downloadedFilter(downloaded: NullAndUndefined<boolean>,
    { downloadCount }: IMangaCard): boolean {
    switch (downloaded) {
        case true:
            return !!downloadCount && downloadCount >= 1;
        case false:
            return downloadCount === 0;
        default:
            return true;
    }
}

function queryFilter(query: NullAndUndefined<string>, { title }: IMangaCard): boolean {
    if (!query) return true;
    return title.toLowerCase().includes(query.toLowerCase());
}

function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    const { downloaded, unread, query } = useLibraryOptions();
    return mangas
        .filter((manga) => downloadedFilter(downloaded, manga)
        && unreadFilter(unread, manga)
        && queryFilter(query, manga));
}

export default function LibraryMangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, hasNextPage, lastPageNum, setLastPageNum, message,
    } = props;

    const { active, query } = useLibraryOptions();
    const filteredManga = filterManga(mangas);
    const showFilteredOutMessage = (active || query)
        && filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
        />
    );
}
