/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Box } from '@mui/system';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

interface Props {
    values: any
    name: string
    state: number
    selected: Selected | undefined
    position: number
    updateFilterValue: Function
    group: number | undefined
}

interface Selected {
    displayname: string
    value: string
    _value: string
}

function hasSelect(
    values: Selected[],
    name: string,
    state: number,
    position: number,
    updateFilterValue: Function,
    group?: number,
) {
    const [val, setval] = React.useState(state);
    if (values) {
        const handleChange = (event: { target: { name: any; value: any; }; }) => {
            const vall = values.map((e) => e.displayname).indexOf(`${event.target.value}`);
            setval(vall);
            updateFilterValue({ position, state: vall.toString(), group });
        };

        const rett = values.map((e: Selected) => (
            <MenuItem
                key={`${name} ${e.displayname}`}
                value={e.displayname}
            >
                {
                    e.displayname
                }
            </MenuItem>
        ));
        return (
            <Box key={name} sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                        {name}
                    </InputLabel>
                    <Select
                        name={name}
                        value={values[val].displayname}
                        label={name}
                        onChange={handleChange}
                        autoWidth
                        sx={{ margin: '10px 0 10px 0' }}
                    >
                        {rett}
                    </Select>
                </FormControl>
            </Box>
        );
    }
    return (<></>);
}

function noSelect(
    values: string[],
    name: string,
    state: number,
    position: number,
    updateFilterValue: Function,
    group?: number,
) {
    const [val, setval] = React.useState(state);

    if (values) {
        const handleChange = (event: { target: { name: any; value: any; }; }) => {
            const vall = values.indexOf(`${event.target.value}`);
            setval(vall);
            updateFilterValue({ position, state: vall.toString(), group });
        };

        const rett = values.map((value: string) => (<MenuItem key={`${name} ${value}`} value={value}>{value}</MenuItem>));
        return (
            <Box key={name} sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                        {name}
                    </InputLabel>
                    <Select
                        name={name}
                        value={values[val]}
                        label={name}
                        onChange={handleChange}
                        autoWidth
                        sx={{ margin: '10px 0 10px 0' }}
                    >
                        {rett}
                    </Select>
                </FormControl>
            </Box>
        );
    }
    return (<></>);
}

export default function SelectFilter({
    values,
    name,
    state,
    selected,
    position,
    updateFilterValue,
    group,
}: Props) {
    if (selected === undefined) {
        return noSelect(
            values,
            name,
            state,
            position,
            updateFilterValue,
            group,
        );
    }

    return hasSelect(
        values,
        name,
        state,
        position,
        updateFilterValue,
        group,
    );
}
