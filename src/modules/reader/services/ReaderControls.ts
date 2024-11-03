/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { Direction } from '@mui/material/styles';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/theme.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { ScrollDirection, ScrollOffset } from '@/modules/core/Core.types.ts';
import { ReaderScrollAmount } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

const READING_DIRECTION_TO_DIRECTION: Record<ReadingDirection, Direction> = {
    [ReadingDirection.LTR]: 'ltr',
    [ReadingDirection.RTL]: 'rtl',
};

const SCROLL_DIRECTION_BY_SCROLL_OFFSET_BY_READING_DIRECTION: Record<ReadingDirection, Record<ScrollOffset, 1 | -1>> = {
    [ReadingDirection.LTR]: {
        [ScrollOffset.BACKWARD]: -1,
        [ScrollOffset.FORWARD]: 1,
    },
    [ReadingDirection.RTL]: {
        [ScrollOffset.BACKWARD]: 1,
        [ScrollOffset.FORWARD]: -1,
    },
};

export class ReaderControls {
    static scroll(
        offset: ScrollOffset,
        direction: ScrollDirection,
        readingDirection: ReadingDirection,
        element: HTMLElement,
        scrollAmountPercentage: number = ReaderScrollAmount.LARGE,
    ): void {
        if (!element) {
            return;
        }

        const scrollAmount = scrollAmountPercentage / 100;
        const scrollDirection = SCROLL_DIRECTION_BY_SCROLL_OFFSET_BY_READING_DIRECTION[readingDirection][offset];

        const getNewScrollPosition = (currentPos: number, elementSize: number) =>
            currentPos + elementSize * scrollAmount * scrollDirection;

        switch (direction) {
            case ScrollDirection.X:
                element.scroll({
                    left: getNewScrollPosition(element.scrollLeft, element.clientWidth),
                    behavior: 'smooth',
                });
                break;
            case ScrollDirection.Y:
                element.scroll({
                    top: getNewScrollPosition(element.scrollTop, element.clientHeight),
                    behavior: 'smooth',
                });
                break;
            default:
                throw new Error(`Unexpected "ScrollDirection" (${direction})`);
        }
    }

    static useOpenChapter(): (offset: 'previous' | 'next') => void {
        const { readingDirection } = ReaderService.useSettings();
        const { previousChapter, nextChapter } = useReaderStateChaptersContext();
        const direction = READING_DIRECTION_TO_DIRECTION[readingDirection.value];

        const openPreviousChapter = ReaderService.useNavigateToChapter(previousChapter);
        const openNextChapter = ReaderService.useNavigateToChapter(nextChapter);

        return useCallback(
            (offset) => {
                switch (offset) {
                    case 'previous':
                        getOptionForDirection(openPreviousChapter, openNextChapter, direction)();
                        break;
                    case 'next':
                        getOptionForDirection(openNextChapter, openPreviousChapter, direction)();
                        break;
                    default:
                        throw new Error(`Unexpected "offset" (${offset})`);
                }
            },
            [direction, openPreviousChapter, openNextChapter],
        );
    }

    static useOpenPage(): (offset: 'previous' | 'next') => void {
        const { currentPageIndex, setCurrentPageIndex, pages } = userReaderStatePagesContext();
        const { readingDirection } = ReaderService.useSettings();

        const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
        const previousPageIndex = useMemo(
            () => getNextPageIndex('previous', currentPage.pagesIndex, pages),
            [currentPage, pages],
        );
        const nextPageIndex = useMemo(
            () => getNextPageIndex('next', currentPage.pagesIndex, pages),
            [currentPage, pages],
        );
        const direction = READING_DIRECTION_TO_DIRECTION[readingDirection.value];

        return useCallback(
            (offset) => {
                switch (offset) {
                    case 'previous':
                        setCurrentPageIndex(getOptionForDirection(previousPageIndex, nextPageIndex, direction));
                        break;
                    case 'next':
                        setCurrentPageIndex(getOptionForDirection(nextPageIndex, previousPageIndex, direction));
                        break;
                    default:
                        throw new Error(`Unexpected "offset" (${offset})`);
                }
            },
            [direction, previousPageIndex, nextPageIndex],
        );
    }
}
