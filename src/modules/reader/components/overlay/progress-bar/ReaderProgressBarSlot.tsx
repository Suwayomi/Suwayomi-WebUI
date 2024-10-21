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
import { ReaderProgressBarSlotProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { READER_PROGRESS_BAR_POSITION_TO_PLACEMENT } from '@/modules/reader/constants/ReaderProgressBar.constants.ts';

export const ReaderProgressBarSlot = ({
    pageName,
    boxProps,
    children,
    progressBarPosition,
}: ReaderProgressBarSlotProps & { children?: ReactNode }) => (
    <Tooltip key={pageName} title={pageName} placement={READER_PROGRESS_BAR_POSITION_TO_PLACEMENT[progressBarPosition]}>
        <Box {...boxProps} sx={{ width: '100%', height: '100%', ...boxProps?.sx }}>
            {children}
        </Box>
    </Tooltip>
);
