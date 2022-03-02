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
import { FormControlLabel, Checkbox } from '@mui/material';

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

    if (values) {
        const handleChange = (event: { target: { name: string;
            value?: string;
            checked?: boolean
        };
        }) => {
            const tmp = val;
            if (event.target.name === 'index') { tmp.index = values.indexOf(`${event.target.value}`); }
            if (event.target.name === 'ascending') { tmp.ascending = event.target.checked as boolean; }
            setval(tmp);
            updateFilterValue({ position, state: JSON.stringify(tmp), group });
        };

        const rett = values.map((value: string) => (<MenuItem key={`${name} ${value}`} value={value}>{value}</MenuItem>));
        const ret = (
            <FormControl fullWidth>
                <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                    {name}
                </InputLabel>
                <Select
                    name="index"
                    value={values[val.index]}
                    label={name}
                    onChange={handleChange}
                    autoWidth
                    sx={{ margin: '10px 0 10px 0' }}
                >
                    {rett}
                </Select>
                <FormControlLabel
                    control={(
                        <Checkbox
                            name="ascending"
                            checked={val.ascending}
                            onChange={handleChange}
                        />
                    )}
                    label="Ascending"
                />
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
