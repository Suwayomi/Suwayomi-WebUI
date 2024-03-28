/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StringParam, useQueryParam } from 'use-query-params';
import { useMemo } from 'react';
import { LibraryOptions, LibrarySortMode, NullAndUndefined, TManga } from '@/typings.ts';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext.tsx';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { Trackers } from '@/lib/data/Trackers.ts';

const unreadFilter = (unread: NullAndUndefined<boolean>, { unreadCount }: TManga): boolean => {
    switch (unread) {
        case true:
            return !!unreadCount && unreadCount >= 1;
        case false:
            return unreadCount === 0;
        default:
            return true;
    }
};

const downloadedFilter = (downloaded: NullAndUndefined<boolean>, { downloadCount }: TManga): boolean => {
    switch (downloaded) {
        case true:
            return !!downloadCount && downloadCount >= 1;
        case false:
            return downloadCount === 0;
        default:
            return true;
    }
};

const queryFilter = (query: NullAndUndefined<string>, { title }: TManga): boolean => {
    if (!query) return true;
    return title.toLowerCase().includes(query.toLowerCase());
};

const queryGenreFilter = (query: NullAndUndefined<string>, { genre }: TManga): boolean => {
    if (!query) return true;
    const queries = query.split(',').map((str) => str.toLowerCase().trim());
    return queries.every((element) => genre.map((el) => el.toLowerCase()).includes(element));
};

const trackerFilter = (trackFilters: LibraryOptions['tracker'], manga: TManga): boolean =>
    Object.entries(trackFilters)
        .map(([trackFilterId, trackFilterState]) => {
            const mangaTrackers = Trackers.getTrackers(manga.trackRecords.nodes);
            const isTrackerBound = mangaTrackers.some((tracker) => tracker.id === Number(trackFilterId));

            switch (trackFilterState) {
                case true:
                    return isTrackerBound;
                case false:
                    return !isTrackerBound;
                default:
                    return true;
            }
        })
        .every((matchesFilter) => matchesFilter);

const filterManga = (
    mangas: TManga[],
    query: NullAndUndefined<string>,
    unread: NullAndUndefined<boolean>,
    downloaded: NullAndUndefined<boolean>,
    tracker: LibraryOptions['tracker'],
    ignoreFilters: boolean,
): TManga[] =>
    mangas.filter((manga) => {
        const ignoreFiltersWhileSearching = ignoreFilters && query?.length;
        const matchesSearch = queryFilter(query, manga) || queryGenreFilter(query, manga);
        const matchesFilters =
            ignoreFiltersWhileSearching ||
            (downloadedFilter(downloaded, manga) && unreadFilter(unread, manga) && trackerFilter(tracker, manga));

        return matchesSearch && matchesFilters;
    });

const sortByUnread = (a: TManga, b: TManga): number => (a.unreadCount ?? 0) - (b.unreadCount ?? 0);

const sortByTitle = (a: TManga, b: TManga): number => a.title.localeCompare(b.title);

const sortByDateAdded = (a: TManga, b: TManga): number => Number(a.inLibraryAt) - Number(b.inLibraryAt);

const sortByLastRead = (a: TManga, b: TManga): number =>
    Number(b.lastReadChapter?.lastReadAt ?? 0) - Number(a.lastReadChapter?.lastReadAt ?? 0);

const sortByLatestUploadedChapter = (a: TManga, b: TManga): number =>
    Number(a.latestUploadedChapter?.fetchedAt ?? 0) - Number(b.latestUploadedChapter?.fetchedAt ?? 0);

const sortByLatestFetchedChapter = (a: TManga, b: TManga): number =>
    Number(a.latestFetchedChapter?.fetchedAt ?? 0) - Number(b.latestFetchedChapter?.fetchedAt ?? 0);

const sortManga = (
    manga: TManga[],
    sort: NullAndUndefined<LibrarySortMode>,
    desc: NullAndUndefined<boolean>,
): TManga[] => {
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
        case 'sortLatestUploadedChapter':
            result.sort(sortByLatestUploadedChapter);
            break;
        case 'sortLatestFetchedChapter':
            result.sort(sortByLatestFetchedChapter);
            break;
        default:
            break;
    }

    if (desc === true) {
        result.reverse();
    }

    return result;
};

export const useGetVisibleLibraryMangas = (mangas: TManga[]) => {
    const [query] = useQueryParam('query', StringParam);
    const { options } = useLibraryOptionsContext();
    const { unread, downloaded, tracker } = options;
    const { settings } = useMetadataServerSettings();

    const filteredMangas = useMemo(
        () => filterManga(mangas, query, unread, downloaded, tracker, settings.ignoreFilters),
        [mangas, query, unread, downloaded, tracker, settings.ignoreFilters],
    );
    const sortedMangas = useMemo(
        () => sortManga(filteredMangas, options.sorts, options.sortDesc),
        [filteredMangas, options.sorts, options.sortDesc],
    );

    const showFilteredOutMessage =
        (unread != null || downloaded != null || !!query) && filteredMangas.length === 0 && mangas.length > 0;

    return {
        visibleMangas: sortedMangas,
        showFilteredOutMessage,
    };
};
