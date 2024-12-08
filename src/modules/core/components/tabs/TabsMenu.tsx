/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tabs, { TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import { ForwardedRef, forwardRef } from 'react';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

const StyledTabsMenu = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    position: 'sticky',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
    border: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
}));

export const TabsMenu = forwardRef(
    ({ children, sx, ...props }: TabsProps, ref: ForwardedRef<HTMLDivElement | null>) => {
        const { appBarHeight } = useNavBarContext();

        return (
            <StyledTabsMenu
                sx={{ ...sx, top: appBarHeight }}
                ref={ref}
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
    },
);
