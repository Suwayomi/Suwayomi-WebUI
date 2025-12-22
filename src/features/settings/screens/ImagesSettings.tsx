/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

export const ImagesSettings = () => {
    const { t } = useTranslation();

    useAppTitle(t('settings.images.title'));

    return (
        <List
            sx={{ pt: 0 }}
            subheader={
                <ListSubheader component="div" id="image-processing-settings">
                    {t('settings.images.processing.title')}
                </ListSubheader>
            }
        >
            <ListItemLink to={AppRoutes.settings.childRoutes.images.childRoutes.processingDownloads.path}>
                <ListItemText primary={t('download.settings.conversion.title')} />
            </ListItemLink>
        </List>
    );
};
