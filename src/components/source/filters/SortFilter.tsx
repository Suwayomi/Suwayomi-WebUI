/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Box } from '@mui/system';
import FormControl from '@mui/material/FormControl';
import {
    Collapse,
    List,
    ListItem,
    ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface Props {
    values: any
    name: string
    state: IState
    position: number
    group: number | undefined
    updateFilterValue: Function
    update: any
}

export default function SortFilter(props: Props) {
    const {
        values,
        name,
        state,
        position,
        group,
        updateFilterValue,
        update,
    } = props;
    const [val, setval] = React.useState(state);

    const [open, setOpen] = React.useState(false);

    /**
     * It sets the state of the component to the opposite of its current state.
     */
    const handleClick = () => {
        setOpen(!open);
    };

    if (values) {
        /**
         * If the current sort is on the same column as the clicked column, then reverse the sort
         * order. Otherwise, set the sort to ascending order
         * @param event - The event that triggered the change.
         * @param {number} index - The index of the column that is being sorted.
         */
        const handleChange = (event:
        React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
            const tmp = val;
            if (tmp.index === index) {
                tmp.ascending = !tmp.ascending;
            } else {
                tmp.ascending = true;
            }
            tmp.index = index;
            setval(tmp);
            const upd = update.filter((e: {
                position: number; group: number | undefined;
            }) => !(position === e.position && group === e.group));
            updateFilterValue([...upd, { position, state: JSON.stringify(tmp), group }]);
        };

        const ret = (
            <FormControl fullWidth>
                <ListItemButton onClick={handleClick}>
                    <ListItemText primary={name} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open}>
                    <List>
                        {values.map((value: string, index: number) => {
                            let icon;
                            if (val.index === index) {
                                icon = val.ascending ? (<ArrowUpwardIcon color="primary" />)
                                    : (<ArrowDownwardIcon color="primary" />);
                            }
                            return (
                                <ListItem disablePadding key={`${name} ${value}`}>
                                    <ListItemButton
                                        onClick={(event) => handleChange(event, index)}
                                    >
                                        <ListItemIcon>
                                            {icon}
                                        </ListItemIcon>
                                        <ListItemText primary={value} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Collapse>
            </FormControl>
        );
        return (
            <Box key={name} sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                {ret}
            </Box>
        );
    }
    return (<></>);
}
