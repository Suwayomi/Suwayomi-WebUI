/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BottomNavigation from '@mui/material/BottomNavigation';
import type { BottomNavigationActionProps } from '@mui/material/BottomNavigationAction';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import type { CSSProperties } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { useLingui } from '@lingui/react/macro';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import type { StaticAppRoute } from '@/base/AppRoute.constants.ts';

const BottomNavigationItem = ({
    path,
    title,
    useBadge,
    SelectedIconComponent,
    IconComponent,
    isActive,
    ...bottomNavigationActionProps
}: NavbarItem & {
    isActive: boolean;
} & Omit<BottomNavigationActionProps, 'value' | 'label' | 'icon' | 'title'>) => {
    const { t } = useLingui();
    const count = useBadge?.()?.count;

    return (
        <BottomNavigationAction
            {...bottomNavigationActionProps}
            value={path}
            label={t(title)}
            icon={
                <Badge badgeContent={count} color="primary">
                    {isActive ? <SelectedIconComponent /> : <IconComponent />}
                </Badge>
            }
        />
    );
};

export const MobileBottomBar = ({ navBarItems }: { navBarItems: NavbarItem[] }) => {
    const theme = useTheme();
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
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                pb: 'env(safe-area-inset-bottom)',
                pl: 'env(safe-area-inset-left)',
                pr: 'env(safe-area-inset-right)',
                zIndex: theme.zIndex.drawer - 1,
            }}
            style={{
                ...(theme.applyStyles('dark', {
                    '--Paper-overlay': 'unset',
                }) as CSSProperties),
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={selectedNavBarItem}
                onChange={(_, newValue: StaticAppRoute) => {
                    setSelectedNavBarItem(newValue);
                    navigate(newValue);
                }}
            >
                {navBarItems.map((navbarItem) => (
                    <BottomNavigationItem
                        key={navbarItem.path}
                        {...navbarItem}
                        isActive={selectedNavBarItem === navbarItem.path}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
};
