/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { loadDayJsLocale } from '@/util/language.tsx';

export const DateSetting = ({
    settingName,
    value,
    defaultValue,
    handleChange,
    remove,
}: {
    settingName: string;
    value?: string;
    defaultValue?: string;
    handleChange: (path?: string | null) => void;
    remove?: boolean;
}) => {
    const { t, i18n } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(value ?? defaultValue);

    const [locale, setLocale] = useState('en');

    const currentLocale = i18n.language;

    useEffect(() => {
        loadDayJsLocale(currentLocale).then((wasLoaded) => setLocale(wasLoaded ? currentLocale : 'en'));
    }, [currentLocale]);

    useEffect(() => {
        if (!value) {
            return;
        }

        setDialogValue(value);
    }, [value]);

    const closeDialog = useCallback(
        (resetValue: boolean) => {
            setIsDialogOpen(false);

            if (resetValue) {
                setDialogValue(value ?? defaultValue);
            }
        },
        [value],
    );

    const closeDialogWithReset = useCallback(() => closeDialog(true), [closeDialog]);

    const updateSetting = useCallback(
        (newValue?: string, shouldCloseDialog: boolean = true) => {
            if (shouldCloseDialog) {
                closeDialog(false);
            }

            const didValueChange = value !== newValue;
            if (!didValueChange) {
                return;
            }

            handleChange(newValue);
        },
        [value, handleChange, closeDialog],
    );

    return (
        <>
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={settingName}
                    secondary={value ? dayjs(Number(value)).locale(currentLocale).format('L') : '-'}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{settingName}</DialogTitle>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
                        <DatePicker
                            value={dialogValue ? dayjs(Number(dialogValue)) : null}
                            onChange={(date) => {
                                if (!date) return;
                                setDialogValue(date.valueOf().toString());
                            }}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between" alignItems="end">
                        <Stack>
                            {defaultValue !== undefined && (
                                <Button
                                    onClick={() => {
                                        setDialogValue(defaultValue);
                                        updateSetting(defaultValue, false);
                                    }}
                                    color="primary"
                                >
                                    {t('global.button.reset_to_default')}
                                </Button>
                            )}
                            {remove && (
                                <Button
                                    onClick={() => {
                                        setDialogValue(undefined);
                                        updateSetting(undefined, false);
                                    }}
                                    color="primary"
                                >
                                    {t('global.button.remove')}
                                </Button>
                            )}
                        </Stack>
                        <Stack direction="row">
                            <Button onClick={closeDialogWithReset} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    updateSetting(dialogValue);
                                }}
                                color="primary"
                            >
                                {t('global.button.ok')}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};
