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
import { useReducerLocalStorage } from '@/util/useStorage.tsx';

const defaultChapterOptions: ChapterListOptions = {
    active: false,
    unread: undefined,
    downloaded: undefined,
    bookmarked: undefined,
    reverse: true,
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

const sortChapters = (
    chapters: TChapter[],
    { sortBy, reverse }: Pick<ChapterListOptions, 'sortBy' | 'reverse'>,
): TChapter[] => {
    const sortedChapters: TChapter[] = [...chapters];

    switch (sortBy) {
        case 'source':
            sortedChapters.sort((a, b) => a.sourceOrder - b.sourceOrder);
            break;
        case 'fetchedAt':
            sortedChapters.sort((a, b) => Number(a.fetchedAt ?? 0) - Number(b.fetchedAt ?? 0));
            break;
        case 'chapterNumber':
            sortedChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
            break;
        case 'uploadedAt':
            sortedChapters.sort((a, b) => Number(a.uploadDate ?? 0) - Number(b.uploadDate ?? 0));
            break;
        default:
        // nothing to do
    }

    if (reverse) {
        sortedChapters.reverse();
    }

    return sortedChapters;
};

export function filterAndSortChapters(chapters: TChapter[], options: ChapterListOptions): TChapter[] {
    const filtered = options.active
        ? chapters.filter(
              (chp) =>
                  unreadFilter(options.unread, chp) &&
                  downloadFilter(options.downloaded, chp) &&
                  bookmarkedFilter(options.bookmarked, chp),
          )
        : [...chapters];

    return sortChapters(filtered, options);
}

export const useChapterOptions = (mangaId: number) =>
    useReducerLocalStorage<ChapterListOptions, ChapterOptionsReducerAction>(
        chapterOptionsReducer,
        `${mangaId}filterOptions`,
        defaultChapterOptions,
    );

export const SORT_OPTIONS: Record<ChapterSortMode, TranslationKey> = {
    source: 'global.sort.label.by_source',
    chapterNumber: 'global.sort.label.by_chapter_number',
    uploadedAt: 'global.sort.label.by_upload_date',
    fetchedAt: 'global.sort.label.by_fetch_date',
};

export const isFilterActive = (options: ChapterListOptions) => {
    const { unread, downloaded, bookmarked } = options;
    return unread != null || downloaded != null || bookmarked != null;
};
