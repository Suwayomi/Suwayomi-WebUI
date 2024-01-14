/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material';
import Typography from '@mui/material/Typography';

export const StyledGroupHeader = styled(Typography, { shouldForwardProp: (prop) => prop !== 'isFirstItem' })<{
    isFirstItem: boolean;
}>(({ theme, isFirstItem }) => ({
    paddingLeft: '24px',
    // 16px - 10px (bottom padding of the group items)
    paddingTop: '6px',
    paddingBottom: '16px',
    fontWeight: 700,
    textTransform: 'uppercase',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        // 16px - 8px (margin of header)
        paddingTop: isFirstItem ? '8px' : '6px',
    },
}));
