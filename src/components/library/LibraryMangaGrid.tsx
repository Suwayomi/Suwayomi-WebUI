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
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';

const FILTERED_OUT_MESSAGE = 'There are no Manga matching this filter';

/**
 * If the unread parameter is true, then return true if the unreadCount is greater than or equal to 1.
 * If the unread parameter is false, then return true if the unreadCount is equal to 0. Otherwise,
 * return true
 * @param unread - NullAndUndefined<boolean>
 * @param {IMangaCard}  - unread: A boolean value that indicates whether to filter by unread manga or
 * not.
 * @returns A boolean value.
 */
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

/**
 * If the manga is downloaded,
 * it will return true if the download count is greater than or equal to 1.
 * If the manga is not downloaded, it will return true if the download count is 0.
 * Otherwise, it will return true
 * @param downloaded - A boolean value that determines whether to filter by downloaded or not.
 * @param {IMangaCard}  - `downloaded`: A boolean value that determines whether to filter by downloaded
 * or not.
 * @returns A boolean value.
 */
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

/**
 * It takes a query string and a manga card and returns a boolean.
 * @param query - The query string that the user has entered.
 * @param {IMangaCard}  - `query`: The query string to filter by.
 * @returns A boolean value.
 */
function queryFilter(query: NullAndUndefined<string>, { title }: IMangaCard): boolean {
    if (!query) return true;
    return title.toLowerCase().includes(query.toLowerCase());
}

/**
 * It filters the mangas based on the options in the library.
 * @param {IMangaCard[]} mangas - The list of mangas to filter.
 * @returns A filtered array of mangas.
 */
function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    const { downloaded, unread, query } = useLibraryOptions();
    return mangas
        .filter((manga) => downloadedFilter(downloaded, manga)
        && unreadFilter(unread, manga)
        && queryFilter(query, manga));
}

/**
 * It sorts the manga cards by the number of unread chapters.
 * @param {IMangaCard} a - IMangaCard
 * @param {IMangaCard} b - IMangaCard
 * @returns A function that takes two arguments and returns a number.
 */
function toReadSort(a: IMangaCard, b: IMangaCard): number {
    if (!a.unreadCount) return -1;
    if (!b.unreadCount) return 1;
    return a.unreadCount > b.unreadCount ? 1 : -1;
}

/**
 * It sorts the array of manga cards by the title of the manga card.
 * @param {IMangaCard} a - IMangaCard, b: IMangaCard
 * @param {IMangaCard} b - IMangaCard
 * @returns A function that takes two arguments and returns a number.
 */
function toSortAlph(a: IMangaCard, b: IMangaCard): number {
    return a.title < b.title ? 1 : -1;
}

/**
 * It sorts the array of manga cards by id.
 * @param {IMangaCard} a - IMangaCard, b: IMangaCard
 * @param {IMangaCard} b - IMangaCard
 * @returns A function that takes two arguments and returns a number.
 */
function toSortID(a: IMangaCard, b: IMangaCard): number {
    return a.id > b.id ? 1 : -1;
}

/**
 * It sorts the mangas based on the sort options.
 * @param {IMangaCard[]} mangas - the array of manga cards to sort
 * @returns A function that takes in an array of manga cards and returns an array of manga cards.
 */
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

/**
 * This function is responsible for rendering the manga grid
 * @param {IMangaGridProps} props - IMangaGridProps
 * @returns A grid of mangas.
 */
export default function LibraryMangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, hasNextPage, lastPageNum, setLastPageNum, message,
    } = props;

    const { options } = useLibraryOptionsContext();
    const { active, query } = useLibraryOptions();
    const filteredManga = filterManga(mangas);
    const sortedManga = sortManga(filteredManga);
    const DoneManga = sortedManga.map((ele) => {
        // eslint-disable-next-line no-param-reassign
        ele.inLibrary = undefined;
        return ele;
    });
    const showFilteredOutMessage = (active || query)
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
