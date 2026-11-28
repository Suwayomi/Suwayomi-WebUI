/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect } from 'react';
import type { Direction } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { ReaderScrollAmount, ReadingMode } from '@/models/reader/Reader.types.ts';
import { ReaderControls } from '@/controllers/reader/services/ReaderControls.ts';
import { ScrollOffset } from '@/models/base/Base.types.ts';
import { getOptionForDirection } from '@/controllers/theme/services/ThemeCreator.ts';
import { isContinuousReadingMode } from '@/utils/reader/settings/ReaderSettings.utils.tsx';
import { useAutomaticScrolling } from '@/controllers/base/hooks/useAutomaticScrolling.ts';
import { CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION } from '@/models/reader/settings/ReaderSettings.constants.tsx';
import { withPropsFrom } from '@/hoc/base/withPropsFrom.tsx';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import {
    getReaderAutoScrollStore,
    useReaderAutoScrollStore,
    useReaderSettingsStore,
} from '@/controllers/reader/stores/ReaderStore.ts';

const BaseReaderAutoScroll = ({
    themeDirection,
    combinedDirection,
}: {
    themeDirection: Direction;
    combinedDirection: Direction;
}) => {
    const { scrollRef, direction } = useReaderAutoScrollStore('scrollRef', 'direction');
    const { readingMode, autoScroll } = useReaderSettingsStore((state) => ({
        readingMode: state.readingMode.value,
        autoScroll: state.autoScroll,
    }));

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
        ReaderControls.openPage('next', 'ltr');
    }, []);

    const automaticScrolling = useAutomaticScrolling(
        isContinuousReadingModeActive ? scrollRef : changePage,
        autoScroll.value,
        CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode],
        ReaderScrollAmount.MEDIUM,
        invertScrolling,
        autoScroll.smooth,
    );

    useEffect(() => {
        const autoScrollStore = getReaderAutoScrollStore();

        autoScrollStore.setIsActive(automaticScrolling.isActive);
        autoScrollStore.setIsPaused(automaticScrolling.isPaused);
        autoScrollStore.setStart(automaticScrolling.start);
        autoScrollStore.setCancel(automaticScrolling.cancel);
        autoScrollStore.setToggleActive(automaticScrolling.toggleActive);
        autoScrollStore.setPause(automaticScrolling.pause);
        autoScrollStore.setResume(automaticScrolling.resume);
    }, [automaticScrolling]);

    return null;
};

export const ReaderAutoScroll = withPropsFrom(
    memo(BaseReaderAutoScroll),
    [
        () => ({ themeDirection: useTheme().direction }),
        () => ({ combinedDirection: ReaderService.useGetThemeDirection() }),
    ],
    ['themeDirection', 'combinedDirection'],
);
