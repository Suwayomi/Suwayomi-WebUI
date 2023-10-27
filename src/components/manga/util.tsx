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
} from '@/typings';
import { useReducerLocalStorage } from '@/util/useLocalStorage';

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
