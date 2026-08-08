/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { TabsProps } from '@mui/material/Tabs';
import Tabs from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';

const StyledTabsMenu = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    backgroundColor: theme.palette.background.default,
    border: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
}));

export const TabsMenu = ({ children, ...props }: TabsProps) => (
    <StyledTabsMenu
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        {...props}
    >
        {children}
    </StyledTabsMenu>
);
