/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderInfiniteScrollUpdateChapter } from '@/modules/reader/hooks/useReaderInfiniteScrollUpdateChapter.ts';
import { ReadingDirection, ReadingMode, TReaderScrollbarContext } from '@/modules/reader/types/Reader.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';

const BaseReaderInfiniteScrollUpdateChapter = ({
    readingMode,
    readingDirection,
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
}: Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'> & {
    readingMode: ReadingMode;
    readingDirection: ReadingDirection;
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
        openChapter,
        imageWrapper,
        scrollbarXSize,
        scrollbarYSize,
        scrollElement,
    );
    useReaderInfiniteScrollUpdateChapter(
        'last',
        chapterId,
        nextChapterId,
        isCurrentChapter,
        isNextChapterVisible,
        readingMode,
        readingDirection,
        openChapter,
        imageWrapper,
        scrollbarXSize,
        scrollbarYSize,
        scrollElement,
    );

    return null;
};

export const ReaderInfiniteScrollUpdateChapter = withPropsFrom(
    memo(BaseReaderInfiniteScrollUpdateChapter),
    [() => ({ openChapter: ReaderControls.useOpenChapter() })],
    ['openChapter'],
);
