/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
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
import Slider from '@mui/material/Slider';
import { DialogTitle, ListItemButton } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import NavbarContext from 'components/context/NavbarContext';
import DarkTheme from 'components/context/DarkTheme';
import useLocalStorage from 'util/useLocalStorage';
import ListItemLink from 'components/util/ListItemLink';
import SearchSettings from 'screens/settings/SearchSettings';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle(t('settings.title'));
        setAction(null);
    }, []);

    const { darkTheme, setDarkTheme } = useContext(DarkTheme);
    const [serverAddress, setServerAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [showNsfw, setShowNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const [useCache, setUseCache] = useLocalStorage<boolean>('useCache', true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(serverAddress);

    const [dialogOpenItemWidth, setDialogOpenItemWidth] = useState(false);
    const [ItemWidth, setItemWidth] = useLocalStorage<number>('ItemWidth', 300);
    const [DialogItemWidth, setDialogItemWidth] = useState(ItemWidth);

    const handleDialogOpen = () => {
        setDialogValue(serverAddress);
        setDialogOpen(true);
    };

    const handleDialogCancel = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = () => {
        setDialogOpen(false);
        setServerAddress(dialogValue);
    };

    const handleDialogOpenItemWidth = () => {
        setDialogItemWidth(ItemWidth);
        setDialogOpenItemWidth(true);
    };

    const handleDialogCancelItemWidth = () => {
        setDialogOpenItemWidth(false);
    };

    const handleDialogSubmitItemWidth = () => {
        setDialogOpenItemWidth(false);
        setItemWidth(DialogItemWidth);
    };

    const handleDialogResetItemWidth = () => {
        setDialogOpenItemWidth(false);
        setItemWidth(300);
    };

    const handleChange = (event: Event, newValue: number | number[]) => {
        setDialogItemWidth(newValue as number);
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
                <SearchSettings />
                <ListItemButton>
                    <ListItemIcon>
                        <ViewModuleIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('settings.label.manga_item_width')}
                        secondary={`px:${ItemWidth}`}
                        onClick={() => {
                            handleDialogOpenItemWidth();
                        }}
                    />
                </ListItemButton>
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

            <Dialog open={dialogOpenItemWidth} onClose={handleDialogCancelItemWidth}>
                <DialogTitle>{t('settings.label.manga_item_width')}</DialogTitle>
                <DialogContent
                    sx={{
                        width: '98%',
                        margin: 'auto',
                    }}
                >
                    <TextField
                        sx={{
                            width: '100%',
                            margin: 'auto',
                        }}
                        autoFocus
                        value={DialogItemWidth}
                        type="number"
                        onChange={(e) => setDialogItemWidth(parseInt(e.target.value, 10))}
                    />
                    <Slider
                        aria-label="Manga Item width"
                        defaultValue={300}
                        value={DialogItemWidth}
                        step={10}
                        min={100}
                        max={1000}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogResetItemWidth} color="primary">
                        {t('global.button.reset_to_default')}
                    </Button>
                    <Button onClick={handleDialogCancelItemWidth} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={handleDialogSubmitItemWidth} color="primary">
                        {t('global.button.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
