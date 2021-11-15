/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ListItem, ListItemIcon, Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';

const SideNavBarContainer = styled('div')(({ theme }) => ({
    height: '100vh',
    width: theme.spacing(8),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
    position: 'fixed',
    top: 0,
    left: 0,
    paddingTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
}));

interface IProps {
    navBarItems: Array<NavbarItem>
}

export default function DesktopSideBar({ navBarItems }: IProps) {
    const location = useLocation();
    const theme = useTheme();

    const iconFor = (path: string, IconComponent: any, SelectedIconComponent: any) => {
        if (location.pathname === path) return <SelectedIconComponent sx={{ color: 'primary.main' }} fontSize="large" />;
        return <IconComponent sx={{ color: (theme.palette.mode === 'dark') ? 'grey.A400' : 'grey.600' }} fontSize="large" />;
    };

    return (
        <SideNavBarContainer>
            {
                // eslint-disable-next-line react/destructuring-assignment
                navBarItems.map(({
                    path, title, IconComponent, SelectedIconComponent,
                }: NavbarItem) => (
                    <Link to={path} style={{ color: 'inherit', textDecoration: 'none' }} key={path}>
                        <ListItem disableRipple button key={title}>
                            <ListItemIcon style={{ minWidth: '0' }}>
                                <Tooltip placement="right" title={title}>
                                    {iconFor(path, IconComponent, SelectedIconComponent)}
                                </Tooltip>
                            </ListItemIcon>
                        </ListItem>
                    </Link>
                ))
            }
        </SideNavBarContainer>
    );
}
