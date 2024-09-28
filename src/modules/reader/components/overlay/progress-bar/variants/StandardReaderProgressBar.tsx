/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { alpha, darken, lighten, useTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { ReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBar.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ProgressBarPosition, ProgressBarType } from '@/modules/reader-deprecated/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { getProgressBarPositionInfo } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { DIRECTION_TO_CACHE } from '@/modules/theme/ThemeDirectionCache.ts';

export const StandardReaderProgressBar = () => {
    const theme = useTheme();
    const pagesState = userReaderStatePagesContext();
    const { readerNavBarWidth } = useNavBarContext();
    const { isDragging } = useReaderProgressBarContext();
    const { progressBarType, progressBarSize } = ReaderService.useSettings();
    const progressBarPosition = ProgressBarPosition.BOTTOM;
    const direction = ReaderService.useGetThemeDirection();

    const { isBottom, isLeft, isRight, isVertical, isHorizontal } = getProgressBarPositionInfo(progressBarPosition);

    const [isFocused, setIsFocused] = useState(false);

    const isHidden = progressBarType === ProgressBarType.HIDDEN;
    const isMinimized = !isFocused && !isDragging;

    // the progress bar uses the reading direction to set the themes direction, thus, stuff has to be adjusted to still be correctly positioned
    // depending on which combination of theme direction and reading direction is currently active
    return (
        <CacheProvider value={DIRECTION_TO_CACHE[direction]}>
            <ReaderProgressBar
                {...pagesState}
                progressBarPosition={progressBarPosition}
                createProgressBarSlot={([, pageName, isLoaded]) => (
                    <ReaderProgressBarSlot
                        pageName={pageName}
                        progressBarPosition={progressBarPosition}
                        boxProps={{
                            sx: {
                                backgroundColor: isLoaded ? darken(theme.palette.background.paper, 0.35) : undefined,
                                ...theme.applyStyles('dark', {
                                    backgroundColor: isLoaded
                                        ? lighten(theme.palette.background.paper, 0.25)
                                        : undefined,
                                }),
                            },
                        }}
                    />
                )}
                slotProps={{
                    container: {
                        sx: {
                            overflow: 'hidden',
                            transition: `left 0.${theme.transitions.duration.shortest}s`,
                            ...applyStyles(isHorizontal, {
                                minHeight: '100px',
                                ...applyStyles(theme.direction === 'ltr', {
                                    left: direction === 'ltr' ? readerNavBarWidth : 0,
                                    right: direction === 'rtl' ? readerNavBarWidth : 0,
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    left: direction === 'rtl' ? readerNavBarWidth : 0,
                                    right: direction === 'ltr' ? readerNavBarWidth : 0,
                                }),
                            }),
                            ...applyStyles(isVertical, {
                                minWidth: '100px',
                            }),
                            ...applyStyles(isLeft, {
                                ...applyStyles(theme.direction === 'ltr', {
                                    left: direction === 'ltr' ? readerNavBarWidth : 'unset',
                                    right: direction === 'rtl' ? readerNavBarWidth : 'unset',
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    right: direction === 'rtl' ? 0 : 'unset',
                                    left: direction === 'ltr' ? 0 : 'unset',
                                }),
                            }),
                            ...applyStyles(isRight, {
                                ...applyStyles(theme.direction === 'ltr', {
                                    right: direction === 'ltr' ? 0 : 'unset',
                                    left: direction === 'rtl' ? 0 : 'unset',
                                }),
                                ...applyStyles(theme.direction === 'rtl', {
                                    left: direction === 'rtl' ? readerNavBarWidth : 'unset',
                                    right: direction === 'ltr' ? readerNavBarWidth : 'unset',
                                }),
                            }),
                            ...applyStyles(isMinimized, {
                                opacity: !isHidden ? 0.85 : 0,
                            }),
                        },
                        onMouseEnter: () => setIsFocused(true),
                        onMouseLeave: () => setIsFocused(false),
                    },
                    progressBarRoot: {
                        sx: {
                            gap: 0,
                            transition: 'padding 0.1s ease-in-out',
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
                                        pl: direction === 'ltr' ? 0.25 : 0,
                                        pr: direction === 'rtl' ? 0.25 : 0,
                                    }),
                                    ...applyStyles(theme.direction === 'rtl', {
                                        pr: direction === 'rtl' ? 0.25 : 0,
                                        pl: direction === 'ltr' ? 0.25 : 0,
                                    }),
                                }),
                                ...applyStyles(isRight, {
                                    ...applyStyles(theme.direction === 'ltr', {
                                        pr: direction === 'ltr' ? 0.25 : 0,
                                        pl: direction === 'rtl' ? 0.25 : 0,
                                    }),
                                    ...applyStyles(theme.direction === 'rtl', {
                                        pl: direction === 'rtl' ? 0.25 : 0,
                                        pr: direction === 'ltr' ? 0.25 : 0,
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
                    progressBarSlot: {
                        sx: {
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
                        },
                    },
                    progressBarReadPages: {
                        sx: {
                            backgroundColor: alpha(theme.palette.primary.main, 0.5),
                            borderRadius: 2,
                        },
                    },
                    progressBarCurrentPageSlot: {
                        sx: {
                            backgroundColor: 'primary.dark',
                            borderRadius: 2,
                            ...theme.applyStyles('dark', { backgroundColor: 'primary.light' }),
                        },
                    },
                    progressBarPageTexts: {
                        base: {
                            sx: {
                                p: 2,
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
        </CacheProvider>
    );
};
