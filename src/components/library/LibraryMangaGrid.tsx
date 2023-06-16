/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { IMangaCard, LibrarySortMode, NullAndUndefined } from '@/typings';
import { useSearchSettings } from '@/util/searchSettings';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import MangaGrid from '@/components/MangaGrid';

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
    mangas.filter((manga) => {
        const ignoreFiltersWhileSearching = ignoreFilters && query?.length;
        const matchesSearch = queryFilter(query, manga) || queryGenreFilter(query, manga);
        const matchesFilters =
            ignoreFiltersWhileSearching || (downloadedFilter(downloaded, manga) && unreadFilter(unread, manga));

        return matchesSearch && matchesFilters;
    });

const sortByUnread = (a: IMangaCard, b: IMangaCard): number => (a.unreadCount ?? 0) - (b.unreadCount ?? 0);

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
    const { t } = useTranslation();

    const [query] = useQueryParam('query', StringParam);
    const { options } = useLibraryOptionsContext();
    const { unread, downloaded } = options;
    const { settings } = useSearchSettings();

    const filteredMangas = useMemo(
        () => filterManga(mangas, query, unread, downloaded, settings.ignoreFilters),
        [mangas, query, unread, downloaded, settings.ignoreFilters],
    );
    const sortedMangas = useMemo(
        () => sortManga(filteredMangas, options.sorts, options.sortDesc),
        [filteredMangas, lastLibraryUpdate, options.sorts, options.sortDesc],
    );

    const showFilteredOutMessage =
        (unread != null || downloaded != null || query) && filteredMangas.length === 0 && mangas.length > 0;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [filteredMangas]);

    return (
        <MangaGrid
            mangas={sortedMangas}
            isLoading={isLoading}
            hasNextPage={false}
            loadMore={() => undefined}
            message={showFilteredOutMessage ? t('library.error.label.no_matches') : message}
            gridLayout={options.gridLayout}
        />
    );
};

export default LibraryMangaGrid;
