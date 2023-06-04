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
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExtensionIcon from '@mui/icons-material/Extension';
import GetAppIcon from '@mui/icons-material/GetApp';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { NavbarItem } from '@/typings';
import useBackTo from '@/util/useBackTo';
import NavBarContext from '@/components/context/NavbarContext';
import ExtensionOutlinedIcon from '@/components/util/CustomExtensionOutlinedIcon';
import DesktopSideBar from '@/components/navbar/navigation/DesktopSideBar';
import MobileBottomBar from '@/components/navbar/navigation/MobileBottomBar';

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
        path: '/extensions',
        title: 'extension.title',
        SelectedIconComponent: ExtensionIcon,
        IconComponent: ExtensionOutlinedIcon,
        show: 'desktop',
    },
    {
        path: '/sources',
        title: 'source.title',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'desktop',
    },
    {
        path: '/browse',
        title: 'global.label.browse',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'mobile',
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

export default function DefaultNavBar() {
    const { title, action, override } = useContext(NavBarContext);
    const backTo = useBackTo();

    const theme = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));
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

    const handleBack = () => {
        if (backTo.url != null) return;
        navigate(-1);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" color="default">
                <Toolbar>
                    {!isMainRoute && (
                        <IconButton
                            component={backTo.url ? Link : 'button'}
                            to={backTo.url}
                            edge="start"
                            sx={{ marginRight: theme.spacing(2) }}
                            color="inherit"
                            aria-label="menu"
                            disableRipple
                            size="large"
                            onClick={handleBack}
                        >
                            <ArrowBack />
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
