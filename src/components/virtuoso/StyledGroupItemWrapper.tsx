/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledGroupItemWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== 'isLastItem' })<{
    isLastItem: boolean;
}>(({ isLastItem }) => ({
    padding: '0 10px',
    paddingBottom: isLastItem ? '0' : '10px',
}));
