/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { ReactNode } from 'react';
import { CurrentPageSlotProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { READER_PROGRESS_BAR_POSITION_TO_PLACEMENT } from '@/modules/reader/constants/ReaderProgressBar.constants.ts';
import { getProgressBarPositionInfo } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

export const ReaderProgressBarCurrentPageSlot = ({
    pageName,
    currentPagesIndex,
    pagesLength,
    isDragging,
    setIsDragging,
    boxProps,
    children,
    progressBarPosition,
}: CurrentPageSlotProps & { children?: ReactNode }) => (
    <Tooltip
        title={pageName}
        slotProps={{
            tooltip: { sx: { backgroundColor: 'primary.main', color: 'primary.contrastText' } },
        }}
        placement={READER_PROGRESS_BAR_POSITION_TO_PLACEMENT[progressBarPosition]}
    >
        <Box
            {...boxProps}
            sx={{
                position: 'absolute',
                cursor: isDragging ? 'grabbing' : 'grab',
                ...applyStyles(getProgressBarPositionInfo(progressBarPosition).isHorizontal, {
                    left: `${(Math.max(0, currentPagesIndex) / pagesLength) * 100}%`,
                    width: `calc(100% / ${pagesLength})`,
                    height: '100%',
                }),
                ...applyStyles(getProgressBarPositionInfo(progressBarPosition).isVertical, {
                    top: `${(Math.max(0, currentPagesIndex) / pagesLength) * 100}%`,
                    width: '100%',
                    height: `calc(100% / ${pagesLength})`,
                }),
                ...boxProps?.sx,
            }}
            onTouchEnd={(e) => {
                e.stopPropagation();
                setIsDragging(false);
            }}
            onTouchStart={(e) => {
                e.stopPropagation();
                setIsDragging(true);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                setIsDragging(false);
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
            }}
        >
            {children}
        </Box>
    </Tooltip>
);
