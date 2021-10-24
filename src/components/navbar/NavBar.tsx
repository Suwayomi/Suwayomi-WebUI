/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ExtensionIcon from '@mui/icons-material/Extension';
import ExploreIcon from '@mui/icons-material/Explore';
import GetAppIcon from '@mui/icons-material/GetApp';
import SettingsIcon from '@mui/icons-material/Settings';
import TemporaryDrawer from 'components/TemporaryDrawer';
import NavBarContext from '../../context/NavbarContext';
import DarkTheme from '../../context/DarkTheme';
import PermanentSideBar from './PermanentSideBar';

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
        text: 'Library',
        IconComponent: CollectionsBookmarkIcon,
    },
    {
        path: '/updates',
        text: 'Updates',
        IconComponent: NewReleasesIcon,
    }, {
        path: '/manga/extensions',
        text: 'Extensions',
        IconComponent: ExtensionIcon,
    }, {
        path: '/manga/sources',
        text: 'Sources',
        IconComponent: ExploreIcon,
    }, {
        path: '/manga/downloads',
        text: 'Manga Download Queue',
        IconComponent: GetAppIcon,
    }, {
        path: '/settings',
        text: 'Settings',
        IconComponent: SettingsIcon,
    },
];

export default function NavBar() {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { title, action, override } = useContext(NavBarContext);
    const theme = useTheme();
    const match = useMediaQuery(theme.breakpoints.down('sm'));

    const { darkTheme } = useContext(DarkTheme);

    return (
        <>
            {override.status && override.value}
            {!override.status
    && (
        <div className={classes.root}>
            <AppBar position="fixed" color={darkTheme ? 'default' : 'primary'}>
                <Toolbar>
                    {match && (
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            disableRipple
                            onClick={() => setDrawerOpen(true)}
                            size="large"
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" className={classes.title}>
                        {title}
                    </Typography>
                    {action}
                </Toolbar>
            </AppBar>
            {match ? (
                <TemporaryDrawer
                    navBarItems={navbarItems}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                />
            )
                : <PermanentSideBar navBarItems={navbarItems} />}
        </div>
    )}
        </>
    );
}
