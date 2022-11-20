/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useMediaQuery } from '@mui/material';
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
import { Link, useHistory } from 'react-router-dom';
import NavBarContext from 'components/context/NavbarContext';
import DarkTheme from 'components/context/DarkTheme';
import ExtensionOutlinedIcon from 'components/util/CustomExtensionOutlinedIcon';
import { Box } from '@mui/system';
import { createPortal } from 'react-dom';
import useBackTo from 'util/useBackTo';
import DesktopSideBar from './navigation/DesktopSideBar';
import MobileBottomBar from './navigation/MobileBottomBar';

const navbarItems: Array<NavbarItem> = [
    {
        path: '/library',
        title: 'Library',
        SelectedIconComponent: CollectionsBookmarkIcon,
        IconComponent: CollectionsOutlinedBookmarkIcon,
        show: 'both',
    }, {
        path: '/updates',
        title: 'Updates',
        SelectedIconComponent: NewReleasesIcon,
        IconComponent: NewReleasesOutlinedIcon,
        show: 'both',
    }, {
        path: '/extensions',
        title: 'Extensions',
        SelectedIconComponent: ExtensionIcon,
        IconComponent: ExtensionOutlinedIcon,
        show: 'desktop',
    }, {
        path: '/sources',
        title: 'Sources',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'desktop',
    }, {
        path: '/browse',
        title: 'Browse',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'mobile',
    }, {
        path: '/downloads',
        title: 'Downloads',
        SelectedIconComponent: GetAppIcon,
        IconComponent: GetAppOutlinedIcon,
        show: 'both',
    }, {
        path: '/settings',
        title: 'Settings',
        SelectedIconComponent: SettingsIcon,
        IconComponent: SettingsIcon,
        show: 'both',
    },
];

export default function DefaultNavBar() {
    const { title, action, override } = useContext(NavBarContext);
    const backTo = useBackTo();
    const { darkTheme } = useContext(DarkTheme);

    const theme = useTheme();
    const history = useHistory();

    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));
    const isMainRoute = navbarItems.some(({ path }) => path === history.location.pathname);

    // Allow default navbar to be overrided
    if (override.status) return override.value;

    let navbar = <></>;
    if (isMobileWidth) {
        if (isMainRoute) {
            navbar = <MobileBottomBar navBarItems={navbarItems.filter((it) => it.show !== 'desktop')} />;
        }
    } else {
        navbar = <DesktopSideBar navBarItems={navbarItems.filter((it) => it.show !== 'mobile')} />;
    }

    const handleBack = () => {
        if (backTo.url != null) return;
        history.goBack();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" color={darkTheme ? 'default' : 'primary'}>
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
                    <Typography variant={isMobileWidth ? 'h6' : 'h5'} sx={{ flexGrow: 1 }} noWrap textOverflow="ellipsis">
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
    children?: React.ReactNode
}

export const NavbarToolbar: React.FC<INavbarToolbarProps> = ({ children }) => {
    const container = document.getElementById('navbarToolbar');
    if (!container) return null;

    return createPortal(children, container);
};
