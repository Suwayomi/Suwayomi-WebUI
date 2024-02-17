/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogTitle } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PasswordTextField } from '@/components/atoms/PasswordTextField.tsx';

export type TextSettingDialogProps = {
    settingName: string;
    dialogTitle?: string;
    dialogDescription?: string;
    value?: string;
    handleChange: (value: string) => void;
    isPassword?: boolean;
    placeholder?: string;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
};

export const TextSettingDialog = ({
    settingName,
    dialogTitle = settingName,
    dialogDescription,
    value,
    handleChange,
    isPassword = false,
    placeholder = '',
    isDialogOpen,
    setIsDialogOpen,
}: TextSettingDialogProps) => {
    const { t } = useTranslation();

    const [dialogValue, setDialogValue] = useState(value ?? '');

    const TextFieldComponent = useMemo(() => (isPassword ? PasswordTextField : TextField), [isPassword]);

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

        setIsDialogOpen(false);
    };

    const updateSetting = () => {
        closeDialog(false);
        handleChange(dialogValue);
    };

    return (
        <Dialog open={isDialogOpen} onClose={() => closeDialog()} fullWidth>
            <DialogContent>
                <DialogTitle sx={{ paddingLeft: 0 }}>{dialogTitle}</DialogTitle>
                {!!dialogDescription && (
                    <DialogContentText sx={{ paddingBottom: '10px' }}>{dialogDescription}</DialogContentText>
                )}
                <TextFieldComponent
                    sx={{
                        width: '100%',
                        margin: 'auto',
                    }}
                    autoFocus
                    placeholder={placeholder}
                    value={dialogValue}
                    onChange={(e) => setDialogValue(e.target.value)}
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
    );
};
