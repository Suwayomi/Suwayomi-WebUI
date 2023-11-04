/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useMemo, useState } from 'react';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import List from '@mui/material/List';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BackupIcon from '@mui/icons-material/Backup';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import DnsIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import CachedIcon from '@mui/icons-material/Cached';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import CollectionsOutlinedBookmarkIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { langCodeToName } from '@/util/language';
import { useLocalStorage } from '@/util/useLocalStorage';
import { ListItemLink } from '@/components/util/ListItemLink';
import { DarkTheme } from '@/components/context/DarkTheme';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';

export function Settings() {
    const { t, i18n } = useTranslation();

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.title'));
        setAction(null);
    }, [t]);

    const { darkTheme, setDarkTheme } = useContext(DarkTheme);
    const [serverAddress, setServerAddress] = useLocalStorage<string>('serverBaseURL', '');
    const [showNsfw, setShowNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const [useCache, setUseCache] = useLocalStorage<boolean>('useCache', true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(serverAddress);

    const DEFAULT_ITEM_WIDTH = 300;
    const itemWidthIcon = useMemo(() => <ViewModuleIcon />, []);
    const [itemWidth, setItemWidth] = useLocalStorage<number>('ItemWidth', DEFAULT_ITEM_WIDTH);

    const handleDialogOpen = () => {
        setDialogValue(serverAddress);
        setDialogOpen(true);
    };

    const handleDialogCancel = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = () => {
        setDialogOpen(false);
        const serverBaseUrl = dialogValue.replaceAll(/(\/)+$/g, '');
        setServerAddress(serverBaseUrl);
        requestManager.updateClient({ baseURL: serverBaseUrl });
    };

    return (
        <>
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
                    <ListItemSecondaryAction>
                        <Switch edge="end" checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
                    </ListItemSecondaryAction>
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
                    <ListItemSecondaryAction>
                        <Switch edge="end" checked={showNsfw} onChange={() => setShowNsfw(!showNsfw)} />
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CachedIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('settings.label.image_cache')}
                        secondary={t('settings.label.image_cache_description')}
                    />
                    <ListItemSecondaryAction>
                        <Switch edge="end" checked={useCache} onChange={() => setUseCache(!useCache)} />
                    </ListItemSecondaryAction>
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
                    <ListItemSecondaryAction>
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
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <DnsIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('settings.about.label.server_address')} secondary={serverAddress} />
                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={() => {
                                handleDialogOpen();
                            }}
                            size="large"
                        >
                            <EditIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItemLink to="/settings/about">
                    <ListItemIcon>
                        <InfoIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('settings.about.title')} />
                </ListItemLink>
            </List>

            <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                <DialogContent>
                    <DialogContentText>{t('settings.server_address.dialog.label.enter_address')}</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t('settings.about.label.server_address')}
                        type="text"
                        fullWidth
                        value={dialogValue}
                        placeholder="http://127.0.0.1:4567"
                        onChange={(e) => setDialogValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogCancel} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={handleDialogSubmit} color="primary">
                        {t('global.button.set')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
