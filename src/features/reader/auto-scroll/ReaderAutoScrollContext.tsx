/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Direction, useTheme } from '@mui/material/styles';
import {
    IReaderSettings,
    ReaderScrollAmount,
    ReadingMode,
    TReaderAutoScrollContext,
} from '@/features/reader/Reader.types.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ScrollOffset } from '@/base/Base.types.ts';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { isContinuousReadingMode } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import { useAutomaticScrolling } from '@/base/hooks/useAutomaticScrolling.ts';
import { CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';

export const ReaderAutoScrollContext = createContext<TReaderAutoScrollContext>({
    isActive: false,
    isPaused: false,
    setScrollRef: () => {},
    start: () => {},
    cancel: () => {},
    toggleActive: () => {},
    pause: () => {},
    resume: () => {},
    setDirection: () => {},
});

export const useReaderAutoScrollContext = () => useContext(ReaderAutoScrollContext);

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
