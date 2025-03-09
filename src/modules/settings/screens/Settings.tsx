/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import List from '@mui/material/List';
import BackupIcon from '@mui/icons-material/Backup';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useTranslation } from 'react-i18next';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import DnsIcon from '@mui/icons-material/Dns';
import WebIcon from '@mui/icons-material/Web';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import DevicesIcon from '@mui/icons-material/Devices';
import SyncIcon from '@mui/icons-material/Sync';
import PaletteIcon from '@mui/icons-material/Palette';
import { ListItemLink } from '@/modules/core/components/ListItemLink.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export function Settings() {
    const { t } = useTranslation();

    const { setTitle, setAction } = useNavBarContext();
    useLayoutEffect(() => {
        setTitle(t('settings.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const [triggerClearServerCache, { loading: isClearingServerCache }] = requestManager.useClearServerCache();

    const clearServerCache = async () => {
        try {
            await triggerClearServerCache();
            makeToast(t('settings.clear_cache.label.success'), 'success');
        } catch (e) {
            makeToast(t('settings.clear_cache.label.failure'), 'error', getErrorMessage(e));
        }
    };

    return (
        <List sx={{ padding: 0 }}>
            <ListItemLink to={AppRoutes.settings.childRoutes.appearance.path}>
                <ListItemIcon>
                    <PaletteIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.appearance.title')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.reader.path}>
                <ListItemIcon>
                    <AutoStoriesIcon />
                </ListItemIcon>
                <ListItemText primary={t('reader.settings.title.reader_settings')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.library.path}>
                <ListItemIcon>
                    <CollectionsOutlinedBookmarkIcon />
                </ListItemIcon>
                <ListItemText primary={t('library.title')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.download.path}>
                <ListItemIcon>
                    <GetAppOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t('download.title')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.tracking.path}>
                <ListItemIcon>
                    <SyncIcon />
                </ListItemIcon>
                <ListItemText primary={t('tracking.title')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.backup.path}>
                <ListItemIcon>
                    <BackupIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.backup.title')} />
            </ListItemLink>

            <ListItemButton disabled={isClearingServerCache} onClick={clearServerCache}>
                <ListItemIcon>
                    <DeleteForeverIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.clear_cache.label.title')}
                    secondary={t('settings.clear_cache.label.description')}
                />
            </ListItemButton>
            <ListItemLink to={AppRoutes.settings.childRoutes.browse.path}>
                <ListItemIcon>
                    <ExploreOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t('global.label.browse')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.device.path}>
                <ListItemIcon>
                    <DevicesIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.device.title.device')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.webui.path}>
                <ListItemIcon>
                    <WebIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.webui.title.webui')} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.childRoutes.server.path}>
                <ListItemIcon>
                    <DnsIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.server.title.server')} />
            </ListItemLink>
        </List>
    );
}
