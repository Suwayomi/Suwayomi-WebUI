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
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

const BaseReaderInfiniteScrollUpdateChapter = ({
    chapterId,
    previousChapterId,
    nextChapterId,
    isPreviousChapterVisible,
    isCurrentChapter,
    isNextChapterVisible,
    imageWrapper,
    openChapter,
    scrollElement,
}: {
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
        openChapter,
        imageWrapper,
        scrollElement,
    );
    useReaderInfiniteScrollUpdateChapter(
        'last',
        chapterId,
        nextChapterId,
        isCurrentChapter,
        isNextChapterVisible,
        openChapter,
        imageWrapper,
        scrollElement,
    );

    return null;
};

export const ReaderInfiniteScrollUpdateChapter = withPropsFrom(
    memo(BaseReaderInfiniteScrollUpdateChapter),
    [() => ({ openChapter: ReaderControls.useOpenChapter() })],
    ['openChapter'],
);
