/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { InputAdornment, ListItemText, Stack, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListItemButton from '@mui/material/ListItemButton';
import * as React from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import Slider from '@mui/material/Slider';
import DialogContentText from '@mui/material/DialogContentText';
import InfoIcon from '@mui/icons-material/Info';

type BaseProps = {
    settingTitle: string;
    settingValue?: string;
    settingIcon?: React.ReactNode;
    value: number;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    stepSize?: number;
    dialogTitle: string;
    dialogDescription?: string;
    dialogDisclaimer?: string;
    valueUnit: string;
    handleUpdate: (value: number) => void;
    showSlider?: never;
    disabled?: boolean;
};

type PropsWithSlider = Omit<BaseProps, 'defaultValue' | 'minValue' | 'maxValue' | 'showSlider'> &
    Required<Pick<BaseProps, 'defaultValue' | 'minValue' | 'maxValue'>> & { showSlider: true };

type Props = BaseProps | PropsWithSlider;

export const NumberSetting = ({
    settingTitle,
    settingValue,
    settingIcon,
    dialogDescription,
    dialogDisclaimer,
    value,
    defaultValue,
    minValue,
    maxValue,
    stepSize,
    dialogTitle,
    valueUnit,
    handleUpdate,
    showSlider,
    disabled = false,
}: Props) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValue, setDialogValue] = useState(value);

    const closeDialog = useCallback(
        (resetValue: boolean) => {
            setIsDialogOpen(false);

            if (resetValue) {
                setDialogValue(value);
            }
        },
        [value],
    );

    const closeDialogWithReset = useCallback(() => closeDialog(true), [closeDialog]);

    const updateSetting = useCallback(
        (newValue: number, shouldCloseDialog: boolean = true) => {
            if (shouldCloseDialog) {
                closeDialog(false);
            }

            const didValueChange = value !== newValue;
            if (!didValueChange) {
                return;
            }

            handleUpdate(newValue);
        },
        [value, handleUpdate, closeDialog],
    );

    useEffect(() => {
        setDialogValue(value);
    }, [value]);

    return (
        <>
            <ListItemButton disabled={disabled} onClick={() => setIsDialogOpen(true)}>
                {settingIcon ? <ListItemIcon>{settingIcon}</ListItemIcon> : null}
                <ListItemText
                    primary={settingTitle}
                    secondary={settingValue ?? t('global.label.loading')}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialogWithReset}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{dialogTitle}</DialogTitle>
                    {(!!dialogDescription || !!dialogDisclaimer) && (
                        <DialogContentText sx={{ paddingBottom: '10px' }} component="div">
                            {dialogDescription && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {dialogDescription}
                                </Typography>
                            )}
                            {dialogDisclaimer && (
                                <Stack direction="row" alignItems="center">
                                    <InfoIcon color="warning" />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            marginLeft: '10px',
                                            marginTop: '5px',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {dialogDisclaimer}
                                    </Typography>
                                </Stack>
                            )}
                        </DialogContentText>
                    )}
                    <TextField
                        sx={{
                            width: '100%',
                            margin: 'auto',
                        }}
                        InputProps={{
                            inputProps: { min: minValue, max: maxValue, step: stepSize },
                            startAdornment: <InputAdornment position="start">{valueUnit}</InputAdornment>,
                        }}
                        autoFocus
                        value={dialogValue}
                        type="number"
                        onChange={(e) => setDialogValue(Number(e.target.value))}
                    />
                    {showSlider ? (
                        <Slider
                            aria-label="number-setting-slider"
                            defaultValue={defaultValue}
                            value={dialogValue}
                            step={stepSize}
                            min={minValue}
                            max={maxValue}
                            onChange={(_, newValue) => setDialogValue(newValue as number)}
                        />
                    ) : null}
                </DialogContent>
                <DialogActions>
                    {defaultValue !== undefined ? (
                        <Button
                            onClick={() => {
                                setDialogValue(defaultValue);
                                updateSetting(defaultValue, false);
                            }}
                            color="primary"
                        >
                            {t('global.button.reset_to_default')}
                        </Button>
                    ) : null}
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
                </DialogActions>
            </Dialog>
        </>
    );
};
