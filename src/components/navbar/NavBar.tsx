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
import NavBarContext from '../../context/NavbarContext';
import DarkTheme from '../../context/DarkTheme';
import TemporaryDrawer from '../TemporaryDrawer';

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

export default function NavBar() {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { title, action, override } = useContext(NavBarContext);

    const { darkTheme } = useContext(DarkTheme);

    return (
        <>
            {override.status && override.value}
            {!override.status
    && (
        <div className={classes.root}>
            <AppBar position="fixed" color={darkTheme ? 'default' : 'primary'}>
                <Toolbar>
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
                    <Typography variant="h6" className={classes.title}>
                        {title}
                    </Typography>
                    {action}
                </Toolbar>
            </AppBar>
            <TemporaryDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
        </div>
    )}
        </>
    );
}
