/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export const TabsWrapper = ({ children, ...props }: BoxProps) => (
    <Box {...props} sx={MUIUtil.mergeSx(props.sx, { position: 'relative', height: `100%` })}>
        {children}
    </Box>
);
