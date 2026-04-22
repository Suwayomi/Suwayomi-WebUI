/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import { useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { NavigationBarItem } from '@/features/navigation-bar/components/NavigationBarItem.tsx';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const MIN_WIDTH_COLLAPSED = undefined;
const MAX_WIDTH_COLLAPSED = 120;
const MIN_WIDTH_EXTENDED = 240;
const MAX_WIDTH_EXTENDED = 400;

export const DesktopSideBar = ({ navBarItems }: { navBarItems: NavbarItem[] }) => {
    const { isCollapsed, setIsCollapsed, navBarWidth, setNavBarWidth } = useNavBarContext();
    const getOptionForDirection = useGetOptionForDirection();

    const ref = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        ref,
        useCallback(() => setNavBarWidth(ref.current?.clientWidth ?? 0), [ref.current]),
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: navBarWidth,
                '& .MuiDrawer-paper': {
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                },
            }}
            PaperProps={{
                ref,
            }}
        >
            <Box
                sx={{
                    pt: 'env(safe-area-inset-top)',
                    pl: 'env(safe-area-inset-left)',
                    minWidth: isCollapsed ? MIN_WIDTH_COLLAPSED : MIN_WIDTH_EXTENDED,
                    maxWidth: isCollapsed ? MAX_WIDTH_COLLAPSED : MAX_WIDTH_EXTENDED,
                }}
            >
                <DrawerHeader>
                    <IconButton onClick={() => setIsCollapsed(true)}>
                        {getOptionForDirection(<ChevronLeftIcon />, <ChevronRightIcon />)}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List sx={{ p: 1 }} dense={isCollapsed}>
                    {navBarItems.map((navBarItem) => (
                        <NavigationBarItem key={navBarItem.path} {...navBarItem} />
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};
