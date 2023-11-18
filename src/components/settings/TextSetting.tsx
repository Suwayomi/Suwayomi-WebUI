/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogTitle, InputAdornment, ListItemText } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const TextSetting = ({
    settingName,
    dialogDescription,
    value,
    handleChange,
    isPassword = false,
    placeholder = '',
    disabled = false,
}: {
    settingName: string;
    dialogDescription?: string;
    value?: string;
    handleChange: (value: string) => void;
    isPassword?: boolean;
    placeholder?: string;
    disabled?: boolean;
}) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(value ?? '');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    useEffect(() => {
        if (!value) {
            return;
        }

        setDialogValue(value);
    }, [value]);

    const closeDialog = (resetValue: boolean = true) => {
        if (resetValue) {
            setDialogValue(value ?? '');
        }

        setShowPassword(false);
        setIsDialogOpen(false);
    };

    const updateSetting = () => {
        closeDialog(false);
        handleChange(dialogValue);
    };

    return (
        <>
            <ListItemButton disabled={disabled} onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={settingName}
                    secondary={isPassword ? value?.replace(/./g, '*') : value ?? t('global.label.loading')}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={() => closeDialog()} fullWidth>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{settingName}</DialogTitle>
                    {!!dialogDescription && (
                        <DialogContentText sx={{ paddingBottom: '10px' }}>{dialogDescription}</DialogContentText>
                    )}
                    <TextField
                        sx={{
                            width: '100%',
                            margin: 'auto',
                        }}
                        autoFocus
                        placeholder={placeholder}
                        value={dialogValue}
                        type={isPassword && !showPassword ? 'password' : 'text'}
                        onChange={(e) => setDialogValue(e.target.value)}
                        InputProps={{
                            endAdornment: isPassword ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeDialog()} color="primary">
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
