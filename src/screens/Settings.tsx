/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useMemo } from 'react';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import List from '@mui/material/List';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BackupIcon from '@mui/icons-material/Backup';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import InfoIcon from '@mui/icons-material/Info';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, ListItemButton, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DnsIcon from '@mui/icons-material/Dns';
import WebIcon from '@mui/icons-material/Web';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { langCodeToName } from '@/util/language';
import { useLocalStorage } from '@/util/useLocalStorage';
import { ListItemLink } from '@/components/util/ListItemLink';
import { DarkTheme } from '@/components/context/DarkTheme';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast.tsx';

export function Settings() {
    const { t, i18n } = useTranslation();

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.title'));
        setAction(null);
    }, [t]);

    const { darkTheme, setDarkTheme } = useContext(DarkTheme);
    const [showNsfw, setShowNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const DEFAULT_ITEM_WIDTH = 300;
    const itemWidthIcon = useMemo(() => <ViewModuleIcon />, []);
    const [itemWidth, setItemWidth] = useLocalStorage<number>('ItemWidth', DEFAULT_ITEM_WIDTH);

    const [triggerClearServerCache, { loading: isClearingServerCache }] = requestManager.useClearServerCache();

    const clearServerCache = async () => {
        try {
            await triggerClearServerCache();
            makeToast(t('settings.clear_cache.label.success'), 'success');
        } catch (e) {
            makeToast(t('settings.clear_cache.label.failure'), 'error');
        }
    };

    return (
        <List sx={{ padding: 0 }}>
            <ListItemLink to="/settings/categories">
                <ListItemIcon>
                    <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary={t('category.title.categories')} />
            </ListItemLink>
            <ListItemLink to="/settings/defaultReaderSettings">
                <ListItemIcon>
                    <AutoStoriesIcon />
                </ListItemIcon>
                <ListItemText primary={t('reader.settings.title.default_reader_settings')} />
            </ListItemLink>
            <ListItemLink to="/settings/librarySettings">
                <ListItemIcon>
                    <CollectionsOutlinedBookmarkIcon />
                </ListItemIcon>
                <ListItemText primary={t('library.title')} />
            </ListItemLink>
            <ListItemLink to="/settings/downloadSettings">
                <ListItemIcon>
                    <GetAppOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t('download.title')} />
            </ListItemLink>
            <ListItemLink to="/settings/backup">
                <ListItemIcon>
                    <BackupIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.backup.title')} />
            </ListItemLink>
            <ListItem>
                <ListItemIcon>
                    <Brightness6Icon />
                </ListItemIcon>
                <ListItemText primary={t('settings.label.dark_theme')} />
                <Switch edge="end" checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
            </ListItem>
            <NumberSetting
                settingTitle={t('settings.label.manga_item_width')}
                settingValue={`px:${itemWidth}`}
                settingIcon={itemWidthIcon}
                value={itemWidth}
                defaultValue={DEFAULT_ITEM_WIDTH}
                minValue={100}
                maxValue={1000}
                stepSize={10}
                dialogTitle={t('settings.label.manga_item_width')}
                valueUnit="px"
                showSlider
                handleUpdate={setItemWidth}
            />
            <ListItem>
                <ListItemIcon>
                    <FavoriteIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.label.show_nsfw')}
                    secondary={t('settings.label.show_nsfw_description')}
                />
                <Switch edge="end" checked={showNsfw} onChange={() => setShowNsfw(!showNsfw)} />
            </ListItem>
            <ListItem>
                <ListItemIcon>
                    <LanguageIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('global.language.label.language')}
                    secondary={
                        <>
                            <span>{t('settings.label.language_description')} </span>
                            <Link href="https://hosted.weblate.org/projects/suwayomi/tachidesk-webui">
                                {t('global.language.title.weblate')}
                            </Link>
                        </>
                    }
                />
                <Select
                    MenuProps={{ PaperProps: { style: { maxHeight: 150 } } }}
                    value={i18n.language}
                    onChange={({ target: { value: language } }) => i18n.changeLanguage(language)}
                >
                    {Object.keys(i18n.services.resourceStore.data).map((language) => (
                        <MenuItem key={language} value={language}>
                            {langCodeToName(language)}
                        </MenuItem>
                    ))}
                </Select>
            </ListItem>
            <ListItemButton disabled={isClearingServerCache} onClick={clearServerCache}>
                <ListItemIcon>
                    <DeleteForeverIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.clear_cache.label.title')}
                    secondary={t('settings.clear_cache.label.description')}
                />
            </ListItemButton>
            <ListItemLink to="/settings/webUI">
                <ListItemIcon>
                    <WebIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.webui.title.webui')} />
            </ListItemLink>
            <ListItemLink to="/settings/server">
                <ListItemIcon>
                    <DnsIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.server.title.server')} />
            </ListItemLink>
            <ListItemLink to="/settings/about">
                <ListItemIcon>
                    <InfoIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.about.title')} />
            </ListItemLink>
        </List>
    );
}
