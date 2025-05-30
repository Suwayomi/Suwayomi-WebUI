/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useLayoutEffect } from 'react';
import { Direction } from '@mui/material/styles';
import { ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { getScrollToXForReadingDirection } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';

export const useReaderScrollToStartOnPageChange = (
    currentPageIndex: ReaderStatePages['currentPageIndex'],
    isContinuousReadingModeActive: boolean,
    themeDirection: Direction,
    readingDirection: ReadingDirection,
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
): void => {
    useLayoutEffect(() => {
        if (!isContinuousReadingModeActive) {
            scrollElementRef.current?.scrollTo(
                getScrollToXForReadingDirection(scrollElementRef.current, themeDirection, readingDirection),
                0,
            );
        }
    }, [currentPageIndex]);
};
