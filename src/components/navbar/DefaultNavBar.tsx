/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { NavbarItem } from '@/typings';
import { NavBarContext } from '@/components/context/NavbarContext';
import { DesktopSideBar } from '@/components/navbar/navigation/DesktopSideBar';
import { MobileBottomBar } from '@/components/navbar/navigation/MobileBottomBar';
import { useBackButton } from '@/util/useBackButton.ts';
import { getOptionForDirection } from '@/theme.ts';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';

const navbarItems: Array<NavbarItem> = [
    {
        path: '/library',
        title: 'library.title',
        SelectedIconComponent: CollectionsBookmarkIcon,
        IconComponent: CollectionsOutlinedBookmarkIcon,
        show: 'both',
    },
    {
        path: '/updates',
        title: 'updates.title',
        SelectedIconComponent: NewReleasesIcon,
        IconComponent: NewReleasesOutlinedIcon,
        show: 'both',
    },
    {
        path: '/browse',
        title: 'global.label.browse',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'both',
    },
    {
        path: '/downloads',
        title: 'download.title',
        SelectedIconComponent: GetAppIcon,
        IconComponent: GetAppOutlinedIcon,
        show: 'both',
    },
    {
        path: '/settings',
        title: 'settings.title',
        SelectedIconComponent: SettingsIcon,
        IconComponent: SettingsIcon,
        show: 'both',
    },
];

export function DefaultNavBar() {
    const { title, action, override } = useContext(NavBarContext);

    const { pathname } = useLocation();
    const handleBack = useBackButton();

    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const isMainRoute = navbarItems.some(({ path }) => path === pathname);

    // Allow default navbar to be overrided
    if (override.status) return override.value;

    let navbar: JSX.Element | null = null;
    if (isMobileWidth) {
        if (isMainRoute) {
            navbar = <MobileBottomBar navBarItems={navbarItems.filter((it) => it.show !== 'desktop')} />;
        }
    } else {
        navbar = <DesktopSideBar navBarItems={navbarItems.filter((it) => it.show !== 'mobile')} />;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" color="default">
                <Toolbar>
                    {!isMainRoute && (
                        <IconButton
                            component="button"
                            edge="start"
                            sx={{ marginRight: 2 }}
                            color="inherit"
                            aria-label="menu"
                            size="large"
                            onClick={handleBack}
                        >
                            {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                        </IconButton>
                    )}
                    <Typography
                        variant={isMobileWidth ? 'h6' : 'h5'}
                        sx={{ flexGrow: 1 }}
                        noWrap
                        textOverflow="ellipsis"
                    >
                        {title}
                    </Typography>
                    {action}
                    <div id="navbarToolbar" />
                </Toolbar>
            </AppBar>
            {navbar}
        </Box>
    );
}

interface INavbarToolbarProps {
    children?: React.ReactNode;
}

export const NavbarToolbar: React.FC<INavbarToolbarProps> = ({ children }) => {
    const container = document.getElementById('navbarToolbar');
    if (!container) return null;

    return createPortal(children, container);
};
