/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ExploreIcon from '@mui/icons-material/Explore';
import GetAppIcon from '@mui/icons-material/GetApp';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useHistory } from 'react-router-dom';
import NavBarContext from 'context/NavbarContext';
import DarkTheme from 'context/DarkTheme';
import PermanentSideBar from './PermanentSideBar';
import BottomNavigationBar from './BottomNavigationBar';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

const navbarItems: Array<NavbarItem> = [
    {
        path: '/library',
        title: 'Library',
        IconComponent: CollectionsBookmarkIcon,
    },
    {
        path: '/updates',
        title: 'Updates',
        IconComponent: NewReleasesIcon,
    }, {
        path: '/browse',
        title: 'Browse',
        IconComponent: ExploreIcon,
    }, {
        path: '/downloads',
        title: 'Downloads',
        IconComponent: GetAppIcon,
    }, {
        path: '/settings',
        title: 'Settings',
        IconComponent: SettingsIcon,
    },
];

export default function NavBar() {
    const classes = useStyles();
    const { title, action, override } = useContext(NavBarContext);
    const theme = useTheme();
    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));
    const history = useHistory();
    const isMainRoute = navbarItems.some(({ path }) => path === history.location.pathname);

    const { darkTheme } = useContext(DarkTheme);

    return (
        <>
            {override.status && override.value}
            {!override.status
    && (
        <div className={classes.root}>
            <AppBar position="fixed" color={darkTheme ? 'default' : 'primary'}>
                <Toolbar>
                    {
                        !navbarItems.some(({ path }) => path === history.location.pathname)
                            && (
                                <IconButton
                                    edge="start"
                                    className={classes.menuButton}
                                    color="inherit"
                                    aria-label="menu"
                                    disableRipple
                                    // when page is opened in new tab backbutton will
                                    // take you to the library
                                    onClick={() => (history.length === 1 ? history.push('/library') : history.goBack())}
                                    size="large"
                                >
                                    <ArrowBack />
                                </IconButton>
                            )
                    }
                    <Typography variant={isMobileWidth ? 'h6' : 'h5'} className={classes.title}>
                        {title}
                    </Typography>
                    {action}
                </Toolbar>
            </AppBar>
            {
                isMainRoute
            && (
                isMobileWidth
                    ? <BottomNavigationBar navBarItems={navbarItems} />
                    : <PermanentSideBar navBarItems={navbarItems} />)
            }
        </div>
    )}
        </>
    );
}
