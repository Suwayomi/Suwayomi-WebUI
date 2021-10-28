/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {
    List, ListItem, ListItemIcon, Tooltip,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
    sideBar: {
        height: '100vh',
        width: theme.spacing(8),
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        position: 'fixed',
        top: 0,
        left: 0,
        paddingTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadows[5],
    },
    tooltip: {
        fontSize: '0.8rem',
    },
}));

interface IProps {
    navBarItems: Array<NavbarItem>
}

export default function PermanentSideBar({ navBarItems }: IProps) {
    const location = useLocation();
    const classes = useStyles();
    const theme = useTheme();
    return (
        <List className={classes.sideBar}>
            {
                // eslint-disable-next-line react/destructuring-assignment
                navBarItems.map(({ path, title, IconComponent }: NavbarItem) => (
                    <Link to={path} style={{ color: 'inherit', textDecoration: 'none' }} key={path}>
                        <ListItem button key={title}>
                            <ListItemIcon style={{ minWidth: '0' }}>

                                <Tooltip placement="right" classes={{ tooltip: classes.tooltip }} title={title}>
                                    <IconComponent color={location.pathname === path ? 'primary' : theme.palette.grey.A400} fontSize="large" />
                                </Tooltip>

                            </ListItemIcon>
                        </ListItem>
                    </Link>
                ))
            }
        </List>
    );
}
