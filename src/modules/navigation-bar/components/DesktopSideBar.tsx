/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import { styled, useTheme } from '@mui/material/styles';
import { useCallback, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import { ListItemLink } from '@/modules/core/components/ListItemLink.tsx';
import { useGetOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { NavbarItem } from '@/modules/navigation-bar/NavigationBar.types.ts';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const NavigationBarItem = ({ path, title, IconComponent, SelectedIconComponent }: NavbarItem) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { isCollapsed } = useNavBarContext();
    const theme = useTheme();

    const isActive = path === location.pathname;
    const Icon = isActive ? SelectedIconComponent : IconComponent;

    const { listItemProps, listItemIconProps } = useMemo(
        () => ({
            listItemProps: isCollapsed ? { p: 0.5, display: 'flex', flexDirection: 'column' } : {},
            listItemIconProps: isCollapsed ? { justifyContent: 'center' } : {},
        }),
        [isCollapsed],
    );

    return (
        <ListItemLink selected={!isCollapsed && isActive} sx={{ p: 0, m: 0 }} to={path}>
            <Tooltip title={t(title)} placement="right">
                <ListItem sx={listItemProps}>
                    <ListItemIcon sx={listItemIconProps}>
                        <Icon
                            sx={{
                                color: isActive ? 'primary.dark' : undefined,
                                ...theme.applyStyles('dark', {
                                    color: isActive ? 'primary.light' : undefined,
                                }),
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={t(title)}
                        sx={{ maxWidth: '100%' }}
                        primaryTypographyProps={{
                            sx: {
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                ...(isCollapsed ? theme.typography.caption : {}),
                                color: isActive ? 'primary.dark' : undefined,
                                ...theme.applyStyles('dark', {
                                    color: isActive ? 'primary.light' : undefined,
                                }),
                            },
                        }}
                    />
                </ListItem>
            </Tooltip>
        </ListItemLink>
    );
};

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
