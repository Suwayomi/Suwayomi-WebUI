/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import {
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';

interface ElementIntersection {
    start: boolean;
    end: boolean;
}
interface ElementIntersectionInfo {
    [ReadingMode.CONTINUOUS_VERTICAL]: ElementIntersection;
    [ReadingMode.CONTINUOUS_HORIZONTAL]: ElementIntersection;
}

const OPEN_CHAPTER_INTERSECTION_RATIO = 0.1;

const getElementIntersectionInfo = (
    readingDirection: ReadingDirection,
    { top, right, bottom, left }: DOMRect,
): ElementIntersectionInfo => {
    const themeDirectionOfReadingDirection = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];

    const startOfViewportHorizontal = getOptionForDirection(0, window.innerWidth, themeDirectionOfReadingDirection);
    const endOfViewportHorizontal = getOptionForDirection(window.innerWidth, 0, themeDirectionOfReadingDirection);

    const startOfElementHorizontal = getOptionForDirection(left, right, themeDirectionOfReadingDirection);
    const endOfElementHorizontal = getOptionForDirection(right, left, themeDirectionOfReadingDirection);

    return {
        [ReadingMode.CONTINUOUS_VERTICAL]: {
            start: bottom >= window.innerHeight,
            end: top < 0,
        },
        [ReadingMode.CONTINUOUS_HORIZONTAL]: {
            start: endOfElementHorizontal >= endOfViewportHorizontal,
            end: startOfElementHorizontal < startOfViewportHorizontal,
        },
    };
};

const shouldHandleIntersectionEvent = (
    {
        [ReadingMode.CONTINUOUS_VERTICAL]: verticalInfo,
        [ReadingMode.CONTINUOUS_HORIZONTAL]: horizontalInfo,
    }: ElementIntersectionInfo,
    readingMode: ReadingMode,
): boolean => {
    if (isContinuousVerticalReadingMode(readingMode)) {
        return verticalInfo.start || verticalInfo.end;
    }

    return horizontalInfo.start || horizontalInfo.end;
};

const getElementIntersection = (
    {
        [ReadingMode.CONTINUOUS_VERTICAL]: verticalInfo,
        [ReadingMode.CONTINUOUS_HORIZONTAL]: horizontalInfo,
    }: ElementIntersectionInfo,
    readingMode: ReadingMode,
): ElementIntersection => {
    if (isContinuousVerticalReadingMode(readingMode)) {
        return verticalInfo;
    }

    return horizontalInfo;
};

export const useReaderInfiniteScrollUpdateChapter = (
    pageType: 'first' | 'last',
    chapterId: number,
    chapterToOpenId: number | undefined,
    isCurrentChapter: boolean,
    isChapterToOpenVisible: boolean,
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    openChapter: ReturnType<typeof ReaderControls.useOpenChapter>,
    image: HTMLElement | null,
) => {
    useLayoutEffect(() => {
        if (!image || !isContinuousReadingMode(readingMode) || chapterToOpenId === undefined) {
            return () => {};
        }

        // gets immediately observed once on initial render
        let isInitialObserve = true;
        let wasNextChapterOpened = false;
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                if (isInitialObserve) {
                    isInitialObserve = false;
                    return;
                }

                if (wasNextChapterOpened) {
                    return;
                }

                const entry = entries[entries.length - 1];

                const elementIntersectionInfo = getElementIntersectionInfo(
                    readingDirection,
                    entry.target.getBoundingClientRect(),
                );
                const { start: isStartIntersecting, end: isEndIntersecting } = getElementIntersection(
                    elementIntersectionInfo,
                    readingMode,
                );
                const wasPageScrolledOutOfView = entry.intersectionRatio < OPEN_CHAPTER_INTERSECTION_RATIO;

                if (!shouldHandleIntersectionEvent(elementIntersectionInfo, readingMode)) {
                    return;
                }

                // the first page only opens the previous chapter in case it hasn't been loaded yet, otherwise, the last
                // page handles setting the correct chapter
                const initialOpenPreviousChapter =
                    pageType === 'first' && isStartIntersecting && !isChapterToOpenVisible;
                const openPreviousChapter = pageType === 'last' && !isCurrentChapter && isEndIntersecting;
                const openNextChapter = pageType === 'last' && isEndIntersecting && wasPageScrolledOutOfView;

                const openChapterToOpen = initialOpenPreviousChapter || openNextChapter;
                if (openChapterToOpen) {
                    openChapter(chapterToOpenId, !isChapterToOpenVisible, false);
                    wasNextChapterOpened = true;
                    return;
                }

                if (openPreviousChapter) {
                    openChapter(chapterId, false, false);
                    wasNextChapterOpened = true;
                }
            },
            { threshold: [OPEN_CHAPTER_INTERSECTION_RATIO] },
        );
        intersectionObserver.observe(image);

        return () => intersectionObserver.unobserve(image);
    }, [
        pageType,
        chapterId,
        chapterToOpenId,
        isCurrentChapter,
        isChapterToOpenVisible,
        readingMode,
        readingDirection,
        openChapter,
        image,
    ]);
};
