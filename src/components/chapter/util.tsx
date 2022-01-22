/*
import { Fab } from '@mui/material/Fab';
import { Link } from 'react-router-dom';
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Fab } from '@mui/material';
import { Link } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';

export const defaultChapterOptions: ChapterListOptions = {
    active: false,
    unread: undefined,
    downloaded: undefined,
    bookmarked: undefined,
    reverse: false,
    sortBy: 'source',
    showChapterNumber: false,
};

export function optionsReducer(state: ChapterListOptions, actions: OptionsReducerActions)
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

interface ResumeFABProps{
    chapter: IChapter
    mangaId: string
}

export function ResumeFab(props: ResumeFABProps) {
    const { chapter: { index, lastPageRead }, mangaId } = props;
    return (
        <Fab
            sx={{ position: 'fixed', bottom: '2em', right: '3em' }}
            component={Link}
            variant="extended"
            color="primary"
            to={`/manga/${mangaId}/chapter/${index}/page/${lastPageRead}`}
        >
            <PlayArrow />
            {index === 1 ? 'Start' : 'Resume' }
        </Fab>
    );
}

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

export function findFirstUnreadChapter(chapters: IChapter[]): IChapter | undefined {
    for (let index = chapters.length - 1; index >= 0; index--) {
        if (!chapters[index].read) return chapters[index];
    }
    return undefined;
}
