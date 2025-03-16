/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { ListItemLink } from '@/modules/core/components/ListItemLink.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export const More = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useNavBarContext();

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
            <ListItemLink to={AppRoutes.downloads.path}>
                <ListItemIcon>
                    <GetAppOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t('download.title.queue')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.categories.path}>
                <ListItemIcon>
                    <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary={t('category.title.category_other')} />
            </ListItemLink>
            <Divider />
            <ListItemLink to={AppRoutes.settings.path}>
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.title')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.about.path}>
                <ListItemIcon>
                    <InfoIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.about.title')} />
            </ListItemLink>
        </List>
    );
};
