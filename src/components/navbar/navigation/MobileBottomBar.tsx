/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { styled, Box, ListItemButton } from '@mui/material';
import { Link as RRDLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { NavbarItem } from 'typings';
import { useTranslation } from 'react-i18next';

const BottomNavContainer = styled('div')(({ theme }) => ({
    bottom: 0,
    left: 0,
    height: theme.spacing(7),
    width: '100vw',
    backgroundColor: theme.palette.custom.light,
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // For Some reason the theme is throwing and error when accessing the Zindex object,
    // This is the zIndex of the appBar in the default theme
    zIndex: 1100,
}));

const Link = styled(RRDLink)({
    textDecoration: 'none',
    flex: 1,
});

interface IProps {
    navBarItems: Array<NavbarItem>;
}

export default function MobileBottomBar({ navBarItems }: IProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const theme = useTheme();

    const iconFor = (path: string, IconComponent: any, SelectedIconComponent: any) => {
        if (location.pathname === path)
            return <SelectedIconComponent sx={{ color: 'primary.main' }} fontSize="medium" />;
        return (
            <IconComponent sx={{ color: theme.palette.mode === 'dark' ? 'grey.A400' : 'grey.600' }} fontSize="medium" />
        );
    };

    return (
        <BottomNavContainer>
            {navBarItems.map(({ path, title, IconComponent, SelectedIconComponent }: NavbarItem) => (
                <Link to={path} key={path}>
                    <ListItemButton disableRipple sx={{ justifyContent: 'center', padding: '8px' }} key={title}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            {iconFor(path, IconComponent, SelectedIconComponent)}
                            <Box
                                sx={{
                                    fontSize: '0.65rem',
                                    color:
                                        // eslint-disable-next-line no-nested-ternary
                                        location.pathname === path
                                            ? 'primary.main'
                                            : theme.palette.mode === 'dark'
                                            ? 'grey.A400'
                                            : 'grey.600',
                                }}
                            >
                                {t(title) as string}
                            </Box>
                        </Box>
                    </ListItemButton>
                </Link>
            ))}
        </BottomNavContainer>
    );
}
