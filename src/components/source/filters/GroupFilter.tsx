/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import {
    Collapse, List, ListItemButton, ListItemText,
} from '@mui/material';
import React from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
// eslint-disable-next-line import/no-cycle
import { Options } from '../SourceOptions';

interface Props {
    state: ISourceFilters[]
    name: string
    position: number
    updateFilterValue: Function
    update: any
}

export default function GroupFilter(props: Props) {
    const {
        state,
        name,
        position,
        updateFilterValue,
        update,
    } = props;

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton onClick={handleClick}>
                <ListItemText primary={name} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open}>
                <List disablePadding>
                    <Options
                        sourceFilter={state}
                        group={position}
                        updateFilterValue={updateFilterValue}
                        update={update}
                    />
                </List>
            </Collapse>
        </>
    );
}
