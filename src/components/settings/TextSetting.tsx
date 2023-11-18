/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogTitle, ListItemText } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogContentText from '@mui/material/DialogContentText';

export const TextSetting = ({
    settingName,
    dialogDescription,
    value,
    handleChange,
}: {
    settingName: string;
    dialogDescription: string;
    value?: string;
    handleChange: (value: string) => void;
}) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogDirPath, setDialogDirPath] = useState(value ?? '');

    useEffect(() => {
        if (!value) {
            return;
        }

        setDialogDirPath(value);
    }, [value]);

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const updateSetting = () => {
        closeDialog();
        handleChange(dialogDirPath);
    };

    return (
        <>
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={settingName}
                    secondary={value ?? t('global.label.loading')}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{settingName}</DialogTitle>
                    <DialogContentText sx={{ paddingBottom: '10px' }}>{dialogDescription}</DialogContentText>
                    <TextField
                        sx={{
                            width: '100%',
                            margin: 'auto',
                        }}
                        autoFocus
                        value={dialogDirPath}
                        type="text"
                        onChange={(e) => setDialogDirPath(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={() => updateSetting()} color="primary">
                        {t('global.button.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
