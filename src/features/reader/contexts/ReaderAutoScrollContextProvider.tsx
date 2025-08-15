/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, ReactNode, useCallback, useMemo, useState } from 'react';
import { Direction, useTheme } from '@mui/material/styles';
import { useAutomaticScrolling } from '@/features/core/hooks/useAutomaticScrolling.ts';
import {
    IReaderSettings,
    ReaderScrollAmount,
    ReadingMode,
    TReaderAutoScrollContext,
} from '@/features/reader/types/Reader.types.ts';
import { ReaderAutoScrollContext } from '@/features/reader/contexts/ReaderAutoScrollContext.tsx';
import { ReaderControls } from '@/features/reader/services/ReaderControls';
import { isContinuousReadingMode } from '@/features/reader/utils/ReaderSettings.utils.tsx';
import { withPropsFrom } from '@/features/core/hoc/withPropsFrom.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION } from '@/features/reader/constants/ReaderSettings.constants.tsx';
import { ScrollOffset } from '@/features/core/Core.types.ts';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';

const BaseReaderAutoScrollContextProvider = ({
    children,
    openPage,
    readingMode,
    autoScroll,
    themeDirection,
    combinedDirection,
}: Pick<IReaderSettings, 'readingMode' | 'autoScroll'> & {
    children: ReactNode;
    openPage: ReturnType<typeof ReaderControls.useOpenPage>;
    themeDirection: Direction;
    combinedDirection: Direction;
}) => {
    const [scrollRef, setScrollRef] = useState<TReaderAutoScrollContext['scrollRef']>();
    const [direction, setDirection] = useState<ScrollOffset>(ScrollOffset.FORWARD);

    const isScrollingInvertedBasedOnReadingDirection =
        readingMode === ReadingMode.CONTINUOUS_HORIZONTAL && themeDirection !== combinedDirection;
    const invertScrolling = isScrollingInvertedBasedOnReadingDirection
        ? getOptionForDirection(
              direction === ScrollOffset.BACKWARD,
              direction === ScrollOffset.FORWARD,
              combinedDirection,
          )
        : direction === ScrollOffset.BACKWARD;
    const isContinuousReadingModeActive = isContinuousReadingMode(readingMode);

    const changePage = useCallback(() => {
        openPage('next', 'ltr');
    }, [openPage]);

    const automaticScrolling = useAutomaticScrolling(
        isContinuousReadingModeActive ? scrollRef : changePage,
        autoScroll.value,
        CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode],
        ReaderScrollAmount.MEDIUM,
        invertScrolling,
        autoScroll.smooth,
    );

    const value = useMemo(
        () => ({
            scrollRef,
            setScrollRef,
            setDirection,
            ...automaticScrolling,
        }),
        [scrollRef, automaticScrolling],
    );

    return <ReaderAutoScrollContext.Provider value={value}>{children}</ReaderAutoScrollContext.Provider>;
};

export const ReaderAutoScrollContextProvider = withPropsFrom(
    memo(BaseReaderAutoScrollContextProvider),
    [
        ReaderService.useSettingsWithoutDefaultFlag,
        () => ({ openPage: ReaderControls.useOpenPage() }),
        () => ({ themeDirection: useTheme().direction }),
        () => ({ combinedDirection: ReaderService.useGetThemeDirection() }),
    ],
    ['openPage', 'readingMode', 'themeDirection', 'combinedDirection', 'autoScroll'],
);
