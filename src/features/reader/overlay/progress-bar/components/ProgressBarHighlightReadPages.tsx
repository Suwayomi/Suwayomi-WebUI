/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { applyCSS, applyStyles } from '@/base/utils/ApplyStyles.ts';
import { getProgressBarPositionInfo } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { memo } from 'react';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

type ProgressBarHighlightReadPagesProps = Pick<IReaderSettings, 'progressBarPosition'> & {
    currentPagesIndex: number;
    pagesLength: number;
};

export const ProgressBarHighlightReadPages = memo(
    ({
        currentPagesIndex,
        pagesLength,
        progressBarPosition,
        ...boxProps
    }: BoxProps & ProgressBarHighlightReadPagesProps) => (
        <Box
            {...boxProps}
            sx={MUIUtil.mergeSx(
                {
                    position: 'absolute',
                    pointerEvents: 'none',
                    ...applyStyles(getProgressBarPositionInfo(progressBarPosition).isHorizontal, {
                        left: 0,
                        height: '100%',
                    }),
                    ...applyStyles(getProgressBarPositionInfo(progressBarPosition).isVertical, {
                        top: 0,
                        width: '100%',
                    }),
                },
                boxProps.sx,
            )}
            style={{
                ...applyCSS(getProgressBarPositionInfo(progressBarPosition).isHorizontal, {
                    width: `${((currentPagesIndex + 1) / pagesLength) * 100}%`,
                }),
                ...applyCSS(getProgressBarPositionInfo(progressBarPosition).isVertical, {
                    height: `${((currentPagesIndex + 1) / pagesLength) * 100}%`,
                }),
                ...boxProps.style,
            }}
        />
    ),
);
