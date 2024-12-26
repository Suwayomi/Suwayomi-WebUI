/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, ReactNode, useCallback, useMemo, useState } from 'react';
import { Direction, useTheme } from '@mui/material/styles';
import { useAutomaticScrolling } from '@/modules/core/hooks/useAutomaticScrolling.ts';
import { IReaderSettings, TReaderAutoScrollContext } from '@/modules/reader/types/Reader.types.ts';
import { ReaderAutoScrollContext } from '@/modules/reader/contexts/ReaderAutoScrollContext.tsx';
import { ReaderControls } from '@/modules/reader/services/ReaderControls';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import {
    CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION,
    ReaderScrollAmount,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';

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

    const invertScrolling = themeDirection !== combinedDirection;
    const isContinuousReadingModeActive = isContinuousReadingMode(readingMode);

    const changePage = useCallback(() => {
        openPage('next');
    }, []);

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
