/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { InputAdornment, List, ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemButton from '@mui/material/ListItemButton';
import { useEffect, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import { requestManager } from '@/lib/requests/RequestManager.ts';

const DEFAULT_INTERVAL_HOURS = 12;
const MIN_INTERVAL_HOURS = 6;

export const GlobalUpdateSettingsInterval = () => {
    const { t } = useTranslation();

    const { data } = requestManager.useGetServerSettings();
    const autoUpdateIntervalHours = data?.settings.globalUpdateInterval ?? 0;
    const doAutoUpdates = !!autoUpdateIntervalHours;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogUpdateIntervalHours, setDialogUpdateIntervalHours] = useState(autoUpdateIntervalHours);

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const updateSetting = (globalUpdateInterval: number) => {
        closeDialog();

        const didIntervalChange = autoUpdateIntervalHours !== globalUpdateInterval;
        if (!didIntervalChange) {
            return;
        }

        mutateSettings({ variables: { input: { settings: { globalUpdateInterval } } } });
    };

    const setDoAutoUpdates = (enable: boolean) => {
        const globalUpdateInterval = enable ? DEFAULT_INTERVAL_HOURS : 0;
        updateSetting(globalUpdateInterval);
    };

    useEffect(() => {
        setDialogUpdateIntervalHours(autoUpdateIntervalHours);
    }, [autoUpdateIntervalHours]);

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('library.settings.global_update.auto_update.label.title')} />
                <ListItemSecondaryAction>
                    <Switch edge="end" checked={doAutoUpdates} onChange={(e) => setDoAutoUpdates(e.target.checked)} />
                </ListItemSecondaryAction>
            </ListItem>
            {doAutoUpdates ? (
                <>
                    <ListItemButton onClick={() => setIsDialogOpen(true)}>
                        <ListItemText
                            primary={t('library.settings.global_update.auto_update.interval.label.title')}
                            secondary={t('library.settings.global_update.auto_update.interval.label.value', {
                                hours: autoUpdateIntervalHours,
                            })}
                            secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                        />
                    </ListItemButton>

                    <Dialog open={isDialogOpen} onClose={closeDialog}>
                        <DialogContent>
                            <DialogTitle sx={{ paddingLeft: 0 }}>
                                {t('library.settings.global_update.auto_update.interval.label.title')}
                            </DialogTitle>
                            <TextField
                                sx={{
                                    width: '100%',
                                    margin: 'auto',
                                }}
                                InputProps={{
                                    inputProps: { min: MIN_INTERVAL_HOURS },
                                    startAdornment: (
                                        <InputAdornment position="start">{t('global.time.hour_short')}</InputAdornment>
                                    ),
                                }}
                                autoFocus
                                value={dialogUpdateIntervalHours}
                                type="number"
                                onChange={(e) => setDialogUpdateIntervalHours(Number(e.target.value))}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    updateSetting(dialogUpdateIntervalHours);
                                }}
                                color="primary"
                            >
                                {t('global.button.ok')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : null}
        </List>
    );
};
