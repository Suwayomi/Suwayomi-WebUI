/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useReaderInfiniteScrollUpdateChapter } from '@/features/reader/infinite-scroll/useReaderInfiniteScrollUpdateChapter.ts';
import { IReaderSettings, TReaderScrollbarContext } from '@/features/reader/Reader.types.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

const BaseReaderInfiniteScrollUpdateChapter = ({
    readingMode,
    readingDirection,
    shouldUseInfiniteScroll,
    chapterId,
    previousChapterId,
    nextChapterId,
    isPreviousChapterVisible,
    isCurrentChapter,
    isNextChapterVisible,
    imageWrapper,
    openChapter,
    scrollbarXSize,
    scrollbarYSize,
    scrollElement,
    shouldShowTransitionPage,
}: Pick<IReaderSettings, 'shouldShowTransitionPage'> &
    Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'> &
    Pick<IReaderSettings, 'readingMode' | 'readingDirection' | 'shouldUseInfiniteScroll'> & {
        chapterId: ChapterIdInfo['id'];
        previousChapterId?: ChapterIdInfo['id'];
        nextChapterId?: ChapterIdInfo['id'];
        isPreviousChapterVisible: boolean;
        isCurrentChapter: boolean;
        isNextChapterVisible: boolean;
        imageWrapper: HTMLElement | null;
        openChapter: ReturnType<typeof ReaderControls.useOpenChapter>;
        scrollElement: HTMLElement | null;
    }) => {
    useReaderInfiniteScrollUpdateChapter(
        'first',
        chapterId,
        previousChapterId,
        isCurrentChapter,
        isPreviousChapterVisible,
        readingMode,
        readingDirection,
        shouldUseInfiniteScroll,
        openChapter,
        imageWrapper,
        scrollbarXSize,
        scrollbarYSize,
        scrollElement,
        shouldShowTransitionPage,
    );
    useReaderInfiniteScrollUpdateChapter(
        'last',
        chapterId,
        nextChapterId,
        isCurrentChapter,
        isNextChapterVisible,
        readingMode,
        readingDirection,
        shouldUseInfiniteScroll,
        openChapter,
        imageWrapper,
        scrollbarXSize,
        scrollbarYSize,
        scrollElement,
        shouldShowTransitionPage,
    );

    return null;
};

export const ReaderInfiniteScrollUpdateChapter = withPropsFrom(
    memo(BaseReaderInfiniteScrollUpdateChapter),
    [() => ({ openChapter: ReaderControls.useOpenChapter() }), ReaderService.useSettingsWithoutDefaultFlag],
    ['openChapter', 'shouldShowTransitionPage'],
);
