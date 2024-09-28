/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TooltipProps } from '@mui/material/Tooltip';
import { ProgressBarPosition } from '@/modules/reader/types/Reader.types.ts';

export const READER_PROGRESS_BAR_POSITION_TO_PLACEMENT: Record<ProgressBarPosition, TooltipProps['placement']> = {
    [ProgressBarPosition.BOTTOM]: 'top',
    [ProgressBarPosition.LEFT]: 'right',
    [ProgressBarPosition.RIGHT]: 'left',
};
