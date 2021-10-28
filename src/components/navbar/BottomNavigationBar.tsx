/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
    Box, ListItem,
} from '@mui/material';
import { styled } from '@mui/system';
import { Link, useLocation } from 'react-router-dom';

const BottomNavContainer = styled('div')(({ theme }) => ({
    bottom: 0,
    left: 0,
    height: theme.spacing(7),
    width: '100vw',
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // For Some reason the theme is throwing and error when accessing the Zindex object,
    // This is the zIndex of the appBar in the default theme
    zIndex: 1100,
}));

interface IProps {
    navBarItems: Array<NavbarItem>
}

export default function BottomNavigationBar({ navBarItems }: IProps) {
    const location = useLocation();
    return (
        <BottomNavContainer>
            {
                navBarItems.map(({ path, title, IconComponent }: NavbarItem) => (
                    <Link to={path} style={{ flex: 1 }} key={path}>
                        <ListItem disableRipple button style={{ justifyContent: 'center', padding: '8px' }} key={title}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                // if we are on the same path then make the icon active
                                color: location.pathname === path
                                    ? 'primary.main'
                                    : 'grey.A400',
                            }}
                            >
                                <IconComponent fontSize="medium" />
                                <div style={{ fontSize: '0.65rem' }}>{title}</div>
                            </Box>
                        </ListItem>
                    </Link>
                ))
            }
        </BottomNavContainer>
    );
}
