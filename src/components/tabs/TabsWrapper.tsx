/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Box, styled } from '@mui/material';

export const TabsWrapper = styled(Box)(({ theme }) => ({
    // TabsMenu height + TabsMenu bottom padding - grid item top padding
    marginTop: `calc(48px + 13px - 8px)`,
    // header height - TabsMenu height - TabsMenu bottom padding + grid item top padding
    minHeight: 'calc(100vh - 64px - 48px - 13px + 8px)',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
        // TabsMenu - 8px margin diff header height (56px) + TabsMenu bottom padding - grid item top padding
        marginTop: `calc(48px - 8px + 13px - 8px)`,
        // header height (+ 8px margin) - footer height - TabsMenu height
        minHeight: 'calc(100vh - 64px - 64px - 48px)',
    },
}));
