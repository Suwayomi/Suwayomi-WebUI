/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { ListPreferenceProps } from 'typings';
import { useTranslation } from 'react-i18next';

interface IListDialogProps {
    value: string;
    open: boolean;
    onClose: (arg0: string | null) => void;
    options: string[];
    title: string;
}

function ListDialog(props: IListDialogProps) {
    const { t } = useTranslation();

    const { value: valueProp, open, onClose, options, title } = props;
    const [value, setValue] = React.useState(valueProp);
    const radioGroupRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) {
            setValue(valueProp);
        }
    }, [valueProp, open]);

    const handleEntering = () => {
        if (radioGroupRef.current != null) {
            radioGroupRef?.current.focus();
        }
    };

    const handleCancel = () => {
        onClose(null);
    };

    const handleOk = () => {
        onClose(value);
    };

    const handleChange = (event: any) => {
        setValue(event.target.value);
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            TransitionProps={{ onEntering: handleEntering }}
            open={open}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <RadioGroup ref={radioGroupRef} value={value} onChange={handleChange}>
                    {options.map((option) => (
                        <FormControlLabel value={option} key={option} control={<Radio />} label={option} />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleCancel}>
                    {t('global.button.cancel')}
                </Button>
                <Button onClick={handleOk}>{t('global.button.ok')}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ListPreference(props: ListPreferenceProps) {
    const { title, summary, currentValue, updateValue, entryValues, entries } = props;
    const [internalCurrentValue, setInternalCurrentValue] = useState<string>(currentValue);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        setInternalCurrentValue(currentValue);
    }, [currentValue]);

    const findEntryOf = (value: string) => {
        const idx = entryValues.indexOf(value);
        return entries[idx];
    };

    const findEntryValueOf = (value: string) => {
        const idx = entries.indexOf(value);
        return entryValues[idx];
    };

    const getSummary = () => {
        if (summary === '%s') {
            return findEntryOf(currentValue);
        }
        return summary;
    };

    const handleDialogClose = (newValue: string | null) => {
        if (newValue !== null) {
            updateValue(findEntryValueOf(newValue));

            // appear smooth
            setInternalCurrentValue(newValue);
        }

        setDialogOpen(false);
    };

    return (
        <>
            <ListItem button onClick={() => setDialogOpen(true)}>
                <ListItemText primary={title} secondary={getSummary()} />
            </ListItem>
            <ListDialog
                title={title}
                open={dialogOpen}
                onClose={handleDialogClose}
                value={findEntryOf(internalCurrentValue)}
                options={entries}
            />
        </>
    );
}
