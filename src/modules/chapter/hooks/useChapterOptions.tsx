/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';
import { useReducerLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { DEFAULT_CHAPTER_OPTIONS } from '@/modules/chapter/Chapter.constants.ts';
import { ChapterListOptions, ChapterOptionsReducerAction } from '@/modules/chapter/Chapter.types.ts';

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

export const useChapterOptions = (mangaId: number) =>
    useReducerLocalStorage<ChapterListOptions, ChapterOptionsReducerAction>(
        chapterOptionsReducer,
        `${mangaId}filterOptions`,
        DEFAULT_CHAPTER_OPTIONS,
    );
