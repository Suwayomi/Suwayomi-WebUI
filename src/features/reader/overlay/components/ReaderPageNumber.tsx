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
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { IReaderSettings, ProgressBarType, ReadingDirection } from '@/features/reader/Reader.types.ts';
import { getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useReaderProgressBarContext } from '@/features/reader/overlay/progress-bar/ReaderProgressBarContext.tsx';
import { reverseString } from '@/base/utils/Strings.ts';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { TReaderProgressBarContext } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useReaderStoreShallow } from '@/features/reader/ReaderStore.ts';

const BaseReaderPageNumber = ({
    isDesktop,
    readerNavBarWidth,
    isMaximized,
    progressBarType,
    shouldShowPageNumber,
    readingDirection,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop'> &
    Pick<NavbarContextType, 'readerNavBarWidth'> &
    Pick<TReaderProgressBarContext, 'isMaximized'> &
    Pick<IReaderSettings, 'progressBarType' | 'shouldShowPageNumber' | 'readingDirection'>) => {
    const scrollbar = useReaderStoreShallow((state) => state.scrollbar);
    const { currentPageIndex, pages, totalPages } = useReaderStoreShallow((state) => ({
        currentPageIndex: state.pages.currentPageIndex,
        pages: state.pages.pages,
        totalPages: state.pages.totalPages,
    }));

    const pageName = useMemo(() => {
        const currentPageName = getPage(currentPageIndex, pages).name;
        const SEPARATOR = '/';
        const tmpPageName = `${currentPageName}${SEPARATOR}${totalPages}`;

        return readingDirection === ReadingDirection.LTR ? tmpPageName : reverseString(tmpPageName, SEPARATOR);
    }, [currentPageIndex, pages, totalPages, readingDirection]);

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
                bottom: (theme) => `max(calc(${theme.spacing(1)} + ${scrollbar.xSize}px), env(safe-area-inset-bottom))`,
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
                <Typography sx={{ color: 'white' }}>{pageName}</Typography>
            </Box>
        </Stack>
    );
};

export const ReaderPageNumber = withPropsFrom(
    BaseReaderPageNumber,
    [
        ReaderService.useOverlayMode,
        useNavBarContext,
        useReaderProgressBarContext,
        ReaderService.useSettingsWithoutDefaultFlag,
    ],
    ['isDesktop', 'readerNavBarWidth', 'isMaximized', 'progressBarType', 'shouldShowPageNumber', 'readingDirection'],
);
