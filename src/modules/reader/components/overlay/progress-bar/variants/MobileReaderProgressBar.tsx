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
import { ComponentProps, memo, useCallback, useLayoutEffect, useMemo } from 'react';
import { ReaderProgressBar } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBar.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { ReaderResumeMode, ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';
import { ReaderProgressBarDirectionWrapper } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarDirectionWrapper.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { TReaderOverlayContext } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderProgressBarProps, TReaderProgressBarContext } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderProgressBarSlotMobile } from '@/modules/reader/components/overlay/progress-bar/mobile/ReaderProgressBarSlotMobile.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';

const PROGRESS_BAR_SLOT_PROPS: ComponentProps<typeof ReaderProgressBar>['slotProps'] = {
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
            alignItems: 'stretch',
            gap: 0,
        },
    },
    progressBarSlotsActionArea: {
        sx: {
            height: '100%',
            alignItems: 'center',
            py: 2,
            cursor: 'pointer',
        },
    },
    progressBarSlotsContainer: {
        sx: {
            borderRadius: 100,
            backgroundColor: 'background.default',
        },
    },
    progressBarSlot: {
        sx: {
            height: '20px',
        },
    },
    progressBarCurrentPageSlot: {
        sx: {
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            pointer: 'default',
        },
    },
    progressBarPageTexts: {
        base: { px: 1 },
    },
};

const BaseMobileReaderProgressBar = ({
    previousChapter,
    nextChapter,
    isVisible,
    setIsMaximized,
    currentPageIndex,
    pages,
    direction,
}: Pick<ReaderStateChapters, 'previousChapter' | 'nextChapter'> &
    Pick<TReaderOverlayContext, 'isVisible'> &
    Pick<TReaderProgressBarContext, 'setIsMaximized'> &
    Pick<ReaderProgressBarProps, 'currentPageIndex' | 'pages'> & {
        direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
    }) => {
    const openNextChapter = ReaderService.useNavigateToChapter(nextChapter, ReaderResumeMode.START);
    const openPreviousChapter = ReaderService.useNavigateToChapter(previousChapter, ReaderResumeMode.END);

    const currentPagesIndex = useMemo(() => getPage(currentPageIndex, pages).pagesIndex, [currentPageIndex, pages]);

    const progressBarCurrentPage = useMemo(
        () => ({
            progressBarCurrentPage: (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 'calc(100% - 6px)',
                        ...applyStyles(currentPagesIndex === 0, {
                            left: '0',
                        }),
                        width: '6px',
                        height: '75%',
                        backgroundColor: 'primary.main',
                        borderRadius: 100,
                    }}
                />
            ),
        }),
        [currentPagesIndex, pages.length],
    );

    useLayoutEffect(() => {
        setIsMaximized(isVisible);

        return () => setIsMaximized(false);
    }, [isVisible]);

    return (
        <ReaderProgressBarDirectionWrapper>
            <Stack
                sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    px: 2,
                    gap: 1,
                }}
            >
                <IconButton
                    onClick={openPreviousChapter}
                    disabled={!previousChapter}
                    sx={{ backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85), boxShadow: 2 }}
                >
                    {getOptionForDirection(<SkipPreviousIcon />, <SkipNextIcon />, direction)}
                </IconButton>
                <ReaderProgressBar
                    createProgressBarSlot={useCallback(
                        (page, pagesIndex, _2, _3, _4, _5, isTrailingPage, totalPages) => (
                            <ReaderProgressBarSlotMobile
                                pageName={page.name}
                                isTrailingPage={isTrailingPage}
                                pagesIndex={pagesIndex}
                                totalPages={totalPages}
                            />
                        ),
                        [],
                    )}
                    slotProps={{
                        ...PROGRESS_BAR_SLOT_PROPS,
                        progressBarReadPages: {
                            sx: {
                                height: '20px',
                                backgroundColor: 'primary.main',
                                borderRadius: '400px 0 0 400px',
                                width: `${(Math.max(0, getPage(currentPageIndex, pages).pagesIndex) / (pages.length - 1)) * 100}%`,
                            },
                        },
                    }}
                    slots={progressBarCurrentPage}
                />
                <IconButton
                    onClick={openNextChapter}
                    disabled={!nextChapter}
                    sx={{ backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85), boxShadow: 2 }}
                >
                    {getOptionForDirection(<SkipNextIcon />, <SkipPreviousIcon />, direction)}
                </IconButton>
            </Stack>
        </ReaderProgressBarDirectionWrapper>
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
    ],
    ['previousChapter', 'nextChapter', 'isVisible', 'setIsMaximized', 'currentPageIndex', 'pages', 'direction'],
);
