/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useLayoutEffect } from 'react';
import { Direction } from '@mui/material/styles';
import { ReadingDirection } from '@/features/reader/Reader.types.ts';
import { getNextIndexFromPage, getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getScrollIntoViewInlineOption } from '@/features/reader/viewer/pager/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { DirectionOffset } from '@/base/Base.types.ts';

export const useReaderHandlePageSelection = (
    pageToScrollToIndex: ReaderStatePages['pageToScrollToIndex'],
    currentPageIndex: number,
    pages: ReaderStatePages['pages'],
    totalPages: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>,
    isContinuousReadingModeActive: boolean,
    imageRefs: MutableRefObject<(HTMLElement | null)[]>,
    themeDirection: Direction,
    readingDirection: ReadingDirection,
) => {
    useLayoutEffect(() => {
        if (pageToScrollToIndex == null) {
            return;
        }

        const pageToScrollTo = getPage(pageToScrollToIndex, pages);

        if (isContinuousReadingModeActive) {
            const directionOffset =
                pageToScrollToIndex > currentPageIndex ? DirectionOffset.PREVIOUS : DirectionOffset.NEXT;
            const imageRef = imageRefs.current[pageToScrollTo.pagesIndex];

            imageRef?.scrollIntoView({
                block: 'start',
                inline: getScrollIntoViewInlineOption(directionOffset, themeDirection, readingDirection),
            });
        }

        const newPageIndex = getNextIndexFromPage(pageToScrollTo);
        const isLastPage = newPageIndex === totalPages - 1;

        setPageToScrollToIndex(null);
        updateCurrentPageIndex(newPageIndex, !isLastPage, isLastPage);
    }, [pageToScrollToIndex]);
};
