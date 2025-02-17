/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import {
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { useIntersectionObserver } from '@/modules/core/hooks/useIntersectionObserver.tsx';

interface ElementIntersection {
    start: boolean;
    end: boolean;
}
interface ElementIntersectionInfo {
    [ReadingMode.CONTINUOUS_VERTICAL]: ElementIntersection;
    [ReadingMode.CONTINUOUS_HORIZONTAL]: ElementIntersection;
}

type PageType = 'first' | 'last';

const OPEN_CHAPTER_INTERSECTION_RATIO = 0;
const INTERSECTION_THRESHOLD = '-10px';

const getRootMargin = (
    pageType: PageType,
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
): string | undefined => {
    if (!isContinuousReadingMode(readingMode)) {
        return undefined;
    }

    const themeDirectionOfReadingDirection = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];

    const firstPageMarginHorizontal = `0px ${INTERSECTION_THRESHOLD} 0px 0px`;
    const lastPageMarginHorizontal = `0px 0px 0px ${INTERSECTION_THRESHOLD}`;

    if (isContinuousVerticalReadingMode(readingMode)) {
        if (pageType === 'first') {
            return `0px 0px ${INTERSECTION_THRESHOLD} 0px`;
        }

        return `${INTERSECTION_THRESHOLD} 0px 0px 0px`;
    }

    if (pageType === 'first') {
        return getOptionForDirection(
            firstPageMarginHorizontal,
            lastPageMarginHorizontal,
            themeDirectionOfReadingDirection,
        );
    }

    return getOptionForDirection(lastPageMarginHorizontal, firstPageMarginHorizontal, themeDirectionOfReadingDirection);
};

const getElementIntersectionInfoHorizontal = (
    readingDirection: ReadingDirection,
    left: number,
    right: number,
    viewportWidth: number,
): ElementIntersectionInfo[ReadingMode.CONTINUOUS_HORIZONTAL] => {
    if (readingDirection === ReadingDirection.LTR) {
        return {
            start: right >= viewportWidth,
            end: left < 0,
        };
    }

    return {
        start: left < 0,
        end: right >= viewportWidth,
    };
};

/**
 * Returns info about if the start or end of an element is intersecting.
 *
 * The info is mapped to the ReadingMode since depending on the selected mode, the start and end of the element changes
 */
const getElementIntersectionInfo = (
    readingDirection: ReadingDirection,
    { top, right, bottom, left }: DOMRect,
    scrollbarXSize: number,
    scrollbarYSize: number,
): ElementIntersectionInfo => {
    const viewportWidth = window.innerWidth - scrollbarYSize;
    const viewportHeight = window.innerHeight - scrollbarXSize;

    return {
        [ReadingMode.CONTINUOUS_VERTICAL]: {
            start: bottom >= viewportHeight,
            end: top < 0,
        },
        [ReadingMode.CONTINUOUS_HORIZONTAL]: getElementIntersectionInfoHorizontal(
            readingDirection,
            left,
            right,
            viewportWidth,
        ),
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

/**
 * Will change the chapter to the previous or next one depending on the intersection of the first or last page.
 *
 * For the initial load of the previous chapter, the intersection of the first page is used, after the initial load
 * of the previous chapter the intersection of the last page handles changing the chapter
 *
 * @example
 * How it works:
 *  |, _ = viewport
 *  #    = page
 *
 * initial open previous chapter (start of first page intersecting, chapter of page is current chapter, previous chapter not yet loaded):
 *
 *  vertical pager:
 *        |----------------|
 *        |                |          ↑
 *        |                |          ↑ Scroll direction: backward
 *        |    #######     |          ↑
 *        |----#######-----|
 *             #######
 *             #######
 *
 *  horizontal pager (ltr):
 *        |----------------|
 *        |               ########    ←
 *        |               ########    ← Scroll direction: backward
 *        |               ########    ←
 *        |----------------|
 *
 * horizontal pager (rtl):
 *        |----------------|
 *  ########               |          →
 *  ########               |          → Scroll direction: backward
 *  ########               |          →
 *        |----------------|
 *
 *
 *
 *
 * open previous chapter (chapter of intersecting page) (end of last page intersecting):
 *
 *  vertical pager:
 *             #######
 *             #######
 *        |----#######-----|
 *        |    #######     |          ↑
 *        |                |          ↑ Scroll direction: backward
 *        |                |          ↑
 *        |________________|
 *
 *  horizontal pager (ltr):
 *        |----------------|
 *  ########               |          ←
 *  ########               |          ← Scroll direction: backward
 *  ########               |          ←
 *        |----------------|
 *
 *  horizontal pager (rtl):
 *        |----------------|
 *        |               ########    →
 *        |               ########    → Scroll direction: backward
 *        |               ########    →
 *        |----------------|
 *
 *
 *
 *
 * open next chapter (end of last page intersecting):
 *
 *  vertical pager:
 *             #######
 *             #######
 *        |----#######-----|
 *        |    #######     |          ↓
 *        |                |          ↓ Scroll direction: forward
 *        |                |          ↓
 *        |________________|
 *
 *  horizontal pager (ltr):
 *        |----------------|
 *  ########               |          →
 *  ########               |          → Scroll direction: forward
 *  ########               |          →
 *        |----------------|
 *
 *  horizontal pager (rtl):
 *        |----------------|
 *        |               ########    ←
 *        |               ########    ← Scroll direction: forward
 *        |               ########    ←
 *        |----------------|
 *
 */
export const useReaderInfiniteScrollUpdateChapter = (
    pageType: PageType,
    chapterId: number,
    chapterToOpenId: number | undefined,
    isCurrentChapter: boolean,
    isChapterToOpenVisible: boolean,
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    openChapter: ReturnType<typeof ReaderControls.useOpenChapter>,
    image: HTMLElement | null,
    scrollbarXSize: number,
    scrollbarYSize: number,
) => {
    useIntersectionObserver(
        image,
        useCallback(
            (entries) => {
                if (!isContinuousReadingMode(readingMode) || chapterToOpenId === undefined) {
                    return;
                }

                const entry = entries[entries.length - 1];

                const elementIntersectionInfo = getElementIntersectionInfo(
                    readingDirection,
                    entry.target.getBoundingClientRect(),
                    scrollbarXSize,
                    scrollbarYSize,
                );
                const { start: isStartIntersecting, end: isEndIntersecting } = getElementIntersection(
                    elementIntersectionInfo,
                    readingMode,
                );
                const wasPageScrolledOutOfView = entry.intersectionRatio <= OPEN_CHAPTER_INTERSECTION_RATIO;

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
                    return;
                }

                if (openPreviousChapter) {
                    openChapter(chapterId, false, false);
                }
            },
            [
                pageType,
                chapterId,
                chapterToOpenId,
                isCurrentChapter,
                isChapterToOpenVisible,
                readingMode,
                readingDirection,
                openChapter,
                scrollbarXSize,
                scrollbarYSize,
            ],
        ),
        useMemo(
            () => ({
                threshold: [OPEN_CHAPTER_INTERSECTION_RATIO],
                rootMargin: getRootMargin(pageType, readingMode, readingDirection),
                // gets immediately observed once on initial render
                ignoreInitialObserve: true,
            }),
            [pageType, readingMode, readingDirection],
        ),
    );
};
