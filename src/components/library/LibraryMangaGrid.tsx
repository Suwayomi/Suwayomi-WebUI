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

// eslint-disable-next-line max-len
function genreFilter(queryY: NullAndUndefined<any[]>, queryN: NullAndUndefined<any[]>, { genre }: IMangaCard): boolean {
    if (genre && (queryN || queryY)) {
        let ret: boolean = true;
        if (queryN) {
            ret = !queryN.some((v: string) => genre.includes(v));
        }
        if (queryY) {
            ret = ret && queryY.some((v: string) => genre.includes(v));
        }
        return ret;
    }
    return true;
}

function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    const {
        downloaded,
        unread,
        query,
        genreY,
        genreN,
    } = useLibraryOptions();
    return mangas
        .filter((manga) => downloadedFilter(downloaded, manga)
        && unreadFilter(unread, manga)
        && queryFilter(query, manga)
        && genreFilter(genreY, genreN, manga));
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
    const { sorts, sortDesc } = useLibraryOptions();
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

    const { active, query } = useLibraryOptions();
    const filteredManga = filterManga(mangas);
    const sortedManga = sortManga(filteredManga);
    const showFilteredOutMessage = (active || query)
        && filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={sortedManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
        />
    );
}
