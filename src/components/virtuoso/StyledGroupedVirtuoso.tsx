/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material';
import { GroupedVirtuoso } from 'react-virtuoso';

export const StyledGroupedVirtuoso = styled(GroupedVirtuoso, {
    shouldForwardProp: (prop) => prop !== 'heightToSubtract',
})<{
    heightToSubtract?: number;
}>(({ theme, heightToSubtract = 0 }) => ({
    // 64px header
    height: `calc(100vh - 64px - ${heightToSubtract}px)`,
    [theme.breakpoints.down('sm')]: {
        // 64px header (margin); 64px menu (margin);
        height: `calc(100vh - 64px - 64px - ${heightToSubtract}px)`,
    },
}));
