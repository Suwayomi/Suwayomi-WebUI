/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Fragment } from 'react';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Divider from '@mui/material/Divider';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';
import { ListItemLink } from '@/views/base/components/lists/ListItemLink.tsx';
import { NAVIGATION_BAR_ITEMS } from '@/models/navigation-bar/NavigationBar.constants.ts';
import { MediaQuery } from '@/utils/base/MediaQuery.tsx';
import { NavigationBarUtil } from '@/utils/navigation-bar/NavigationBar.util.ts';
import { useMetadataServerSettings } from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import type { NavbarItem } from '@/models/navigation-bar/NavigationBar.types.ts';
import { NavBarItemMoreGroup } from '@/models/navigation-bar/NavigationBar.types.ts';
import { useAppTitle } from '@/controllers/navigation-bar/hooks/useAppTitle.ts';
import { STABLE_EMPTY_ARRAY } from '@/models/base/Base.constants.ts';

export const More = () => {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    useAppTitle(t`More`);

    const {
        settings: { hideHistory },
    } = useMetadataServerSettings();

    const hiddenNavBarItems = NavigationBarUtil.filterItems(NAVIGATION_BAR_ITEMS, {
        hideHistory,
        hideMore: true,
        hideBoth: true,
        hideDesktop: !isMobileWidth,
        hideMobile: isMobileWidth,
    });

    const hiddenNavBarItemsByMoreGroup = Object.groupBy(hiddenNavBarItems, (item) => item.moreGroup);

    const hiddenItemsMoreGroup = [
        ...(hiddenNavBarItemsByMoreGroup[NavBarItemMoreGroup.HIDDEN_ITEM] ?? STABLE_EMPTY_ARRAY),
        {
            path: AppRoutes.settings.children.categories.path,
            title: msg`Categories`,
            SelectedIconComponent: ListAltIcon,
            IconComponent: ListAltIcon,
            show: 'both',
            moreGroup: NavBarItemMoreGroup.HIDDEN_ITEM,
        },
    ] satisfies NavbarItem[];

    const finalHiddenNavBarItemsByGroup: typeof hiddenNavBarItemsByMoreGroup = {
        ...hiddenNavBarItemsByMoreGroup,
        [NavBarItemMoreGroup.HIDDEN_ITEM]: hiddenItemsMoreGroup,
    };

    return (
        <List sx={{ p: 0 }}>
            {Object.entries(finalHiddenNavBarItemsByGroup).map(([group, items], index, list) => (
                <Fragment key={group}>
                    {items.map((item) => (
                        <ListItemLink key={item.path} to={item.path}>
                            <ListItemIcon>
                                <item.IconComponent />
                            </ListItemIcon>
                            <ListItemText
                                primary={t(item.moreTitle ?? item.title)}
                                // biome-ignore lint/correctness/useHookAtTopLevel: kept as before the Biome migration
                                secondary={item.useBadge?.().title}
                            />
                        </ListItemLink>
                    ))}
                    {index !== list.length - 1 && <Divider />}
                </Fragment>
            ))}
        </List>
    );
};
