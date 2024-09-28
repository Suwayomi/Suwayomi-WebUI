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

export const ReaderProgressBarCurrentPageSlot = ({
    pageName,
    currentPagesIndex,
    pagesLength,
    isDragging,
    setIsDragging,
    boxProps,
    children,
}: CurrentPageSlotProps & { children?: ReactNode }) => (
    <Tooltip
        title={pageName}
        slotProps={{
            tooltip: { sx: { backgroundColor: 'primary.main', color: 'primary.contrastText' } },
        }}
        placement="top"
    >
        <Box
            {...boxProps}
            sx={{
                position: 'absolute',
                left: `${(Math.max(0, currentPagesIndex) / pagesLength) * 100}%`,
                width: `calc(100% / ${pagesLength})`,
                height: '100%',
                cursor: isDragging ? 'grabbing' : 'grab',
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
