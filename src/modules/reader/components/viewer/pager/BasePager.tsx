/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { getPageIndexesToLoad, isATransitionPageVisible } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { IReaderSettings, ReaderPagerProps, ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

const BaseBasePager = ({
    currentPageIndex,
    pages,
    transitionPageMode,
    imageRefs,
    createPage,
    slots,
    readingMode,
    imagePreLoadAmount,
    isCurrentChapter,
    isPreviousChapter,
    isNextChapter,
}: Omit<ReaderPagerProps, 'pageLoadStates' | 'retryFailedPagesKeyPrefix'> &
    Pick<IReaderSettings, 'readingMode' | 'imagePreLoadAmount'> & {
        createPage: (
            page: ReaderStatePages['pages'][number],
            pagesIndex: number,
            shouldLoad: boolean,
            shouldDisplay: boolean,
            setRef: (pagesIndex: number, element: HTMLElement | null) => void,
        ) => ReactNode;
        slots?: { boxProps?: BoxProps };
    }) => {
    const previousCurrentPageIndex = useRef(-1);
    const pagesIndexesToRender = useMemo(
        () =>
            getPageIndexesToLoad(
                currentPageIndex,
                pages,
                previousCurrentPageIndex.current,
                imagePreLoadAmount,
                readingMode,
                isCurrentChapter,
                isPreviousChapter,
                isNextChapter,
            ),
        [currentPageIndex, pages, imagePreLoadAmount, readingMode, isCurrentChapter, isPreviousChapter, isNextChapter],
    );
    useEffect(() => {
        previousCurrentPageIndex.current = currentPageIndex;
    }, [pagesIndexesToRender]);

    const setRef = useCallback(
        (pagesIndex: number, element: HTMLElement | null) => {
            // eslint-disable-next-line no-param-reassign
            imageRefs.current[pagesIndex] = element;
        },
        [imageRefs],
    );

    return (
        <Box
            {...slots?.boxProps}
            sx={[
                {
                    width: 'fit-content',
                    height: 'fit-content',
                },
                ...(Array.isArray(slots?.boxProps?.sx) ? (slots?.boxProps?.sx ?? []) : [slots?.boxProps?.sx]),
                // hide pager, without actually unmounting it to prevent re-renders, while a chapter transition page is taking up the full screen
                applyStyles(
                    !isContinuousReadingMode(readingMode) && isATransitionPageVisible(transitionPageMode, readingMode),
                    {
                        visibility: 'hidden',
                        width: 0,
                        height: 0,
                        m: 0,
                        p: 0,
                    },
                ),
            ]}
        >
            {pages.map((page, pagesIndex) =>
                createPage(
                    page,
                    pagesIndex,
                    pagesIndexesToRender.includes(pagesIndex),
                    [ReaderTransitionPageMode.NONE, ReaderTransitionPageMode.BOTH].includes(transitionPageMode),
                    setRef,
                ),
            )}
        </Box>
    );
};

export const BasePager = withPropsFrom(
    memo(BaseBasePager),
    [ReaderService.useSettingsWithoutDefaultFlag],
    ['readingMode', 'imagePreLoadAmount'],
);
