/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tabs, { TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';

const StyledTabsMenu = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    position: 'fixed',
    top: '64px',
    width: 'calc(100% - 64px)',
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
    border: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    [theme.breakpoints.down('sm')]: {
        top: '56px', // header height
        width: '100%',
    },
}));

export const TabsMenu = ({ children, tabsCount, ...props }: TabsProps & { tabsCount: number }) => {
    // Visual Hack: 160px is min-width for viewport width of >600
    const scrollableTabs = window.innerWidth < tabsCount * 160;

    return (
        <StyledTabsMenu
            {...props}
            indicatorColor="primary"
            textColor="primary"
            centered={!scrollableTabs}
            variant={scrollableTabs ? 'scrollable' : 'fullWidth'}
            scrollButtons
            allowScrollButtonsMobile
        >
            {children}
        </StyledTabsMenu>
    );
};
