/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import MangaGrid, { IMangaGridProps } from 'components/MangaGrid';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import { StringParam, useQueryParam } from 'use-query-params';

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
    const [query] = useQueryParam('query', StringParam);

    const { options: { downloaded, unread } } = useLibraryOptionsContext();
    return mangas
        .filter((manga) => downloadedFilter(downloaded, manga)
        && unreadFilter(unread, manga)
        && queryFilter(query, manga));
}

function toReadSort(a: IMangaCard, b: IMangaCard): number {
    if (!a.unreadCount) return -1;
    if (!b.unreadCount) return 1;
    return a.unreadCount > b.unreadCount ? 1 : -1;
}

function toSortAlph(a: IMangaCard, b: IMangaCard): number {
    return a.title < b.title ? 1 : -1;
}

function toSortID(a: IMangaCard, b: IMangaCard): number {
    return a.id > b.id ? 1 : -1;
}

function sortManga(mangas: IMangaCard[]): IMangaCard[] {
    const { options: { sorts, sortDesc } } = useLibraryOptionsContext();
    return (sorts === 'sortID' || sorts === undefined) && !sortDesc ? mangas : mangas.sort((a, b) => {
        const c = sortDesc === true ? b : a;
        const d = sortDesc === true ? a : b;
        if (sorts === 'sortToRead') { return toReadSort(c, d); }
        if (sorts === 'sortAlph') { return toSortAlph(c, d); }
        if (sorts === 'sortID' || sorts === undefined) { return toSortID(c, d); }
        return 1;
    });
}

export default function LibraryMangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, hasNextPage, lastPageNum, setLastPageNum, message,
    } = props;

    const [query] = useQueryParam('query', StringParam);
    const { options } = useLibraryOptionsContext();
    const { unread, downloaded } = options;
    const filteredManga = filterManga(mangas);
    const sortedManga = sortManga(filteredManga);
    const DoneManga = sortedManga.map((ele) => {
        // eslint-disable-next-line no-param-reassign
        ele.inLibrary = undefined;
        return ele;
    });
    const showFilteredOutMessage = (unread != null || downloaded != null || query)
        && filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={DoneManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
            gridLayout={options.gridLayout}
        />
    );
}
