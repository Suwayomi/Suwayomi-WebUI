/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import { ChapterListOptions, ChapterOptionsReducerAction, ChapterSortMode } from '@/typings.ts';
import { useReducerLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { ChapterBookmarkInfo, ChapterDownloadInfo, ChapterReadInfo } from '@/lib/data/Chapters.ts';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { NullAndUndefined, TranslationKey } from '@/Base.types.ts';

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

export function unreadFilter(unread: NullAndUndefined<boolean>, { isRead: isChapterRead }: ChapterReadInfo) {
    switch (unread) {
        case true:
            return !isChapterRead;
        case false:
            return isChapterRead;
        default:
            return true;
    }
}

function downloadFilter(downloaded: NullAndUndefined<boolean>, { isDownloaded: chapterDownload }: ChapterDownloadInfo) {
    switch (downloaded) {
        case true:
            return chapterDownload;
        case false:
            return !chapterDownload;
        default:
            return true;
    }
}

function bookmarkedFilter(
    bookmarked: NullAndUndefined<boolean>,
    { isBookmarked: chapterBookmarked }: ChapterBookmarkInfo,
) {
    switch (bookmarked) {
        case true:
            return chapterBookmarked;
        case false:
            return !chapterBookmarked;
        default:
            return true;
    }
}

type TChapterSort = Pick<ChapterType, 'sourceOrder' | 'fetchedAt' | 'chapterNumber' | 'uploadDate'>;
const sortChapters = <T extends TChapterSort>(
    chapters: T[],
    { sortBy, reverse }: Pick<ChapterListOptions, 'sortBy' | 'reverse'>,
): T[] => {
    const sortedChapters: T[] = [...chapters];

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

type TChapterFilter = TChapterSort & ChapterReadInfo & ChapterDownloadInfo & ChapterBookmarkInfo;
export function filterAndSortChapters<Chapters extends TChapterFilter>(
    chapters: Chapters[],
    options: ChapterListOptions,
): Chapters[] {
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
