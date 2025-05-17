/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import HistoryIcon from '@mui/icons-material/History';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { NavbarItem, NavBarItemMoreGroup } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';

type RestrictedNavBarItem<Show extends NavbarItem['show']> = Omit<NavbarItem, 'show'> & { show: Show };

const NAVIGATION_BAR_BASE_ITEMS = [
    {
        path: AppRoutes.library.path() as RestrictedNavBarItem<'both'>['path'],
        title: 'library.title',
        SelectedIconComponent: CollectionsBookmarkIcon,
        IconComponent: CollectionsOutlinedBookmarkIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.updates.path,
        title: 'updates.title',
        SelectedIconComponent: NewReleasesIcon,
        IconComponent: NewReleasesOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.history.path,
        title: 'history.title',
        SelectedIconComponent: HistoryIcon,
        IconComponent: HistoryOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.browse.path,
        title: 'global.label.browse',
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
] as const satisfies RestrictedNavBarItem<'both'>[];

const NAVIGATION_BAR_DESKTOP_ITEMS = [
    {
        path: AppRoutes.downloads.path,
        title: 'download.title.queue',
        SelectedIconComponent: GetAppIcon,
        IconComponent: GetAppOutlinedIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.HIDDEN_ITEM,
    },
    {
        path: AppRoutes.settings.path,
        title: 'settings.title',
        SelectedIconComponent: SettingsIcon,
        IconComponent: SettingsIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.SETTING_INFO,
    },
    {
        path: AppRoutes.about.path,
        title: 'settings.about.title',
        SelectedIconComponent: InfoIcon,
        IconComponent: InfoIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.SETTING_INFO,
    },
] as const satisfies RestrictedNavBarItem<'desktop'>[];

export const NAVIGATION_BAR_MOBILE_ITEMS = [
    {
        path: AppRoutes.more.path,
        title: 'global.label.more',
        SelectedIconComponent: MoreHorizIcon,
        IconComponent: MoreHorizIcon,
        show: 'mobile',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
] as const satisfies RestrictedNavBarItem<'mobile'>[];

export const NAVIGATION_BAR_ITEMS = [
    ...NAVIGATION_BAR_BASE_ITEMS,
    ...NAVIGATION_BAR_DESKTOP_ITEMS,
    ...NAVIGATION_BAR_MOBILE_ITEMS,
] as const satisfies NavbarItem[];
