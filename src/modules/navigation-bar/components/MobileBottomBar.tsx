/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { NavbarItem } from '@/modules/navigation-bar/NavigationBar.types.ts';

export const MobileBottomBar = ({ navBarItems }: { navBarItems: NavbarItem[] }) => {
    const { t } = useTranslation();
    const { setBottomBarHeight } = useNavBarContext();
    const location = useLocation();
    const navigate = useNavigate();

    const ref = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        ref,
        useCallback(() => setBottomBarHeight(ref.current?.clientHeight ?? 0), [ref.current]),
    );
    useLayoutEffect(() => () => setBottomBarHeight(0), []);

    const [selectedNavBarItem, setSelectedNavBarItem] = useState(
        navBarItems.find((navBarItem) => navBarItem.path === location.pathname)?.path,
    );

    return (
        <Paper
            ref={ref}
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.drawer - 1 }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={selectedNavBarItem}
                onChange={(_, newValue: string) => {
                    setSelectedNavBarItem(newValue);
                    navigate(newValue);
                }}
            >
                {navBarItems.map(({ path, title, IconComponent, SelectedIconComponent }) => (
                    <BottomNavigationAction
                        key={path}
                        value={path}
                        label={t(title)}
                        icon={selectedNavBarItem === path ? <SelectedIconComponent /> : <IconComponent />}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
};
