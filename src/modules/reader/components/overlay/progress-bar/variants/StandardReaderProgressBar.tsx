/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { alpha, darken, lighten, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { memo } from 'react';
import { ReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBar.tsx';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { IReaderSettings, ProgressBarType, TReaderScrollbarContext } from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { getPage, getProgressBarPositionInfo } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { ReaderProgressBarDirectionWrapper } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarDirectionWrapper.tsx';
import { TReaderProgressBarContext } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { NavbarContextType } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';

const BaseStandardReaderProgressBar = ({
    readerNavBarWidth,
    isMaximized,
    setIsMaximized,
    isDragging,
    progressBarType,
    progressBarSize,
    progressBarPosition,
    readerDirection,
    scrollbarXSize,
    scrollbarYSize,
}: Pick<NavbarContextType, 'readerNavBarWidth'> &
    Pick<TReaderProgressBarContext, 'isMaximized' | 'setIsMaximized' | 'isDragging'> &
    Pick<IReaderSettings, 'progressBarType' | 'progressBarSize' | 'progressBarPosition'> &
    Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'> & {
        readerDirection: ReturnType<typeof ReaderService.useGetThemeDirection>;
    }) => {
    const theme = useTheme();
    const pagesState = userReaderStatePagesContext();
    const { currentPageIndex, pages } = pagesState;

    const currentPagesIndex = getPage(currentPageIndex, pages).pagesIndex;

    const { isBottom, isLeft, isRight, isVertical, isHorizontal } = getProgressBarPositionInfo(progressBarPosition);

    const isHidden = progressBarType === ProgressBarType.HIDDEN;
    const isMinimized = !isMaximized && !isDragging;

    if (isHidden) {
        return null;
    }

    // the progress bar uses the reading direction to set the themes direction, thus, stuff has to be adjusted to still be correctly positioned
    // depending on which combination of theme direction and reading direction is currently active
    return (
        <ReaderProgressBarDirectionWrapper>
            <ReaderProgressBar
                {...pagesState}
                progressBarPosition={progressBarPosition}
                createProgressBarSlot={({ name, primary, secondary }, pageLoadStates, pagesIndex) => (
                    <ReaderProgressBarSlot
                        key={primary.url}
                        pageName={name}
                        progressBarPosition={progressBarPosition}
                        slotProps={{
                            box: {
                                sx: {
                                    cursor: 'pointer',
                                    backgroundColor: darken(theme.palette.background.paper, 0.2),
                                    ...applyStyles(isHorizontal, {
                                        borderLeftWidth: 2,
                                        borderLeftColor: 'background.paper',
                                        borderLeftStyle: 'solid',
                                    }),
                                    ...applyStyles(isVertical, {
                                        borderTopWidth: 2,
                                        borderTopColor: 'background.paper',
                                        borderTopStyle: 'solid',
                                    }),
                                    ...theme.applyStyles('dark', {
                                        backgroundColor: lighten(theme.palette.background.paper, 0.1),
                                    }),
                                    ...applyStyles(
                                        pageLoadStates[primary.index]?.loaded &&
                                            (!secondary || pageLoadStates[secondary.index]?.loaded),
                                        {
                                            backgroundColor: darken(theme.palette.background.paper, 0.35),
                                            ...theme.applyStyles('dark', {
                                                backgroundColor: lighten(theme.palette.background.paper, 0.25),
                                            }),
                                        },
                                    ),
                                    borderLeftWidth: pagesIndex === 0 ? 0 : undefined,
                                    borderRightWidth: pagesIndex === pages.length - 1 ? 0 : undefined,
                                },
                            },
                            tooltip: {
                                slotProps:
                                    pagesIndex === currentPagesIndex
                                        ? {
                                              tooltip: {
                                                  sx: {
                                                      backgroundColor: 'primary.main',
                                                      color: 'primary.contrastText',
                                                  },
                                              },
                                          }
                                        : undefined,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                ...applyStyles(pagesIndex < currentPagesIndex, {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                                }),
                                ...applyStyles(pagesIndex === currentPagesIndex, {
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    pointer: 'grabbing',
                                    borderRadius: 2,
                                    backgroundColor: 'primary.dark',
                                    ...theme.applyStyles('dark', {
                                        backgroundColor: 'primary.light',
                                    }),
                                }),
                            }}
                        />
                    </ReaderProgressBarSlot>
                )}
                slotProps={{
                    container: {
                        sx: {
                            overflow: 'hidden',
                            transition: `all 0.${theme.transitions.duration.shortest}s`,
                            ...applyStyles(isHorizontal, {
                                minHeight: '100px',
                                ...applyStyles(theme.direction === 'ltr', {
                                    left: readerDirection === 'ltr' ? readerNavBarWidth : scrollbarYSize,
                                    right: readerDirection === 'rtl' ? readerNavBarWidth : scrollbarYSize,
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    left: readerDirection === 'rtl' ? readerNavBarWidth : scrollbarYSize,
                                    right: readerDirection === 'ltr' ? readerNavBarWidth : scrollbarYSize,
                                }),
                            }),
                            ...applyStyles(isVertical, {
                                minWidth: '100px',
                                bottom: `${scrollbarXSize}px`,
                            }),
                            ...applyStyles(isBottom, {
                                bottom: `${scrollbarXSize}px`,
                            }),
                            ...applyStyles(isLeft, {
                                ...applyStyles(theme.direction === 'ltr', {
                                    left: readerDirection === 'ltr' ? readerNavBarWidth : 'unset',
                                    right: readerDirection === 'rtl' ? readerNavBarWidth : 'unset',
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    right: readerDirection === 'rtl' ? scrollbarYSize : 'unset',
                                    left: readerDirection === 'ltr' ? scrollbarYSize : 'unset',
                                }),
                            }),
                            ...applyStyles(isRight, {
                                ...applyStyles(theme.direction === 'ltr', {
                                    right: readerDirection === 'ltr' ? scrollbarYSize : 'unset',
                                    left: readerDirection === 'rtl' ? scrollbarYSize : 'unset',
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    left: readerDirection === 'rtl' ? readerNavBarWidth : 'unset',
                                    right: readerDirection === 'ltr' ? readerNavBarWidth : 'unset',
                                }),
                            }),
                            ...applyStyles(isMinimized, {
                                opacity: !isHidden ? 0.85 : 0,
                            }),
                        },
                        onMouseEnter: () => setIsMaximized(true),
                        onMouseLeave: () => setIsMaximized(false),
                    },
                    progressBarRoot: {
                        sx: {
                            gap: 0,
                            transition: 'all 0.1s ease-in-out',
                            backgroundColor: 'background.paper',
                            ...applyStyles(isVertical, {
                                flexDirection: 'column',
                                height: '100%',
                            }),
                            ...applyStyles(isMinimized, {
                                backgroundColor: 'unset',
                                pointerEvents: 'none',
                                ...applyStyles(isHorizontal, {
                                    px: 2,
                                }),
                                ...applyStyles(isVertical, {
                                    py: 2,
                                }),
                                ...applyStyles(isBottom, {
                                    pb: 0.25,
                                }),
                                ...applyStyles(isLeft, {
                                    ...applyStyles(theme.direction === 'ltr', {
                                        pl: readerDirection === 'ltr' ? 0.25 : 0,
                                        pr: readerDirection === 'rtl' ? 0.25 : 0,
                                    }),
                                    ...applyStyles(theme.direction === 'rtl', {
                                        pr: readerDirection === 'rtl' ? 0.25 : 0,
                                        pl: readerDirection === 'ltr' ? 0.25 : 0,
                                    }),
                                }),
                                ...applyStyles(isRight, {
                                    ...applyStyles(theme.direction === 'ltr', {
                                        pr: readerDirection === 'ltr' ? 0.25 : 0,
                                        pl: readerDirection === 'rtl' ? 0.25 : 0,
                                    }),
                                    ...applyStyles(theme.direction === 'rtl', {
                                        pl: readerDirection === 'rtl' ? 0.25 : 0,
                                        pr: readerDirection === 'ltr' ? 0.25 : 0,
                                    }),
                                }),
                            }),
                        },
                    },
                    progressBarSlotsContainer: {
                        sx: {
                            borderRadius: 2,
                            transition: 'height 0.1s ease-in-out',
                            ...applyStyles(isHorizontal, {
                                height: '20px',
                            }),
                            ...applyStyles(isVertical, {
                                flexDirection: 'column',
                                width: '20px',
                            }),
                            ...applyStyles(isMinimized, {
                                ...applyStyles(isHorizontal, {
                                    height: `${progressBarSize}px`,
                                }),
                                ...applyStyles(isVertical, {
                                    width: `${progressBarSize}px`,
                                }),
                            }),
                        },
                    },
                    progressBarReadPages: { sx: { display: 'none' } },
                    progressBarCurrentPageSlot: { sx: { display: 'none' } },
                    progressBarPageTexts: {
                        base: {
                            sx: {
                                px: 1,
                                py: 1.5,
                                transition: 'all 0.1s ease-in-out',
                                ...applyStyles(isMinimized, {
                                    transform: 'scale(0)',
                                    p: 0,
                                    minWidth: 0,
                                    maxWidth: 0,
                                    minHeight: 0,
                                    maxHeight: 0,
                                }),
                            },
                        },
                    },
                }}
            />
        </ReaderProgressBarDirectionWrapper>
    );
};

export const StandardReaderProgressBar = withPropsFrom(
    memo(BaseStandardReaderProgressBar),
    [
        useNavBarContext,
        useReaderProgressBarContext,
        ReaderService.useSettingsWithoutDefaultFlag,
        () => ({ readerDirection: ReaderService.useGetThemeDirection() }),
        useReaderScrollbarContext,
    ],
    [
        'readerNavBarWidth',
        'isMaximized',
        'setIsMaximized',
        'isDragging',
        'progressBarType',
        'progressBarSize',
        'progressBarPosition',
        'readerDirection',
        'scrollbarXSize',
        'scrollbarYSize',
    ],
);
