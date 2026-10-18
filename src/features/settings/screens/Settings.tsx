/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import type { ListProps } from '@mui/material/List';
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
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type { ComponentProps } from 'react';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { OffsetComponent, useOffsetComponent } from '@/base/OffsetComponent.tsx';

const SETTING_MENU_ITEMS = [
    { to: AppRoutes.settings.children.appearance.path, icon: <PaletteIcon />, label: msg`Appearance` },
    { to: AppRoutes.settings.children.reader.path, icon: <AutoStoriesIcon />, label: msg`Reader` },
    { to: AppRoutes.settings.children.library.path, icon: <CollectionsOutlinedBookmarkIcon />, label: msg`Library` },
    { to: AppRoutes.settings.children.download.path, icon: <GetAppOutlinedIcon />, label: msg`Downloads` },
    { to: AppRoutes.settings.children.images.path, icon: <ImageIcon />, label: msg`Images` },
    { to: AppRoutes.settings.children.tracking.path, icon: <SyncIcon />, label: msg`Tracking` },
    { to: AppRoutes.settings.children.backup.path, icon: <BackupIcon />, label: msg`Backup` },
    { to: AppRoutes.settings.children.browse.path, icon: <ExploreOutlinedIcon />, label: msg`Browse` },
    { to: AppRoutes.settings.children.history.path, icon: <HistoryIcon />, label: msg`History` },
    { to: AppRoutes.settings.children.device.path, icon: <DevicesIcon />, label: msg`Device` },
    { to: AppRoutes.settings.children.webui.path, icon: <WebIcon />, label: msg`WebUI` },
    { to: AppRoutes.settings.children.server.path, icon: <DnsIcon />, label: msg`Server` },
];

function SettingsMenu({
    slots,
}: {
    slots?: {
        list?: ListProps;
        listItemLink?: Omit<ComponentProps<typeof ListItemLink>, 'to' | 'key' | 'selected'>;
    };
}) {
    const { t } = useLingui();
    const { pathname } = useLocation();

    return (
        <List {...slots?.list} sx={{ padding: 0 }}>
            {SETTING_MENU_ITEMS.map((item) => (
                <ListItemLink
                    {...slots?.listItemLink}
                    key={item.to}
                    to={item.to}
                    selected={pathname.startsWith(item.to)}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={t(item.label)} />
                </ListItemLink>
            ))}
        </List>
    );
}

export function SettingsIndex() {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    useAppTitle(t`Settings`);

    if (!isMobileWidth) {
        return <Navigate to={SETTING_MENU_ITEMS[0].to} replace />;
    }

    return <SettingsMenu />;
}

export function Settings() {
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const isDesktopWidth = MediaQuery.useIsDesktopWidth();
    const { topOffset } = useOffsetComponent();
    const { bottomBarHeight } = useNavBarContext();

    if (isMobileWidth) {
        return <Outlet />;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <OffsetComponent
                sx={{
                    minWidth: isDesktopWidth ? 250 : undefined,
                    height: `calc(100vh - ${topOffset + bottomBarHeight}px)`,
                    flexShrink: 0,
                    overflowY: 'auto',
                    borderRight: 1,
                    borderColor: 'divider',
                }}
            >
                <SettingsMenu slots={{ listItemLink: { sx: { pr: 8 } } }} />
            </OffsetComponent>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
