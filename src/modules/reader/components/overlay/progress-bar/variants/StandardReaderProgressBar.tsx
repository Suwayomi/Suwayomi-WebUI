/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { alpha, darken, lighten, SxProps, Theme, useTheme } from '@mui/material/styles';
import { ReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBar.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

const applyMinimizedStyling = (isMinimized: boolean, styling: SxProps<Theme>): SxProps<Theme> | undefined =>
    isMinimized ? styling : undefined;

export const StandardReaderProgressBar = (props: ReaderProgressBarProps) => {
    const theme = useTheme();
    const { readerNavBarWidth } = useNavBarContext();
    const { isDragging } = useReaderProgressBarContext();

    const [isFocused, setIsFocused] = useState(false);

    const isMinimized = !isFocused && !isDragging;

    return (
        <ReaderProgressBar
            {...props}
            createProgressBarSlot={([, pageName, isLoaded]) => (
                <ReaderProgressBarSlot
                    pageName={pageName}
                    boxProps={{
                        sx: {
                            backgroundColor: isLoaded ? darken(theme.palette.background.paper, 0.35) : undefined,
                            ...theme.applyStyles('dark', {
                                backgroundColor: isLoaded ? lighten(theme.palette.background.paper, 0.25) : undefined,
                            }),
                        },
                    }}
                />
            )}
            slotProps={{
                container: {
                    sx: {
                        pt: 6,
                        overflow: 'hidden',
                        left: readerNavBarWidth,
                        transition: `left 0.${theme.transitions.duration.shortest}s`,
                        ...applyMinimizedStyling(isMinimized, {
                            opacity: 0.75,
                        }),
                    },
                    onMouseEnter: () => setIsFocused(true),
                    onMouseLeave: () => setIsFocused(false),
                },
                progressBarRoot: {
                    sx: {
                        gap: 0,
                        transition: 'transform 0.1s ease-in-out',
                        backgroundColor: 'background.paper',
                        ...applyMinimizedStyling(isMinimized, {
                            backgroundColor: 'unset',
                            pointerEvents: 'none',
                            transform: `translateY(calc(${theme.spacing(1.5)}))`,
                        }),
                    },
                },
                progressBarSlotsContainer: {
                    sx: {
                        height: '20px',
                        borderRadius: 2,
                        transition: 'height 0.1s ease-in-out',
                        ...applyMinimizedStyling(isMinimized, {
                            height: '4px',
                        }),
                    },
                },
                progressBarSlot: {
                    sx: {
                        borderLeftWidth: 2,
                        borderLeftColor: 'background.paper',
                        borderLeftStyle: 'solid',
                        backgroundColor: darken(theme.palette.background.paper, 0.2),
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
                            ...applyMinimizedStyling(isMinimized, {
                                transform: 'scale(0)',
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
    );
};
