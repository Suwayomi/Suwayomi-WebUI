/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import List from '@mui/material/List';
import BackupIcon from '@mui/icons-material/Backup';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import DnsIcon from '@mui/icons-material/Dns';
import WebIcon from '@mui/icons-material/Web';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import DevicesIcon from '@mui/icons-material/Devices';
import SyncIcon from '@mui/icons-material/Sync';
import PaletteIcon from '@mui/icons-material/Palette';
import HistoryIcon from '@mui/icons-material/History';
import ImageIcon from '@mui/icons-material/Image';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { ScrollHostProvider } from '@/base/contexts/ScrollHost.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export function SettingsMenu() {
    const { t } = useLingui();
    const { pathname } = useLocation();

    const items = [
        { to: AppRoutes.settings.children.appearance.path, icon: <PaletteIcon />, label: t`Appearance` },
        { to: AppRoutes.settings.children.reader.path, icon: <AutoStoriesIcon />, label: t`Reader` },
        { to: AppRoutes.settings.children.library.path, icon: <CollectionsOutlinedBookmarkIcon />, label: t`Library` },
        { to: AppRoutes.settings.children.download.path, icon: <GetAppOutlinedIcon />, label: t`Downloads` },
        { to: AppRoutes.settings.children.images.path, icon: <ImageIcon />, label: t`Images` },
        { to: AppRoutes.settings.children.tracking.path, icon: <SyncIcon />, label: t`Tracking` },
        { to: AppRoutes.settings.children.backup.path, icon: <BackupIcon />, label: t`Backup` },
        { to: AppRoutes.settings.children.browse.path, icon: <ExploreOutlinedIcon />, label: t`Browse` },
        { to: AppRoutes.settings.children.history.path, icon: <HistoryIcon />, label: t`History` },
        { to: AppRoutes.settings.children.device.path, icon: <DevicesIcon />, label: t`Device` },
        { to: AppRoutes.settings.children.webui.path, icon: <WebIcon />, label: t`WebUI` },
        { to: AppRoutes.settings.children.server.path, icon: <DnsIcon />, label: t`Server` },
    ];

    return (
        <List sx={{ padding: 0 }}>
            {items.map((item) => (
                <ListItemLink key={item.to} to={item.to} selected={pathname.startsWith(item.to)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItemLink>
            ))}
        </List>
    );
}

export function SettingsIndex() {
    const { t } = useLingui();
    const isWide = useMediaQuery('(min-width: 900px)');
    const navigate = useNavigate();

    useAppTitle(t`Settings`);

    useEffect(() => {
        if (isWide) {
            navigate(AppRoutes.settings.children.appearance.path, { replace: true });
        }
    }, [isWide, navigate]);

    if (isWide) {
        return null;
    }
    return <SettingsMenu />;
}

export function Settings() {
    const isWide = useMediaQuery('(min-width: 900px)');
    const { appBarHeight, bottomBarHeight } = useNavBarContext();
    const scrollbarWidth = MediaQuery.useGetClassicScrollbarSize('Y');
    const [settingsScrollHost, setSettingsScrollHost] = useState<HTMLElement | null>(null);

    if (!isWide) {
        return <Outlet />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                height: `calc(100vh - ${appBarHeight + bottomBarHeight}px)`,
                overflow: 'hidden',
                mr: `${-scrollbarWidth}px`,
            }}
        >
            <Box
                sx={{
                    width: 280,
                    flexShrink: 0,
                    overflowY: 'auto',
                    borderRight: 1,
                    borderColor: 'divider',
                    minHeight: 0,
                }}
            >
                <SettingsMenu />
            </Box>
            <Box
                ref={(el: HTMLDivElement | null) => {
                    if (el && !settingsScrollHost) {
                        setSettingsScrollHost(el);
                    }
                }}
                sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
            >
                {settingsScrollHost ? (
                    <ScrollHostProvider value={settingsScrollHost}>
                        <Outlet />
                    </ScrollHostProvider>
                ) : null}
            </Box>
        </Box>
    );
}
