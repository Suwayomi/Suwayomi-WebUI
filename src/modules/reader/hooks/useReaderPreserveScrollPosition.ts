/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import {
    ReaderPageScaleMode,
    ReaderStateChapters,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { getPreviousNextChapterVisibility } from '@/modules/reader/utils/Reader.utils.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types';
import { isReaderWidthEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

export const useReaderPreserveScrollPosition = (
    scrollElementRef: RefObject<HTMLElement | null>,
    currentChapterId: ChapterIdInfo['id'] | undefined,
    chapterIndex: number,
    pageIndex: number,
    chaptersToRender: TChapterReader[],
    visibleChapters: ReaderStateChapters['visibleChapters'],
    readingMode: ReadingMode,
    isContinuousReadingModeActive: boolean,
    readingDirection: ReadingDirection,
    readerNavBarWidth: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    pageScaleMode: ReaderPageScaleMode,
) => {
    const scrollPosition = useRef({ left: 0, top: 0, scrollWidth: 0, scrollHeight: 0 });
    const readerNavBarWidthRef = useRef<number>(readerNavBarWidth);

    useEffect(() => {
        const element = scrollElementRef.current;

        if (!element) {
            return () => {};
        }

        const onScroll = () => {
            scrollPosition.current = {
                ...scrollPosition.current,
                left: element.scrollLeft,
                top: element.scrollTop,
            };
        };

        element.addEventListener('scroll', onScroll);

        return () => element.removeEventListener('scroll', onScroll);
    }, []);

    // on rendering previous chapter (infinite scroll in continuous reading modes)
    useLayoutEffect(() => {
        const scrollElement = scrollElementRef.current;
        const { left, top, scrollWidth, scrollHeight } = scrollPosition.current;

        if (!scrollElement || !isContinuousReadingModeActive) {
            return;
        }

        scrollPosition.current = {
            ...scrollPosition.current,
            scrollWidth: scrollElement.scrollWidth,
            scrollHeight: scrollElement.scrollHeight,
        };

        const themeDirectionForReadingDirection = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];

        const previousNextChapterVisibility = getPreviousNextChapterVisibility(
            chapterIndex,
            chaptersToRender,
            visibleChapters,
        );

        const wasScrolledBackwardHorizontal = Math.abs(left) < window.innerWidth * 1.5;
        const wasScrolledBackwardVertical = top < window.innerHeight * 1.5;

        const widthOfPrependedContent = scrollElement.scrollWidth - scrollWidth;
        const heightOfPrependedContent = scrollElement.scrollHeight - scrollHeight;

        const newLeft = wasScrolledBackwardHorizontal
            ? getOptionForDirection(
                  widthOfPrependedContent,
                  -widthOfPrependedContent,
                  themeDirectionForReadingDirection,
              ) + left
            : left;
        const newTop = wasScrolledBackwardVertical ? heightOfPrependedContent + top : top;

        // only relevant when prepending content to the dom due to the resulting layout shift
        const isFirstRenderOfPreviousChapter =
            !previousNextChapterVisibility.previous && (wasScrolledBackwardHorizontal || wasScrolledBackwardVertical);
        if (!isFirstRenderOfPreviousChapter) {
            return;
        }

        scrollElement.scrollTo(newLeft, newTop);
    }, [currentChapterId]);

    const onAvailableReaderWidthChange = useCallback(() => {
        if (!isContinuousReadingModeActive) {
            return;
        }

        if (!isReaderWidthEditable(pageScaleMode)) {
            return;
        }

        setPageToScrollToIndex(pageIndex);
    }, [isContinuousReadingModeActive, pageIndex, pageScaleMode]);

    // on window resize
    useEffect(() => {
        window.addEventListener('resize', onAvailableReaderWidthChange);
        return () => window.removeEventListener('resize', onAvailableReaderWidthChange);
    }, [onAvailableReaderWidthChange]);

    // on reader nav bar static setting change
    useEffect(() => {
        if (readerNavBarWidthRef.current === readerNavBarWidth) {
            return;
        }

        readerNavBarWidthRef.current = readerNavBarWidth;
        onAvailableReaderWidthChange();
    }, [onAvailableReaderWidthChange, readerNavBarWidth]);

    // on reading mode change
    useLayoutEffect(() => {
        setPageToScrollToIndex(pageIndex);
    }, [readingMode]);
};
