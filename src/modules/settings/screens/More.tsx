/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Fragment, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Divider from '@mui/material/Divider';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { ListItemLink } from '@/modules/core/components/ListItemLink.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { NAVIGATION_BAR_ITEMS } from '@/modules/navigation-bar/NavigationBar.constants.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { NavigationBarUtil } from '@/modules/navigation-bar/NavigationBar.util.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { NavbarItem, NavBarItemMoreGroup } from '@/modules/navigation-bar/NavigationBar.types.ts';

export const More = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useNavBarContext();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

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
        ...(hiddenNavBarItemsByMoreGroup[NavBarItemMoreGroup.HIDDEN_ITEM] ?? []),
        {
            path: AppRoutes.settings.childRoutes.categories.path,
            title: 'category.title.category_other',
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

    useLayoutEffect(() => {
        setTitle(t('global.label.more'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    return (
        <List sx={{ p: 0 }}>
            {Object.entries(finalHiddenNavBarItemsByGroup).map(([group, items], index, list) => (
                <Fragment key={group}>
                    {items.map((item) => (
                        <ListItemLink key={item.path} to={item.path}>
                            <ListItemIcon>
                                <item.IconComponent />
                            </ListItemIcon>
                            <ListItemText primary={t(item.title)} />
                        </ListItemLink>
                    ))}
                    {index !== list.length - 1 && <Divider />}
                </Fragment>
            ))}
        </List>
    );
};
