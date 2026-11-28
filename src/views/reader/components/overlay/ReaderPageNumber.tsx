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
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { ProgressBarType, ReadingDirection } from '@/models/reader/Reader.types.ts';
import { getPage } from '@/utils/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { useNavBarContext } from '@/contexts/navigation-bar/NavbarContext.tsx';
import { reverseString } from '@/utils/base/Strings.ts';
import type { NavbarContextType } from '@/models/navigation-bar/NavigationBar.types.ts';
import { withPropsFrom } from '@/hoc/base/withPropsFrom.tsx';
import {
    useReaderPagesStore,
    useReaderProgressBarStore,
    useReaderScrollbarStore,
    useReaderSettingsStore,
} from '@/controllers/reader/stores/ReaderStore.ts';
import { useTheme } from '@mui/material/styles';

const BaseReaderPageNumber = ({
    isDesktop,
    readerNavBarWidth,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop'> &
    Pick<NavbarContextType, 'readerNavBarWidth'>) => {
    const theme = useTheme();
    const scrollbar = useReaderScrollbarStore((state) => state);
    const { currentPageIndex, pages, totalPages } = useReaderPagesStore('currentPageIndex', 'pages', 'totalPages');
    const { readingDirection, shouldShowPageNumber, progressBarType, progressBarSize } = useReaderSettingsStore(
        (state) => ({
            readingDirection: state.readingDirection.value,
            shouldShowPageNumber: state.shouldShowPageNumber,
            progressBarType: state.progressBarType,
            progressBarSize: state.progressBarSize,
        }),
    );
    const progressBarSizeInset = isDesktop && progressBarType === ProgressBarType.STANDARD ? progressBarSize : 0;
    const safeAreaInset = useReaderSettingsStore((state) => state.safeAreaInset);
    const isMaximized = useReaderProgressBarStore('isMaximized');

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

    return (
        <Stack
            sx={{
                position: 'fixed',
                right: 0,
                alignItems: 'center',
                transition: `left 0.${theme.transitions.duration.shortest}s`,
            }}
            style={{
                insetInlineStart: readerNavBarWidth,
                bottom: `calc(${theme.spacing(1)} + ${progressBarSizeInset}px + max(${scrollbar.xSize}px, ${safeAreaInset.bottom ? 'env(safe-area-inset-bottom)' : '0px'}))`,
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
    [ReaderService.useOverlayMode, useNavBarContext],
    ['isDesktop', 'readerNavBarWidth'],
);
