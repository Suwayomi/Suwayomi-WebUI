/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import { List, ListItemSecondaryAction, ListItemText } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { langCodeToName } from 'util/language';
import cloneObject from 'util/cloneObject';

const useStyles = makeStyles(() => createStyles({
    paper: {
        maxHeight: 435,
        width: '80%',
    },
}));

interface IProps {
    shownLangs: string[]
    setShownLangs: (arg0: string[]) => void
    allLangs: string[]
}

export default function ExtensionLangSelect(props: IProps) {
    const { shownLangs, setShownLangs, allLangs } = props;
    // hold a copy and only sate state on parent when OK pressed, improves performance
    const [mShownLangs, setMShownLangs] = useState(shownLangs);
    const classes = useStyles();
    const [open, setOpen] = useState<boolean>(false);

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
        setShownLangs(mShownLangs);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, lang: string) => {
        const { checked } = event.target as HTMLInputElement;

        if (checked) {
            setMShownLangs([...mShownLangs, lang]);
        } else {
            const clone = cloneObject(mShownLangs);
            clone.splice(clone.indexOf(lang), 1);
            setMShownLangs(clone);
        }
    };

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                aria-label="display more actions"
                edge="end"
                color="inherit"
                size="large"
            >
                <FilterListIcon />
            </IconButton>
            <Dialog
                classes={classes}
                maxWidth="xs"
                open={open}
            >
                <DialogTitle>Enabled Languages</DialogTitle>
                <DialogContent dividers style={{ padding: 0 }}>
                    <List>
                        {allLangs.map((lang) => (
                            <ListItem key={lang}>
                                <ListItemText primary={langCodeToName(lang)} />

                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={mShownLangs.indexOf(lang) !== -1}
                                        onChange={(e) => handleChange(e, lang)}
                                    />
                                </ListItemSecondaryAction>

                            </ListItem>
                        ))}
                    </List>

                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
