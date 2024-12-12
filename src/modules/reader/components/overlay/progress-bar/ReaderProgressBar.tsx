/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box, { BoxProps } from '@mui/material/Box';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { TypographyProps } from '@mui/material/Typography';
import { StackProps } from '@mui/material/Stack';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
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
    useHandleProgressDragging,
} from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection as getOptionForDirectionImpl } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderProgressBarSlotsActionArea } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlotsActionArea.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';

export const ReaderProgressBar = ({
    totalPages,
    pages,
    pageLoadStates,
    currentPageIndex,
    slotProps,
    slots,
    createProgressBarSlot,
    progressBarPosition,
}: ReaderProgressBarProps & {
    createProgressBarSlot: (
        page: ReaderProgressBarProps['pages'][number],
        pageLoadStates: ReaderProgressBarProps['pageLoadStates'],
        pagesIndex: number,
    ) => ReactNode;
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
}) => {
    const { isDragging, setIsDragging } = useReaderProgressBarContext();
    const openPage = ReaderControls.useOpenPage();
    const direction = ReaderService.useGetThemeDirection();

    const progressBarRef = useRef<HTMLDivElement | null>(null);

    const isHorizontalPosition = getProgressBarPositionInfo(progressBarPosition).isHorizontal;
    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    const getOptionForDirection = useCallback(
        <T,>(...args: Parameters<typeof getOptionForDirectionImpl<T>>) =>
            getOptionForDirectionImpl(args[0], args[1], direction),
        [direction],
    );

    useHandleProgressDragging(
        openPage,
        progressBarRef,
        isDragging,
        currentPage,
        pages,
        progressBarPosition,
        getOptionForDirection,
    );

    return (
        <ReaderProgressBarContainer {...slotProps?.container} progressBarPosition={progressBarPosition}>
            <ReaderProgressBarRoot {...slotProps?.progressBarRoot}>
                <ReaderProgressBarPageNumber
                    {...slotProps?.progressBarPageTexts?.base}
                    {...slotProps?.progressBarPageTexts?.current}
                    sx={[
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.base?.sx)
                            ? (slotProps?.progressBarPageTexts?.base?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.base?.sx]),
                        ...(Array.isArray(slotProps?.progressBarPageTexts?.current?.sx)
                            ? (slotProps?.progressBarPageTexts?.current?.sx ?? [])
                            : [slotProps?.progressBarPageTexts?.current?.sx]),
                    ]}
                    onClick={() => openPage('previous', 'ltr')}
                >
                    {currentPage.name}
                </ReaderProgressBarPageNumber>
                <ClickAwayListener onClickAway={() => setIsDragging(false)}>
                    <ReaderProgressBarSlotsActionArea
                        {...slotProps?.progressBarSlotsActionArea}
                        ref={progressBarRef}
                        onTouchEnd={() => setIsDragging(false)}
                        onTouchStart={(event) => {
                            if (!progressBarRef.current) {
                                return;
                            }

                            openPage(
                                getNextIndexFromPage(
                                    getPageForMousePos(
                                        event.touches[0],
                                        progressBarRef.current.getBoundingClientRect(),
                                        pages,
                                        isHorizontalPosition,
                                        getOptionForDirection,
                                    ),
                                ),
                            );
                            setIsDragging(true);
                        }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseDown={(event) => {
                            if (!progressBarRef.current) {
                                return;
                            }

                            openPage(
                                getNextIndexFromPage(
                                    getPageForMousePos(
                                        event,
                                        progressBarRef.current.getBoundingClientRect(),
                                        pages,
                                        isHorizontalPosition,
                                        getOptionForDirection,
                                    ),
                                ),
                            );
                            setIsDragging(true);
                        }}
                    >
                        <ReaderProgressBarSlotsContainer {...slotProps?.progressBarSlotsContainer}>
                            {pages.map((page, pagesIndex) => (
                                <Box
                                    key={page.primary.index}
                                    {...slotProps?.progressBarSlot}
                                    sx={{
                                        flexGrow: 1,
                                        height: '100%',
                                        cursor: 'pointer',
                                        ...slotProps?.progressBarSlot?.sx,
                                        borderLeftWidth: pagesIndex === 0 ? 0 : undefined,
                                        borderRightWidth: pagesIndex === pages.length - 1 ? 0 : undefined,
                                    }}
                                >
                                    {createProgressBarSlot(page, pageLoadStates, pagesIndex)}
                                </Box>
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
                            setIsDragging={setIsDragging}
                            progressBarPosition={progressBarPosition}
                        >
                            {slots?.progressBarCurrentPage}
                        </ReaderProgressBarCurrentPageSlot>
                    </ReaderProgressBarSlotsActionArea>
                </ClickAwayListener>
                <ReaderProgressBarPageNumber
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
                    onClick={() => openPage('next', 'ltr')}
                >
                    {totalPages}
                </ReaderProgressBarPageNumber>
            </ReaderProgressBarRoot>
        </ReaderProgressBarContainer>
    );
};
