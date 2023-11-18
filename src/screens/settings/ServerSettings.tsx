/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { List, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useLocalStorage.tsx';

export const ServerSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('download.settings.title'));
        setAction(null);
    }, [t]);

    const [serverAddress, setServerAddress] = useLocalStorage<string>('serverBaseURL', '');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(serverAddress);

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
            <List>
                <ListItem>
                    <ListItemText primary={t('settings.about.label.server_address')} secondary={serverAddress} />
                    <ListItemSecondaryAction>
                        <Tooltip title={t('global.button.edit')}>
                            <IconButton
                                onClick={() => {
                                    handleDialogOpen();
                                }}
                                size="large"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>

            <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                <DialogContent>
                    <DialogContentText>{t('settings.server.address.dialog.label.enter_address')}</DialogContentText>
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
};
