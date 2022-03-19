/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export const defaultChapterOptions: ChapterListOptions = {
    active: false,
    unread: undefined,
    downloaded: undefined,
    bookmarked: undefined,
    reverse: false,
    sortBy: 'source',
    showChapterNumber: false,
};

/**
 * It takes the current state and an action, and returns the new state
 * @param {ChapterListOptions} state - The current state of the reducer.
 * @param {ChapterOptionsReducerAction} actions - ChapterOptionsReducerAction
 * @returns The new state.
 */
export function chapterOptionsReducer(state: ChapterListOptions,
    actions: ChapterOptionsReducerAction)
    : ChapterListOptions {
    switch (actions.type) {
        case 'filter':
            // eslint-disable-next-line no-case-declarations
            const active = state.unread !== false
            && state.downloaded !== false
            && state.bookmarked !== false;
            return {
                ...state,
                active,
                [actions.filterType!]: actions.filterValue,
            };
        case 'sortBy':
            return { ...state, sortBy: actions.sortBy };
        case 'sortReverse':
            return { ...state, reverse: !state.reverse };
        case 'showChapterNumber':
            return { ...state, showChapterNumber: !state.showChapterNumber };
        default:
            throw Error('This is not a valid Action');
    }
}

/**
 * If the unread parameter is true, return true if the chapter is not read. If the unread parameter is
 * false, return true if the chapter is read. If the unread parameter is null or undefined, return
 * true.
 * @param unread - The value of the unread filter.
 * @param {IChapter}  - unread: A boolean value that indicates whether to filter unread chapters or
 * read chapters.
 * @returns A function that takes a chapter and returns a boolean.
 */
export function unreadFilter(unread: NullAndUndefined<boolean>, { read: isChapterRead }: IChapter) {
    switch (unread) {
        case true:
            return !isChapterRead;
        case false:
            return isChapterRead;
        default:
            return true;
    }
}

/**
 * If the chapter is downloaded, return the chapterDownload value. If the chapter is not downloaded,
 * return the opposite of the chapterDownload value. If the chapter is not downloaded and there is no
 * chapterDownload value, return true
 * @param downloaded - The value of the downloaded filter.
 * @param {IChapter}  - `downloaded`: A boolean value that determines whether to filter out chapters
 * that have been downloaded or not.
 * @returns A boolean value.
 */
export function downloadFilter(downloaded: NullAndUndefined<boolean>,
    { downloaded: chapterDownload }: IChapter) {
    switch (downloaded) {
        case true:
            return chapterDownload;
        case false:
            return !chapterDownload;
        default:
            return true;
    }
}

/**
 * If the bookmarked parameter is true, return the chapter's bookmarked value. If the bookmarked
 * parameter is false, return the opposite of the chapter's bookmarked value. If the bookmarked
 * parameter is null or undefined, return true
 * @param bookmarked - The value of the bookmarked filter.
 * @param {IChapter}  - bookmarked: The value of the bookmarked parameter.
 * @returns A boolean value.
 */
export function bookmarkdFilter(bookmarked: NullAndUndefined<boolean>,
    { bookmarked: chapterBookmarked }: IChapter) {
    switch (bookmarked) {
        case true:
            return chapterBookmarked;
        case false:
            return !chapterBookmarked;
        default:
            return true;
    }
}

/**
 * It filters and sorts the chapters based on the options provided
 * @param {IChapter[]} chapters - The list of chapters to filter and sort.
 * @param {ChapterListOptions} options - ChapterListOptions
 * @returns A filtered and sorted list of chapters.
 */
export function filterAndSortChapters(chapters: IChapter[], options: ChapterListOptions)
    : IChapter[] {
    const filtered = options.active
        ? chapters.filter((chp) => unreadFilter(options.unread, chp)
    && downloadFilter(options.downloaded, chp)
    && bookmarkdFilter(options.bookmarked, chp))
        : [...chapters];
    const Sorted = options.sortBy === 'fetchedAt'
        ? filtered.sort((a, b) => a.fetchedAt - b.fetchedAt)
        : filtered;
    if (options.reverse) {
        Sorted.reverse();
    }
    return Sorted;
}

/**
 * Find the first chapter in the array that is not read.
 * @param {IChapter[]} chapters - IChapter[]
 * @returns The first chapter that is not read.
 */
export function findFirstUnreadChapter(chapters: IChapter[]): IChapter | undefined {
    for (let index = chapters.length - 1; index >= 0; index--) {
        if (!chapters[index].read) return chapters[index];
    }
    return undefined;
}
