/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BoxProps } from '@mui/material/Box';
import { memo, ReactNode, useCallback, useMemo, useRef, ComponentProps, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { TypographyProps } from '@mui/material/Typography';
import { StackProps } from '@mui/material/Stack';
import { ReaderProgressBarProps, TReaderProgressBarContext } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderProgressBarPageNumber } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarPageNumber.tsx';
import { ReaderProgressBarContainer } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarContainer.tsx';
import { ReaderProgressBarRoot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarRoot.tsx';
import { ReaderProgressBarSlotsContainer } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlotsContainer.tsx';
import { ProgressBarHighlightReadPages } from '@/modules/reader/components/overlay/progress-bar/ProgressBarHighlightReadPages.tsx';
import { ReaderProgressBarCurrentPageSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarCurrentPageSlot.tsx';
import {
    getNextIndexFromPage,
    getPage,
    getPageForMousePos,
    getProgressBarPositionInfo,
} from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection as getOptionForDirectionImpl } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderProgressBarSlotsActionArea } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlotsActionArea.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { ReaderProgressBarSlotWrapper } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlotWrapper.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

const BaseReaderProgressBar = ({
    totalPages,
    pages,
    pageLoadStates,
    currentPageIndex,
    slotProps,
    slots,
    createProgressBarSlot,
    progressBarPosition,
    isDragging,
    setIsDragging,
    openPage,
    direction,
}: ReaderProgressBarProps &
    Pick<TReaderProgressBarContext, 'isDragging' | 'setIsDragging'> &
    Pick<ComponentProps<typeof ReaderProgressBarSlotWrapper>, 'createProgressBarSlot'> & {
        slotProps?: {
            container?: StackProps;
            progressBarRoot?: StackProps;
            progressBarSlotsActionArea?: StackProps;
            progressBarSlotsContainer?: StackProps;
            progressBarSlot?: BoxProps;
            progressBarReadPages?: BoxProps;
            progressBarCurrentPageSlot?: BoxProps;
            progressBarPageTexts?: {
                base?: TypographyProps;
                current?: TypographyProps;
                total?: TypographyProps;
            };
        };
        slots?: {
            progressBarCurrentPage?: ReactNode;
        };
        openPage: ReturnType<typeof ReaderControls.useOpenPage>;
        direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
    }) => {
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const draggingDetectionTimeout = useRef<NodeJS.Timeout>();

    const [totalPagesTextWidth, setTotalPagesTextWidth] = useState(0);
    const totalPagesTextRef = useRef<HTMLSpanElement | null>(null);
    useResizeObserver(
        totalPagesTextRef,
        useCallback(() => {
            const element = totalPagesTextRef.current;
            if (!element) {
                return;
            }

            const { paddingLeft, paddingRight } = getComputedStyle(element);

            setTotalPagesTextWidth(element.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight));
        }, []),
    );

    const currentPagesIndex = useMemo(() => getPage(currentPageIndex, pages).pagesIndex, [currentPageIndex, pages]);

    const isHorizontalPosition = getProgressBarPositionInfo(progressBarPosition).isHorizontal;
    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    const getOptionForDirection = useCallback(
        <T,>(...args: Parameters<typeof getOptionForDirectionImpl<T>>) =>
            getOptionForDirectionImpl(args[0], args[1], direction),
        [direction],
    );

    ReaderControls.useHandleProgressDragging(
        openPage,
        progressBarRef,
        isDragging,
        currentPage,
        pages,
        progressBarPosition,
        getOptionForDirection,
    );

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!progressBarRef.current) {
            return;
        }

        const isTouchEvent = 'touches' in e;

        openPage(
            getNextIndexFromPage(
                getPageForMousePos(
                    isTouchEvent ? e.touches[0] : e,
                    progressBarRef.current.getBoundingClientRect(),
                    pages,
                    isHorizontalPosition,
                    getOptionForDirection,
                ),
            ),
            undefined,
            false,
        );

        clearTimeout(draggingDetectionTimeout.current);
        draggingDetectionTimeout.current = setTimeout(() => setIsDragging(true), 250);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        clearTimeout(draggingDetectionTimeout.current);
    };

    return (
        <ReaderProgressBarContainer {...slotProps?.container} progressBarPosition={progressBarPosition}>
            <ReaderProgressBarRoot {...slotProps?.progressBarRoot}>
                <ReaderProgressBarPageNumber
                    {...slotProps?.progressBarPageTexts?.base}
                    {...slotProps?.progressBarPageTexts?.current}
                    sx={[
                        { width: `${totalPagesTextWidth}px` },
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.base?.sx)
                            ? (slotProps?.progressBarPageTexts?.base?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.base?.sx]),
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.current?.sx)
                            ? (slotProps?.progressBarPageTexts?.current?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.current?.sx]),
                    ]}
                    onClick={() => openPage('previous', 'ltr', false)}
                >
                    {currentPage.name}
                </ReaderProgressBarPageNumber>
                <ClickAwayListener onClickAway={() => setIsDragging(false)}>
                    <ReaderProgressBarSlotsActionArea
                        {...slotProps?.progressBarSlotsActionArea}
                        ref={progressBarRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                    >
                        <ReaderProgressBarSlotsContainer {...slotProps?.progressBarSlotsContainer}>
                            {pages.map((page, pagesIndex) => (
                                <ReaderProgressBarSlotWrapper
                                    {...slotProps?.progressBarSlot}
                                    key={page.primary.index}
                                    page={page}
                                    pagesIndex={pagesIndex}
                                    isCurrentPage={pagesIndex === currentPagesIndex}
                                    isLeadingPage={pagesIndex < currentPagesIndex}
                                    isTrailingPage={pagesIndex > currentPagesIndex}
                                    totalPages={pages.length}
                                    primaryPageLoadState={pageLoadStates[page.primary.index].loaded}
                                    secondaryPageLoadState={
                                        page.secondary ? pageLoadStates[page.secondary.index].loaded : undefined
                                    }
                                    createProgressBarSlot={createProgressBarSlot}
                                    showDraggingStyle={pagesIndex === currentPagesIndex && isDragging}
                                />
                            ))}
                            <ProgressBarHighlightReadPages
                                {...slotProps?.progressBarReadPages}
                                currentPagesIndex={currentPage.pagesIndex}
                                pagesLength={pages.length}
                                progressBarPosition={progressBarPosition}
                            />
                        </ReaderProgressBarSlotsContainer>
                        <ReaderProgressBarCurrentPageSlot
                            boxProps={slotProps?.progressBarCurrentPageSlot}
                            pageName={currentPage.name}
                            currentPagesIndex={currentPage.pagesIndex}
                            pagesLength={pages.length}
                            isDragging={isDragging}
                            progressBarPosition={progressBarPosition}
                        >
                            {slots?.progressBarCurrentPage}
                        </ReaderProgressBarCurrentPageSlot>
                    </ReaderProgressBarSlotsActionArea>
                </ClickAwayListener>
                <ReaderProgressBarPageNumber
                    ref={totalPagesTextRef}
                    {...slotProps?.progressBarPageTexts?.base}
                    {...slotProps?.progressBarPageTexts?.total}
                    sx={[
                        {
                            minWidth: 'unset',
                        },
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.base?.sx)
                            ? (slotProps?.progressBarPageTexts?.base?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.base?.sx]),
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.total?.sx)
                            ? (slotProps?.progressBarPageTexts?.total?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.total?.sx]),
                    ]}
                    onClick={() => openPage('next', 'ltr', false)}
                >
                    {totalPages}
                </ReaderProgressBarPageNumber>
            </ReaderProgressBarRoot>
        </ReaderProgressBarContainer>
    );
};

export const ReaderProgressBar = withPropsFrom(
    memo(BaseReaderProgressBar),
    [
        useReaderProgressBarContext,
        () => ({ openPage: ReaderControls.useOpenPage() }),
        () => ({
            direction: ReaderService.useGetThemeDirection(),
        }),
        userReaderStatePagesContext,
        ReaderService.useSettingsWithoutDefaultFlag,
    ],
    [
        'isDragging',
        'setIsDragging',
        'openPage',
        'direction',
        'pages',
        'pageLoadStates',
        'totalPages',
        'currentPageIndex',
        'progressBarPosition',
    ],
);
