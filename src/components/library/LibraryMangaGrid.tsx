/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import MangaGrid from 'components/MangaGrid';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import { StringParam, useQueryParam } from 'use-query-params';
import { useMediaQuery, useTheme } from '@mui/material';
import { IMangaCard, LibrarySortMode, NullAndUndefined } from 'typings';
import { useSearchSettings } from 'util/searchSettings';

const FILTERED_OUT_MESSAGE = 'There are no Manga matching this filter';

const unreadFilter = (unread: NullAndUndefined<boolean>, { unreadCount }: IMangaCard): boolean => {
    switch (unread) {
        case true:
            return !!unreadCount && unreadCount >= 1;
        case false:
            return unreadCount === 0;
        default:
            return true;
    }
};

const downloadedFilter = (downloaded: NullAndUndefined<boolean>, { downloadCount }: IMangaCard): boolean => {
    switch (downloaded) {
        case true:
            return !!downloadCount && downloadCount >= 1;
        case false:
            return downloadCount === 0;
        default:
            return true;
    }
};

const queryFilter = (query: NullAndUndefined<string>, { title }: IMangaCard): boolean => {
    if (!query) return true;
    return title.toLowerCase().includes(query.toLowerCase());
};

const queryGenreFilter = (query: NullAndUndefined<string>, { genre }: IMangaCard): boolean => {
    if (!query) return true;
    const queries = query.split(',').map((str) => str.toLowerCase().trim());
    return queries.every((element) => genre.map((el) => el.toLowerCase()).includes(element));
};

const filterManga = (
    mangas: IMangaCard[],
    query: NullAndUndefined<string>,
    unread: NullAndUndefined<boolean>,
    downloaded: NullAndUndefined<boolean>,
    ignoreFilters: boolean,
): IMangaCard[] =>
    mangas.filter(
        (manga) =>
            (queryFilter(query, manga) || queryGenreFilter(query, manga)) &&
            (ignoreFilters || (downloadedFilter(downloaded, manga) && unreadFilter(unread, manga))),
    );

const sortByUnread = (a: IMangaCard, b: IMangaCard): number =>
    // eslint-disable-next-line implicit-arrow-linebreak
    (a.unreadCount ?? 0) - (b.unreadCount ?? 0);

const sortByTitle = (a: IMangaCard, b: IMangaCard): number => a.title.localeCompare(b.title);

const sortByDateAdded = (a: IMangaCard, b: IMangaCard): number => a.inLibraryAt - b.inLibraryAt;

const sortByLastRead = (a: IMangaCard, b: IMangaCard): number => b.lastReadAt - a.lastReadAt;

const sortManga = (
    manga: IMangaCard[],
    sort: NullAndUndefined<LibrarySortMode>,
    desc: NullAndUndefined<boolean>,
): IMangaCard[] => {
    const result = [...manga];

    switch (sort) {
        case 'sortAlph':
            result.sort(sortByTitle);
            break;
        case 'sortDateAdded':
            result.sort(sortByDateAdded);
            break;
        case 'sortToRead':
            result.sort(sortByUnread);
            break;
        case 'sortLastRead':
            result.sort(sortByLastRead);
            break;
        default:
            break;
    }

    if (desc === true) {
        result.reverse();
    }

    return result;
};

interface LibraryMangaGridProps {
    mangas: IMangaCard[];
    isLoading: boolean;
    message?: string;
}

const LibraryMangaGrid: React.FC<LibraryMangaGridProps & { lastLibraryUpdate: number }> = ({
    mangas,
    isLoading,
    message,
    lastLibraryUpdate,
}) => {
    const [query] = useQueryParam('query', StringParam);
    const { options } = useLibraryOptionsContext();
    const { unread, downloaded } = options;
    const [filteredPaginatedMangas, setFilteredPaginatedMangas] = useState<IMangaCard[]>([]);
    const [sortedManga, setSortedManga] = useState<IMangaCard[]>([]);
    const [filteredManga, setFilteredManga] = useState<IMangaCard[]>([]);
    const totalPages = (mangas ?? []).length / 10;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));
    const defaultPageNumber = isLargeScreen ? 4 : 1;
    const [lastPageNum, setLastPageNum] = useState<number>(defaultPageNumber);
    const { settings } = useSearchSettings();

    useEffect(() => {
        setFilteredManga(filterManga(mangas, query, unread, downloaded, settings.ignoreFilters));
        setLastPageNum(defaultPageNumber);
        window.scrollTo(0, 0);
    }, [mangas, query, unread, downloaded, settings.ignoreFilters]);

    useEffect(() => {
        setSortedManga(sortManga(filteredManga, options.sorts, options.sortDesc));
    }, [filteredManga, lastLibraryUpdate, options.sorts, options.sortDesc]);

    useEffect(() => {
        setFilteredPaginatedMangas((sortedManga ?? []).slice(0, lastPageNum * 10));
    }, [lastPageNum, sortedManga]);

    const showFilteredOutMessage =
        (unread != null || downloaded != null || query) && filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredPaginatedMangas}
            isLoading={isLoading}
            hasNextPage={lastPageNum < totalPages}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
            gridLayout={options.gridLayout}
        />
    );
};

export default LibraryMangaGrid;
