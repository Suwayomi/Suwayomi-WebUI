/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuIcon from '@mui/icons-material/Menu';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { useGetOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { DesktopSideBar } from '@/modules/navigation-bar/components/DesktopSideBar.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { MobileBottomBar } from '@/modules/navigation-bar/components/MobileBottomBar.tsx';
import { NavbarItem } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

const navbarItems: Array<NavbarItem> = [
    {
        path: AppRoutes.library.path,
        title: 'library.title',
        SelectedIconComponent: CollectionsBookmarkIcon,
        IconComponent: CollectionsOutlinedBookmarkIcon,
        show: 'both',
    },
    {
        path: AppRoutes.updates.path,
        title: 'updates.title',
        SelectedIconComponent: NewReleasesIcon,
        IconComponent: NewReleasesOutlinedIcon,
        show: 'both',
    },
    {
        path: AppRoutes.browse.path,
        title: 'global.label.browse',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'both',
    },
    {
        path: AppRoutes.downloads.path,
        title: 'download.title',
        SelectedIconComponent: GetAppIcon,
        IconComponent: GetAppOutlinedIcon,
        show: 'desktop',
    },
    {
        path: AppRoutes.more.path,
        title: 'global.label.more',
        SelectedIconComponent: MoreHorizIcon,
        IconComponent: MoreHorizIcon,
        show: 'both',
    },
];

export function DefaultNavBar() {
    const { title, action, override, isCollapsed, setIsCollapsed, setAppBarHeight, navBarWidth, setNavBarWidth } =
        useNavBarContext();

    const theme = useTheme();
    const getOptionForDirection = useGetOptionForDirection();
    const { pathname } = useLocation();
    const handleBack = useBackButton();

    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const isMainRoute = navbarItems.some(({ path }) => path === pathname);

    const actualNavBarWidth = isMobileWidth || isCollapsed ? 0 : navBarWidth;

    const appBarRef = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        appBarRef,
        useCallback(() => {
            setAppBarHeight(appBarRef.current?.clientHeight ?? 0);
        }, [appBarRef.current]),
    );
    useLayoutEffect(() => {
        if (!override.status) {
            setAppBarHeight(0);
        }

        return () => setAppBarHeight(0);
    }, [override.status]);

    const activeNavBar: NavbarItem['show'] = isMobileWidth ? 'mobile' : 'desktop';
    const visibleNavBarItems = useMemo(
        () => navbarItems.filter(({ show }) => ['both', activeNavBar].includes(show)),
        [isMobileWidth],
    );
    const NavBarComponent = useMemo(() => (isMobileWidth ? MobileBottomBar : DesktopSideBar), [isMobileWidth]);

    useLayoutEffect(() => {
        if (!isMobileWidth) {
            // do not reset navbar width to prevent grid from jumping due to the changing grid item width
            return;
        }

        setNavBarWidth(0);
    }, [isMobileWidth]);

    const navBar = useMemo(
        () => <NavBarComponent navBarItems={visibleNavBarItems} />,
        [NavBarComponent, visibleNavBarItems],
    );

    // Allow default navbar to be overrided
    if (override.status) return override.value;

    return (
        <>
            <AppBar
                ref={appBarRef}
                sx={{
                    position: 'fixed',
                    marginLeft: actualNavBarWidth,
                    pt: 'env(safe-area-inset-top)',
                    width: `calc(100% - ${actualNavBarWidth}px)`,
                    zIndex: theme.zIndex.drawer,
                }}
            >
                <Toolbar sx={{ position: 'relative' }}>
                    {!isMobileWidth && (
                        <Stack
                            sx={{
                                position: 'absolute',
                                left: 0,
                                width: `calc(${navBarWidth}px + env(safe-area-inset-left))`,
                                ...(!isCollapsed && { display: 'none' }),
                                alignItems: 'center',
                            }}
                        >
                            <IconButton aria-label="open drawer" onClick={() => setIsCollapsed(false)} color="inherit">
                                <MenuIcon />
                            </IconButton>
                        </Stack>
                    )}
                    <Stack
                        sx={{
                            ml: `${isCollapsed ? navBarWidth : 0}px`,
                            width: `calc(100% - (${isCollapsed ? navBarWidth : 0}px + env(safe-area-inset-left)))`,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {!isMainRoute && (
                            <IconButton
                                edge="start"
                                component="button"
                                sx={{ marginRight: 2 }}
                                size="large"
                                aria-label="menu"
                                onClick={handleBack}
                                color="inherit"
                            >
                                {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                            </IconButton>
                        )}
                        <Typography
                            variant="h5"
                            component="h1"
                            noWrap
                            sx={{
                                textOverflow: 'ellipsis',
                                flexGrow: 1,
                            }}
                        >
                            {title}
                        </Typography>
                        {action}
                    </Stack>
                </Toolbar>
            </AppBar>
            {!isMobileWidth || isMainRoute ? navBar : null}
        </>
    );
}
