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
}

export default function SortFilter(props: Props) {
    const {
        values,
        name,
        state,
        position,
        group,
        updateFilterValue,
    } = props;
    const [val, setval] = React.useState(state);

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    if (values) {
        const handleChange = (event:
        React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
            const tmp = val;
            tmp.index = index;
            tmp.ascending = !tmp.ascending;
            setval(tmp);
            updateFilterValue({ position, state: JSON.stringify(tmp), group });
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
