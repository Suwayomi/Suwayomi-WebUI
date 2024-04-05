/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import {
    ChapterListOptions,
    ChapterOptionsReducerAction,
    ChapterSortMode,
    NullAndUndefined,
    TChapter,
    TranslationKey,
} from '@/typings.ts';
import { useReducerLocalStorage } from '@/util/useLocalStorage.tsx';
import { getPartialList } from '@/components/util/getPartialList';
import { Chapters } from '@/lib/data/Chapters.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler';

const defaultChapterOptions: ChapterListOptions = {
    active: false,
    unread: undefined,
    downloaded: undefined,
    bookmarked: undefined,
    reverse: false,
    sortBy: 'source',
    showChapterNumber: false,
};

function chapterOptionsReducer(state: ChapterListOptions, actions: ChapterOptionsReducerAction): ChapterListOptions {
    switch (actions.type) {
        case 'filter':
            return {
                ...state,
                active: state.unread !== false && state.downloaded !== false && state.bookmarked !== false,
                [actions.filterType!]: actions.filterValue,
            };
        case 'sortBy':
            return { ...state, sortBy: actions.sortBy };
        case 'sortReverse':
            return { ...state, reverse: !state.reverse };
        case 'showChapterNumber':
            return { ...state, showChapterNumber: !state.showChapterNumber };
        default:
            throw Error(t('global.error.label.invalid_action'));
    }
}

export function unreadFilter(unread: NullAndUndefined<boolean>, { isRead: isChapterRead }: TChapter) {
    switch (unread) {
        case true:
            return !isChapterRead;
        case false:
            return isChapterRead;
        default:
            return true;
    }
}

function downloadFilter(downloaded: NullAndUndefined<boolean>, { isDownloaded: chapterDownload }: TChapter) {
    switch (downloaded) {
        case true:
            return chapterDownload;
        case false:
            return !chapterDownload;
        default:
            return true;
    }
}

function bookmarkedFilter(bookmarked: NullAndUndefined<boolean>, { isBookmarked: chapterBookmarked }: TChapter) {
    switch (bookmarked) {
        case true:
            return chapterBookmarked;
        case false:
            return !chapterBookmarked;
        default:
            return true;
    }
}

export function filterAndSortChapters(chapters: TChapter[], options: ChapterListOptions): TChapter[] {
    const filtered = options.active
        ? chapters.filter(
              (chp) =>
                  unreadFilter(options.unread, chp) &&
                  downloadFilter(options.downloaded, chp) &&
                  bookmarkedFilter(options.bookmarked, chp),
          )
        : [...chapters];
    const Sorted =
        options.sortBy === 'fetchedAt'
            ? filtered.sort((a, b) => Number(a.fetchedAt ?? 0) - Number(b.fetchedAt ?? 0))
            : filtered;
    if (options.reverse) {
        Sorted.reverse();
    }
    return Sorted;
}

export const useChapterOptions = (mangaId: number) =>
    useReducerLocalStorage<ChapterListOptions, ChapterOptionsReducerAction>(
        chapterOptionsReducer,
        `${mangaId}filterOptions`,
        defaultChapterOptions,
    );

export const SORT_OPTIONS: [ChapterSortMode, TranslationKey][] = [
    ['source', 'global.sort.label.by_source'],
    ['fetchedAt', 'global.sort.label.by_fetch_date'],
];

export const isFilterActive = (options: ChapterListOptions) => {
    const { unread, downloaded, bookmarked } = options;
    return unread != null || downloaded != null || bookmarked != null;
};

/**
 * @param chapterId The id of the chapter to be use as a pivot
 * @param allChapters There list of chapters
 * @param includePivotChapter Whether to return the chapter with the passed chapterId in the list
 * @returns The second half of the list. By the default the chapters are sorted
 * in descending order, so it returns the previous chapters, not including the pivot chapter.
 */
export const getPreviousChapters = (
    chapterId: TChapter['id'],
    allChapters: TChapter[],
    includePivotChapter: boolean = false,
): TChapter[] => {
    if (includePivotChapter) {
        return getPartialList(chapterId, allChapters, 'second', 0);
    }
    return getPartialList(chapterId, allChapters, 'second');
};

/**
 * @param chapterId The id of the chapter to be use as a pivot
 * @param allChapters There list of chapters
 * @param includePivotChapter Whether to return the chapter with the passed chapterId in the list
 * @returns The second half of the list. By the default the chapters are sorted
 * in descending order, so it returns the previous chapters, not including the pivot chapter.
 */
export const getNextChapters = (
    chapterId: TChapter['id'],
    allChapters: TChapter[],
    includePivotChapter: boolean = false,
): TChapter[] => {
    if (includePivotChapter) {
        return getPartialList(chapterId, allChapters, 'first');
    }
    return getPartialList(chapterId, allChapters, 'first', 0);
};

/**
 * @description This fucntion takes a chapter Id and set all chapters with index bellow the index of the chapter to that id
 * to read, and the rest of the chapters as unread. Technically setting the chapter with the passed id as the current unread chapter.
 * @param chapterId Chapter Id
 * @param allChapters List of chapters
 */
export const setChapterAsLastRead = (chapterId: TChapter['id'], allChapters: TChapter[]) => {
    const readChapters = getPreviousChapters(chapterId, allChapters, true);
    const unreadChapterId = getNextChapters(chapterId, allChapters).map((chapter) => chapter.id);

    Chapters.markAsRead(readChapters, true).catch(defaultPromiseErrorHandler('ChapterActionMenuItems::performAction'));
    Chapters.markAsUnread(unreadChapterId).catch(defaultPromiseErrorHandler('ChapterActionMenuItems::performAction'));
};
