/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { shouldForwardProp } from '@/modules/core/utils/ShouldForwardProp.ts';

type ProgressBarHighlightReadPagesProps = { currentPagesIndex: number; pagesLength: number };
export const ProgressBarHighlightReadPages = styled(Box, {
    shouldForwardProp: shouldForwardProp<ProgressBarHighlightReadPagesProps>(['currentPagesIndex', 'pagesLength']),
})<ProgressBarHighlightReadPagesProps>(({ currentPagesIndex, pagesLength }) => ({
    position: 'absolute',
    left: 0,
    width: `${((currentPagesIndex + 1) / pagesLength) * 100}%`,
    height: '100%',
    pointerEvents: 'none',
}));
