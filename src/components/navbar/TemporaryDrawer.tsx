/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
    list: {
        width: 250,
    },
});

interface IProps {
    drawerOpen: boolean

    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
    navBarItems: Array<NavbarItem>
}

export default function TemporaryDrawer({ drawerOpen, setDrawerOpen, navBarItems }: IProps) {
    const classes = useStyles();

    return (
        <div>
            <Drawer
                open={drawerOpen}
                anchor="left"
                onClose={() => setDrawerOpen(false)}
            >
                <div
                    className={classes.list}
                    role="presentation"
                    onClick={() => setDrawerOpen(false)}
                    onKeyDown={() => setDrawerOpen(false)}
                >
                    <List>
                        {navBarItems.map((({ path, title, IconComponent }: NavbarItem) => (
                            <Link to={path} style={{ color: 'inherit', textDecoration: 'none' }}>
                                <ListItem button key={title}>
                                    <ListItemIcon>
                                        <IconComponent />
                                    </ListItemIcon>
                                    <ListItemText primary={title} />
                                </ListItem>
                            </Link>
                        )))}
                    </List>
                </div>
            </Drawer>
        </div>
    );
}
