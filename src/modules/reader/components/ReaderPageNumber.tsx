/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ProgressBarType } from '@/modules/reader/types/Reader.types.ts';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';

export const ReaderPageNumber = () => {
    const { isDesktop } = ReaderService.useOverlayMode();
    const { scrollbarXSize } = useReaderScrollbarContext();
    const { readerNavBarWidth } = useNavBarContext();
    const { isMaximized } = useReaderProgressBarContext();
    const { currentPageIndex, pages, totalPages } = userReaderStatePagesContext();
    const { progressBarType, shouldShowPageNumber } = ReaderService.useSettings();

    const pageName = useMemo(() => getPage(currentPageIndex, pages).name, [currentPageIndex, pages]);

    if (!shouldShowPageNumber) {
        return null;
    }

    if (isMaximized) {
        return null;
    }

    if (isDesktop && progressBarType === ProgressBarType.STANDARD) {
        return null;
    }

    if (isMaximized && progressBarType === ProgressBarType.HIDDEN) {
        return null;
    }

    return (
        <Stack
            sx={{
                position: 'fixed',
                left: readerNavBarWidth,
                right: 0,
                bottom: (theme) => `calc(${theme.spacing(1)} + ${scrollbarXSize}px)`,
                alignItems: 'center',
                transition: (theme) => `left 0.${theme.transitions.duration.shortest}s`,
            }}
        >
            <Box
                sx={{
                    p: 0.5,
                    borderRadius: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
            >
                <Typography sx={{ color: 'white' }}>
                    {pageName}/{totalPages}
                </Typography>
            </Box>
        </Stack>
    );
};
