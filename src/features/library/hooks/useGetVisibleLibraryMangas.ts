/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StringParam, useQueryParam } from 'use-query-params';
import { useMemo } from 'react';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import type { ChapterType, MangaType, TrackRecordType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { enhancedCleanup } from '@/base/utils/Strings.ts';
import { getFuzzyScore, MAX_FUZZY_SCORE } from '@/base/utils/FuzzySearch.ts';
import { useGetCategoryMetadata } from '@/features/category/services/CategoryMetadata.ts';
import type { LibraryOptions, LibrarySortMode } from '@/features/library/Library.types.ts';
import { FilterMode } from '@/features/library/Library.types.ts';
import type { CategoryIdInfo, CategoryMetadataInfo } from '@/features/category/Category.types.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaChapterCountInfo,
    MangaDescriptionInfo,
    MangaDownloadInfo,
    MangaGenreInfo,
    MangaIdInfo,
    MangaInLibraryInfo,
    MangaSourceIdInfo,
    MangaSourceNameInfo,
    MangaStatusInfo,
    MangaTitleInfo,
    MangaUnreadInfo,
} from '@/features/manga/Manga.types.ts';
import { SearchParam } from '@/base/Base.types.ts';
import { Sources } from '@/features/source/services/Sources';
import pickBy from 'lodash/fp/pickBy';
import { CustomCache } from '@/lib/storage/CustomCache.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import isEqual from 'lodash/fp/isEqual';
import partition from 'lodash/fp/partition';

const triStateFilter = (
    triState: NullAndUndefined<boolean>,
    enabledFilter: () => boolean,
    disabledFilter: () => boolean,
): boolean => {
    switch (triState) {
        case true:
            return enabledFilter();
        case false:
            return disabledFilter();
        default:
            return true;
    }
};

const triStateFilterNumber = (triState: NullAndUndefined<boolean>, count?: number): boolean =>
    triStateFilter(
        triState,
        () => !!count && count >= 1,
        () => count === 0,
    );

const triStateFilterBoolean = (triState: NullAndUndefined<boolean>, status?: boolean): boolean =>
    triStateFilter(
        triState,
        () => !!status,
        () => !status,
    );

const performSearch = (
    queries: NullAndUndefined<string>[] | undefined,
    strings: NullAndUndefined<string>[],
): boolean => {
    const actualQueries = queries?.filter((query) => query != null);
    const actualStrings = strings?.filter((str) => str != null);

    if (!actualQueries?.length) {
        return true;
    }

    const cleanedUpQueries = actualQueries.map(enhancedCleanup);
    const cleanedUpStrings = actualStrings.map(enhancedCleanup).join(', ');

    return cleanedUpQueries.every((query) => cleanedUpStrings.includes(query));
};

/**
 * Scores a search against a set of texts. Every query has to match at least one of the texts, and the result is the
 * average of how well each query matched its best text, which keeps the "all genres of a comma separated query have to
 * be present" behaviour of {@link performSearch} while still scoring each text on its own.
 */
/**
 * A query normalized once per search instead of once per manga and field, which is what the contract of
 * {@link getFuzzyScore} asks for and what keeps a search from re-running a Unicode normalization tens of thousands of
 * times over a large library.
 */
type SearchQuery = {
    /** as typed, for the fields that are still matched as a plain substring */
    query: string;
    cleanedUpQuery: string;
    /** the comma separated parts, all of which have to match for a query like "action, romance" */
    cleanedUpQueryParts: string[];
};

const toSearchQuery = (query: string): SearchQuery => ({
    query,
    cleanedUpQuery: enhancedCleanup(query),
    cleanedUpQueryParts: query.split(',').map(enhancedCleanup),
});

/** Scores an already normalized query against a single text. */
const getFieldScore = (cleanedUpQuery: string, text: NullAndUndefined<string>): number | null =>
    text == null ? null : getFuzzyScore(cleanedUpQuery, enhancedCleanup(text));

/**
 * Scores a search against a set of texts. Every part of the query has to match at least one of them, and the result is
 * the average of how well each part matched its best text, which keeps the "all genres of a comma separated query have
 * to be present" behaviour of {@link performSearch} while still scoring each text on its own.
 */
const performFuzzySearch = (cleanedUpQueryParts: string[], strings: NullAndUndefined<string>[]): number | null => {
    let queryCount = 0;
    let totalScore = 0;

    for (const cleanedUpQueryPart of cleanedUpQueryParts) {
        // an empty part, e.g. from the trailing comma of "action,", matches everything and therefore says nothing -
        // counting it would raise the average and make the trailing comma look like the better match
        if (!cleanedUpQueryPart) {
            continue;
        }

        queryCount++;

        let bestScore: number | null = null;
        for (const str of strings) {
            const score = getFieldScore(cleanedUpQueryPart, str);

            if (score !== null && (bestScore === null || score > bestScore)) {
                bestScore = score;
            }
        }

        if (bestScore === null) {
            return null;
        }

        totalScore += bestScore;
    }

    if (!queryCount) {
        return MAX_FUZZY_SCORE;
    }

    return totalScore / queryCount;
};

/**
 * How much a match in a given field says about what the user was actually looking for. Searching the library is almost
 * always searching for a title, so of two equally good matches the one in the title wins.
 *
 * The weights only order matches of comparable quality: an exact hit in a lesser field does outrank a title that only
 * matched after correcting a typo, the same way a search engine prefers what it is certain about. The description is
 * the one exception, weighted so that it always loses against a title match of any quality, because it is matched as a
 * plain substring and a long text contains a short query by coincidence far too easily.
 */
const FIELD_WEIGHT = {
    title: 1,
    genre: 0.85,
    author: 0.8,
    artist: 0.8,
    source: 0.7,
    description: 0.34,
} as const;

/** The best a manga can score without matching in its title, used to stop looking once the title beats it. */
const MAX_NON_TITLE_WEIGHT = FIELD_WEIGHT.genre;

const weigh = (score: number | null, weight: number): number | null => (score === null ? null : score * weight);

type TMangaQueryFilter = MangaTitleInfo &
    MangaGenreInfo &
    MangaDescriptionInfo &
    MangaArtistInfo &
    MangaAuthorInfo &
    MangaSourceIdInfo &
    MangaSourceNameInfo;
const querySearchManga = (
    query: NullAndUndefined<string>,
    { title, genre: genres, description, artist, author, source, sourceId }: TMangaQueryFilter,
): boolean =>
    performSearch([query], [title]) ||
    performSearch(
        query?.split(','),
        genres.map((genre) => enhancedCleanup(genre)),
    ) ||
    performSearch([query], [description]) ||
    performSearch([query], [artist]) ||
    performSearch([query], [author]) ||
    performSearch([query], [source?.displayName]) ||
    performSearch([query], [sourceId]);

/**
 * The typo tolerant counterpart of {@link querySearchManga}, returning how relevant the manga is for the query, or null
 * when it does not match at all.
 *
 * The description is deliberately left on an exact substring match: it is by far the longest field, and matching it
 * fuzzily would both dominate the runtime of a search and match almost every manga in the library.
 */
const querySearchMangaScore = (
    { query, cleanedUpQuery, cleanedUpQueryParts }: SearchQuery,
    { title, genre: genres, description, artist, author, source, sourceId }: TMangaQueryFilter,
): number | null => {
    if (!cleanedUpQuery) {
        return MAX_FUZZY_SCORE;
    }

    const titleScore = weigh(getFieldScore(cleanedUpQuery, title), FIELD_WEIGHT.title);

    // no other field can beat this anymore, and the remaining ones are the expensive part of a search
    if (titleScore !== null && titleScore >= MAX_NON_TITLE_WEIGHT) {
        return titleScore;
    }

    let best = titleScore;
    const considerScore = (score: number | null) => {
        if (score !== null && (best === null || score > best)) {
            best = score;
        }
    };

    considerScore(weigh(performFuzzySearch(cleanedUpQueryParts, genres), FIELD_WEIGHT.genre));
    considerScore(weigh(getFieldScore(cleanedUpQuery, author), FIELD_WEIGHT.author));
    considerScore(weigh(getFieldScore(cleanedUpQuery, artist), FIELD_WEIGHT.artist));
    considerScore(weigh(getFieldScore(cleanedUpQuery, source?.displayName), FIELD_WEIGHT.source));
    considerScore(weigh(getFieldScore(cleanedUpQuery, sourceId), FIELD_WEIGHT.source));
    considerScore(performSearch([query], [description]) ? FIELD_WEIGHT.description : null);

    return best;
};

const listTriStateBooleanFilter = (
    mode: FilterMode,
    filters: Record<string, NullAndUndefined<boolean>>,
    getStatus: (key: string) => boolean,
): boolean => {
    const [includedFilters, excludedFilters] = partition(
        ([_key, filterState]) => !!filterState,
        Object.entries(filters),
    );

    const includedFilterStates = includedFilters.map(([key, filterState]) =>
        triStateFilterBoolean(filterState, getStatus(key)),
    );
    const hasIncludedFilter =
        !includedFilters.length ||
        (mode === 'OR' ? includedFilterStates.some(Boolean) : includedFilterStates.every(Boolean));
    const hasExcludedFilter =
        !!excludedFilters.length &&
        excludedFilters
            .map(([key, filterState]) => triStateFilterBoolean(filterState, getStatus(key)))
            .some((state) => !state);

    return hasIncludedFilter && !hasExcludedFilter;
};

type TMangaTrackerFilter = { trackRecords: { nodes: Pick<TrackRecordType, 'id' | 'trackerId'>[] } };
const trackerFilter = (trackFilter: LibraryOptions['hasTrackerBinding'], manga: TMangaTrackerFilter): boolean =>
    listTriStateBooleanFilter(trackFilter.mode, trackFilter.filters, (trackFilterId) =>
        manga.trackRecords.nodes.some((trackRecord) => trackRecord.trackerId === Number(trackFilterId)),
    );

const statusFilter = (statusFilters: LibraryOptions['hasStatus'], manga: MangaStatusInfo): boolean =>
    listTriStateBooleanFilter(FilterMode.OR, statusFilters, (status) => status === manga.status);

const sourceFilter = (sourceFilters: LibraryOptions['hasSource'], manga: MangaSourceIdInfo): boolean =>
    listTriStateBooleanFilter(FilterMode.OR, sourceFilters, (sourceId) => sourceId === manga.sourceId);

type TMangaFilterOptions = Pick<
    LibraryOptions,
    | 'hasUnreadChapters'
    | 'hasReadChapters'
    | 'hasDownloadedChapters'
    | 'hasBookmarkedChapters'
    | 'hasDuplicateChapters'
    | 'hasTrackerBinding'
    | 'hasStatus'
    | 'hasSource'
>;
type TMangaFilter = Pick<MangaType, 'bookmarkCount' | 'hasDuplicateChapters'> &
    TMangaTrackerFilter &
    MangaStatusInfo &
    MangaSourceIdInfo &
    MangaChapterCountInfo &
    MangaDownloadInfo &
    MangaUnreadInfo;
const filterManga = (
    manga: TMangaFilter,
    {
        hasDownloadedChapters,
        hasUnreadChapters,
        hasReadChapters,
        hasBookmarkedChapters,
        hasDuplicateChapters,
        hasTrackerBinding,
        hasStatus,
        hasSource,
    }: TMangaFilterOptions,
): boolean =>
    triStateFilterNumber(hasDownloadedChapters, manga.downloadCount) &&
    triStateFilterNumber(hasUnreadChapters, manga.unreadCount) &&
    triStateFilterNumber(hasReadChapters, manga.chapters.totalCount - manga.unreadCount) &&
    triStateFilterNumber(hasBookmarkedChapters, manga.bookmarkCount) &&
    triStateFilterBoolean(hasDuplicateChapters, manga.hasDuplicateChapters) &&
    trackerFilter(hasTrackerBinding, manga) &&
    statusFilter(hasStatus, manga) &&
    sourceFilter(hasSource, manga);

type TMangasFilter = TMangaQueryFilter & TMangaFilter;
const filterMangas = <Manga extends TMangasFilter>(
    mangas: Manga[],
    query: NullAndUndefined<string>,
    options: TMangaFilterOptions & { ignoreFilters: boolean; fuzzySearch: boolean },
): Manga[] => {
    const ignoreFiltersWhileSearching = options.ignoreFilters && query?.length;

    // without a query every manga is equally relevant, so scoring them would only allocate a wrapper per manga of the
    // whole library to then sort by a constant - which is the state the library is in whenever it is merely browsed
    if (!options.fuzzySearch || !query?.length) {
        return mangas.filter((manga) => {
            const matchesSearch = querySearchManga(query, manga);
            const matchesFilters = ignoreFiltersWhileSearching || filterManga(manga, options);

            return matchesSearch && matchesFilters;
        });
    }

    const searchQuery = toSearchQuery(query);

    const matches: { manga: Manga; score: number }[] = [];
    mangas.forEach((manga) => {
        const matchesFilters = ignoreFiltersWhileSearching || filterManga(manga, options);

        if (!matchesFilters) {
            return;
        }

        const score = querySearchMangaScore(searchQuery, manga);

        if (score === null) {
            return;
        }

        matches.push({ manga, score });
    });

    // a fuzzy match is only useful when the closest matches come first - mangas of equal relevance keep the sorting
    // configured for the library, since "Array#sort" is stable
    matches.sort((a, b) => b.score - a.score);

    return matches.map(({ manga }) => manga);
};

const sortByNumber = (a: number | string = 0, b: number | string = 0) => Number(a) - Number(b);

const sortByString = (a: string, b: string): number => a.localeCompare(b, undefined, { sensitivity: 'base' });

const sortByRandom = () => Math.floor(Math.random() * 3 - 1);

type TMangaSort = MangaTitleInfo &
    MangaInLibraryInfo &
    MangaUnreadInfo &
    MangaChapterCountInfo & {
        lastReadChapter?: Pick<ChapterType, 'lastReadAt'> | null;
        latestUploadedChapter?: Pick<ChapterType, 'uploadDate'> | null;
        latestFetchedChapter?: Pick<ChapterType, 'fetchedAt'> | null;
    };
const sortManga = <Manga extends TMangaSort>(
    manga: Manga[],
    sort: NullAndUndefined<LibrarySortMode>,
    desc: NullAndUndefined<boolean>,
): Manga[] => {
    const result = [...manga];

    const primaryComparator = ((): ((a: Manga, b: Manga) => number) => {
        switch (sort) {
            case 'alphabetically':
                return (a, b) => sortByString(a.title, b.title);
            case 'dateAdded':
                return (a, b) => sortByNumber(a.inLibraryAt, b.inLibraryAt);
            case 'unreadChapters':
                return (a, b) => sortByNumber(a.unreadCount, b.unreadCount);
            case 'lastRead':
                return (a, b) => sortByNumber(a.lastReadChapter?.lastReadAt, b.lastReadChapter?.lastReadAt);
            case 'latestUploadedChapter':
                return (a, b) => sortByNumber(a.latestUploadedChapter?.uploadDate, b.latestUploadedChapter?.uploadDate);
            case 'latestFetchedChapter':
                return (a, b) => sortByNumber(a.latestFetchedChapter?.fetchedAt, b.latestFetchedChapter?.fetchedAt);
            case 'totalChapters':
                return (a, b) => sortByNumber(a.chapters.totalCount, b.chapters.totalCount);
            case 'random':
                return () => sortByRandom();
            default:
                return () => 0;
        }
    })();

    result.sort((a, b) => {
        const cmp = primaryComparator(a, b);
        if (cmp !== 0) {
            if (desc) {
                return -cmp;
            }
            return cmp;
        }

        return sortByString(a.title, b.title);
    });

    return result;
};

const SORT_CACHE = new CustomCache();
type SortOptions = Pick<LibraryOptions, 'sortBy' | 'sortDesc'>;
const useSortedMangas = <Manga extends MangaIdInfo & TMangasFilter & TMangaSort>(
    categoryId: number | undefined,
    mangas: Manga[],
    options: SortOptions,
): Manga[] => {
    const CACHE_MANGAS_KEY = `library-category-${categoryId}-mangas`;
    const CACHE_MANGA_IDS_KEY = `library-category-${categoryId}-manga-ids`;
    const CACHE_MANGAS_SORTED_KEY = `library-category-${categoryId}-mangas-sorted`;
    const CACHE_SORT_OPTIONS_KEY = `library-category-${categoryId}-sort-options`;

    const mangaIds = useMemo(() => Mangas.getIds(mangas), [mangas]);

    const cachedMangas = SORT_CACHE.getResponseFor<Manga[]>(CACHE_MANGAS_KEY, undefined);
    const cachedMangaIds = SORT_CACHE.getResponseFor<MangaIdInfo['id'][]>(CACHE_MANGA_IDS_KEY, undefined);
    const cachedSortOptions = SORT_CACHE.getResponseFor<SortOptions>(CACHE_SORT_OPTIONS_KEY, undefined);

    const previousSortBy = cachedSortOptions?.sortBy;
    const previousSortDesc = cachedSortOptions?.sortDesc;

    const haveMangasChanged = !isEqual(mangas, cachedMangas);
    const haveMangaIdsChanged = !isEqual(mangaIds, cachedMangaIds);
    const haveSortOptionsChanged = previousSortBy !== options.sortBy || previousSortDesc !== options.sortDesc;
    const reapplySorting = haveMangaIdsChanged || haveSortOptionsChanged;

    const sortedMangas = (() => {
        if (reapplySorting) {
            const { sortBy, sortDesc } = options;

            SORT_CACHE.cacheResponse(CACHE_SORT_OPTIONS_KEY, undefined, { sortBy, sortDesc });

            return sortManga(mangas, sortBy, sortDesc);
        }

        return SORT_CACHE.getResponseFor<Manga[]>(CACHE_MANGAS_SORTED_KEY, undefined) ?? STABLE_EMPTY_ARRAY;
    })();

    const sortedMangasUpdatedReferences = useMemo(() => {
        if (haveMangasChanged) {
            return sortedMangas.map((sortedManga) => mangas.find((manga) => manga.id === sortedManga.id)!);
        }

        return sortedMangas;
    }, [haveMangasChanged, sortedMangas, mangas]);

    SORT_CACHE.cacheResponse(CACHE_MANGAS_KEY, undefined, mangas);
    SORT_CACHE.cacheResponse(CACHE_MANGA_IDS_KEY, undefined, mangaIds);
    SORT_CACHE.cacheResponse(CACHE_MANGAS_SORTED_KEY, undefined, sortedMangasUpdatedReferences);

    return sortedMangasUpdatedReferences;
};

const DEFAULT_CATEGORY: CategoryIdInfo = { id: -1 };
export const useGetVisibleLibraryMangas = <Manga extends MangaIdInfo & TMangasFilter & TMangaSort>(
    mangas: Manga[],
    category?: CategoryMetadataInfo,
): {
    visibleMangas: Manga[];
    showFilteredOutMessage: boolean;
    filterKey: string;
} => {
    const [query] = useQueryParam(SearchParam.QUERY, StringParam);
    const { hasSource: hasSourceFilter, ...options } = useGetCategoryMetadata(category ?? DEFAULT_CATEGORY);
    const {
        hasUnreadChapters,
        hasReadChapters,
        hasDownloadedChapters,
        hasBookmarkedChapters,
        hasTrackerBinding,
        hasDuplicateChapters,
        hasStatus,
    } = options;
    const { settings } = useMetadataServerSettings();
    const { sources } = Sources.useGetMigratableSources();

    const hasSource = useMemo(
        () => pickBy((_state, sourceId) => sources.some((source) => source.id === sourceId), hasSourceFilter),
        [hasSourceFilter, sources],
    );

    const sortedMangas = useSortedMangas(category?.id, mangas, options);

    const filteredMangas = useMemo(
        () =>
            filterMangas(sortedMangas, query, {
                ...options,
                hasSource,
                ignoreFilters: settings.ignoreFilters,
                fuzzySearch: settings.fuzzySearch,
            }),
        [
            sortedMangas,
            query,
            hasUnreadChapters,
            hasReadChapters,
            hasDownloadedChapters,
            hasBookmarkedChapters,
            hasTrackerBinding,
            hasDuplicateChapters,
            hasStatus,
            hasSource,
            settings.ignoreFilters,
            settings.fuzzySearch,
        ],
    );

    const isATrackFilterActive = Object.values(hasTrackerBinding).some((trackFilterState) => trackFilterState != null);
    const isASourceFilterActive = Object.values(hasSource).some((sourceFilterState) => sourceFilterState != null);
    const showFilteredOutMessage =
        (hasUnreadChapters != null ||
            hasReadChapters != null ||
            hasDownloadedChapters != null ||
            hasBookmarkedChapters != null ||
            !!query ||
            isATrackFilterActive ||
            isASourceFilterActive) &&
        filteredMangas.length === 0 &&
        mangas.length > 0;

    return {
        visibleMangas: filteredMangas,
        showFilteredOutMessage,
        filterKey: `${JSON.stringify(options)}${settings.ignoreFilters}${settings.fuzzySearch}`,
    };
};
