/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material/styles';
import Typography, { TypographyProps } from '@mui/material/Typography';

export const StyledGroupHeader = styled(Typography, { shouldForwardProp: (prop) => prop !== 'isFirstItem' })<
    {
        isFirstItem: boolean;
    } & TypographyProps
>(({ theme, isFirstItem }) => ({
    paddingLeft: theme.spacing(3),
    // 16px - 10px (bottom padding of the group items)
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(2),
    fontWeight: 'bold',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        // 16px - 8px (margin of header)
        paddingTop: isFirstItem ? theme.spacing(1) : theme.spacing(0.75),
    },
}));
