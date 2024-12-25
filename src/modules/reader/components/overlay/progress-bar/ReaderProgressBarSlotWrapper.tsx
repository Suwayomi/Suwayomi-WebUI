/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box, { BoxProps } from '@mui/material/Box';
import { memo, ReactNode } from 'react';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';

export const ReaderProgressBarSlotWrapper = memo(
    ({
        page,
        pagesIndex,
        pageLoadStates,
        isFirstPage,
        isLastPage,
        createProgressBarSlot,
        ...boxProps
    }: {
        page: ReaderProgressBarProps['pages'][number];
        pagesIndex: number;
        pageLoadStates: ReaderProgressBarProps['pageLoadStates'];
        isFirstPage: boolean;
        isLastPage: boolean;
        createProgressBarSlot: (
            page: ReaderProgressBarProps['pages'][number],
            pageLoadStates: ReaderProgressBarProps['pageLoadStates'],
            pagesIndex: number,
        ) => ReactNode;
    } & BoxProps) => (
        <Box
            {...boxProps}
            sx={{
                flexGrow: 1,
                height: '100%',
                cursor: 'pointer',
                ...boxProps?.sx,
                borderLeftWidth: isFirstPage ? 0 : undefined,
                borderRightWidth: isLastPage ? 0 : undefined,
            }}
        >
            {createProgressBarSlot(page, pageLoadStates, pagesIndex)}
        </Box>
    ),
);
