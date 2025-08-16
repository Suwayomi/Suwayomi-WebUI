/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { ComponentProps, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import Slide, { SlideProps } from '@mui/material/Slide';
import { ReaderProgressBar } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.tsx';
import { useReaderStateChaptersContext } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import {
    getPage,
    getProgressBarPositionInfo,
} from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import {
    IReaderSettings,
    ProgressBarPosition,
    ReaderStateChapters,
    TReaderScrollbarContext,
} from '@/features/reader/Reader.types.ts';
import { ReaderProgressBarDirectionWrapper } from '@/features/reader/overlay/progress-bar/components/ReaderProgressBarDirectionWrapper.tsx';
import { useReaderProgressBarContext } from '@/features/reader/overlay/progress-bar/ReaderProgressBarContext.tsx';
import { useReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlayContext.tsx';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { TReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import {
    ReaderProgressBarProps,
    TReaderProgressBarContext,
} from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { ReaderProgressBarSlotMobile } from '@/features/reader/overlay/progress-bar/mobile/components/ReaderProgressBarSlotMobile.tsx';
import { userReaderStatePagesContext } from '@/features/reader/contexts/state/ReaderStatePagesContext.tsx';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { getProgressBarPosition } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import { useReaderScrollbarContext } from '@/features/reader/contexts/ReaderScrollbarContext.tsx';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';

const PROGRESS_BAR_POSITION_TO_SLIDE_DIRECTION: Record<ProgressBarPosition, SlideProps['direction']> = {
    [ProgressBarPosition.BOTTOM]: 'up',
    [ProgressBarPosition.LEFT]: 'right',
    [ProgressBarPosition.RIGHT]: 'left',
    // should never get accessed
    [ProgressBarPosition.AUTO]: 'left',
};

const BaseMobileReaderProgressBar = ({
    previousChapter,
    nextChapter,
    isVisible,
    setIsMaximized,
    isDragging,
    currentPageIndex,
    pages,
    direction: readerDirection,
    progressBarPosition,
    progressBarPositionAutoVertical,
    topOffset = 0,
    bottomOffset = 0,
    scrollbarXSize,
}: Pick<ReaderStateChapters, 'previousChapter' | 'nextChapter'> &
    Pick<TReaderOverlayContext, 'isVisible'> &
    Pick<TReaderProgressBarContext, 'setIsMaximized' | 'isDragging'> &
    Pick<ReaderProgressBarProps, 'currentPageIndex' | 'pages'> &
    Pick<IReaderSettings, 'progressBarPosition' | 'progressBarPositionAutoVertical'> &
    Pick<TReaderScrollbarContext, 'scrollbarXSize'> & {
        direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
        topOffset?: number;
        bottomOffset?: number;
    }) => {
    const openChapter = ReaderControls.useOpenChapter();

    const [, setRefreshProgressBarPosition] = useState({});
    useResizeObserver(
        window.document.documentElement,
        useCallback(() => setRefreshProgressBarPosition({}), []),
    );

    const finalProgressBarPosition = getProgressBarPosition(
        progressBarPosition,
        progressBarPositionAutoVertical,
        // scrollbar x size is already included in the top/bottom offset due to the progress bar being placed in the reader mobile bottom bar
        topOffset + bottomOffset,
        scrollbarXSize,
    );

    const { isLeft, isRight, isVertical, isHorizontal } = getProgressBarPositionInfo(finalProgressBarPosition);
    const finalReaderDirection = isHorizontal ? readerDirection : 'ltr';
    const currentPagesIndex = useMemo(() => getPage(currentPageIndex, pages).pagesIndex, [currentPageIndex, pages]);

    const progressBarSlotProps: ComponentProps<typeof ReaderProgressBar>['slotProps'] = useMemo(
        () => ({
            container: {
                sx: {
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'stretch',
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
                    borderRadius: 100,
                    boxShadow: 2,
                },
            },
            progressBarRoot: {
                sx: {
                    flexGrow: 1,
                    gap: 0,
                    ...applyStyles(isVertical, {
                        flexDirection: 'column',
                    }),
                    ...applyStyles(isHorizontal, {
                        alignItems: 'stretch',
                    }),
                },
            },
            progressBarSlotsActionArea: {
                sx: {
                    alignItems: 'center',
                    cursor: 'pointer',
                    ...applyStyles(isVertical, {
                        width: '100%',
                        flexDirection: 'column',
                        px: 2,
                    }),
                    ...applyStyles(isHorizontal, {
                        height: '100%',
                        py: 2,
                    }),
                },
            },
            progressBarSlotsContainer: {
                sx: {
                    borderRadius: 100,
                    backgroundColor: 'background.default',
                    ...applyStyles(isVertical, {
                        flexDirection: 'column',
                        py: 1,
                    }),
                    ...applyStyles(isHorizontal, {
                        px: 1,
                    }),
                },
            },
            progressBarSlot: {
                sx: {
                    ...applyStyles(isVertical, {
                        width: '20px',
                    }),
                    ...applyStyles(isHorizontal, {
                        height: '20px',
                    }),
                },
            },
            progressBarCurrentPageSlot: {
                sx: {
                    display: 'flex',
                    zIndex: 1,
                    cursor: 'inherit',
                    ...applyStyles(isVertical, {
                        justifyContent: 'center',
                    }),
                    ...applyStyles(isHorizontal, {
                        alignItems: 'center',
                    }),
                },
            },
            progressBarPageTexts: {
                base: {
                    sx: {
                        ...applyStyles(isVertical, {
                            py: 1,
                        }),
                        ...applyStyles(isHorizontal, {
                            px: 1,
                        }),
                    },
                },
            },
        }),
        [isVertical, isHorizontal],
    );

    const progressBarCurrentPage = useMemo(
        () => ({
            progressBarCurrentPage: (
                <Box
                    sx={{
                        position: 'absolute',
                        ...applyStyles(isVertical, {
                            top: 'calc(100% - 6px)',
                            ...applyStyles(currentPagesIndex === 0, {
                                top: '0',
                            }),
                            width: '75%',
                            height: '6px',
                        }),
                        ...applyStyles(isHorizontal, {
                            left: 'calc(100% - 0px)',
                            ...applyStyles(currentPagesIndex === 0, {
                                left: '0',
                            }),
                            width: '6px',
                            height: '75%',
                        }),
                        backgroundColor: 'primary.main',
                        borderRadius: 100,
                        cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                />
            ),
        }),
        [currentPagesIndex, pages.length, isDragging, isVertical, isHorizontal],
    );

    useLayoutEffect(() => {
        setIsMaximized(isVisible);

        return () => setIsMaximized(false);
    }, [isVisible]);

    return (
        <Slide direction={PROGRESS_BAR_POSITION_TO_SLIDE_DIRECTION[finalProgressBarPosition]} in={isVisible}>
            <ReaderProgressBarDirectionWrapper
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'end',
                    height: '100%',
                    pointerEvents: 'none',
                    ...applyStyles(isLeft, {
                        justifyContent: readerDirection === 'ltr' ? 'start' : 'end',
                    }),
                    ...applyStyles(isRight, {
                        justifyContent: readerDirection === 'ltr' ? 'end' : 'start',
                    }),
                }}
            >
                <Stack
                    sx={{
                        p: 2,
                        gap: 1,
                        pointerEvents: 'all',
                        alignItems: 'center',
                        ...applyStyles(isVertical, {
                            height: '100%',
                            flexDirection: 'column',
                        }),
                        ...applyStyles(isHorizontal, {
                            width: '100%',
                            flexDirection: 'row',
                        }),
                    }}
                >
                    <IconButton
                        onClick={() => openChapter('previous')}
                        disabled={!previousChapter}
                        sx={{
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
                            boxShadow: 2,
                        }}
                    >
                        {getOptionForDirection(
                            <SkipPreviousIcon
                                sx={{
                                    ...applyStyles(isVertical, {
                                        transform: 'rotate(90deg)',
                                    }),
                                }}
                            />,
                            <SkipNextIcon
                                sx={{
                                    ...applyStyles(isVertical, {
                                        transform: 'rotate(90deg)',
                                    }),
                                }}
                            />,
                            finalReaderDirection,
                        )}
                    </IconButton>
                    <ReaderProgressBar
                        direction={finalReaderDirection}
                        progressBarPosition={finalProgressBarPosition}
                        fullSegmentClicks={false}
                        createProgressBarSlot={useCallback(
                            (
                                page,
                                pagesIndex,
                                _primaryPageLoadState,
                                _secondaryPageLoadState,
                                isCurrentPage,
                                _isLeadingPage,
                                isTrailingPage,
                                totalPages,
                            ) => (
                                <ReaderProgressBarSlotMobile
                                    pageName={page.name}
                                    isTrailingPage={isTrailingPage}
                                    isCurrentPage={isCurrentPage}
                                    pagesIndex={pagesIndex}
                                    totalPages={totalPages}
                                    isVertical={isVertical}
                                    isHorizontal={isHorizontal}
                                />
                            ),
                            [isVertical, isHorizontal],
                        )}
                        slotProps={{
                            ...progressBarSlotProps,
                            progressBarReadPages: {
                                sx: {
                                    backgroundColor: 'primary.main',
                                    ...applyStyles(isVertical, {
                                        width: '20px',
                                        height: `${(Math.max(0, getPage(currentPageIndex, pages).pagesIndex) / (pages.length - 1)) * 100}%`,
                                        borderRadius: '400px 400px 0 0',
                                    }),
                                    ...applyStyles(isHorizontal, {
                                        width: `${(Math.max(0, getPage(currentPageIndex, pages).pagesIndex) / (pages.length - 1)) * 100}%`,
                                        height: '20px',
                                        borderRadius: '400px 0 0 400px',
                                    }),
                                },
                            },
                        }}
                        slots={progressBarCurrentPage}
                    />
                    <IconButton
                        onClick={() => openChapter('next')}
                        disabled={!nextChapter}
                        sx={{ backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85), boxShadow: 2 }}
                    >
                        {getOptionForDirection(
                            <SkipNextIcon
                                sx={{
                                    ...applyStyles(isVertical, {
                                        transform: 'rotate(90deg)',
                                    }),
                                }}
                            />,
                            <SkipPreviousIcon
                                sx={{
                                    ...applyStyles(isVertical, {
                                        transform: 'rotate(90deg)',
                                    }),
                                }}
                            />,
                            finalReaderDirection,
                        )}
                    </IconButton>
                </Stack>
            </ReaderProgressBarDirectionWrapper>
        </Slide>
    );
};

export const MobileReaderProgressBar = withPropsFrom(
    memo(BaseMobileReaderProgressBar),
    [
        useReaderStateChaptersContext,
        useReaderOverlayContext,
        useReaderProgressBarContext,
        userReaderStatePagesContext,
        () => ({ direction: ReaderService.useGetThemeDirection() }),
        ReaderService.useSettingsWithoutDefaultFlag,
        useReaderScrollbarContext,
    ],
    [
        'previousChapter',
        'nextChapter',
        'isVisible',
        'setIsMaximized',
        'isDragging',
        'currentPageIndex',
        'pages',
        'direction',
        'progressBarPosition',
        'progressBarPositionAutoVertical',
        'scrollbarXSize',
    ],
);
