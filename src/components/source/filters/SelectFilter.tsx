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
    values: string[] | undefined
    name: string
    state: number
}

export default function SelectFilter(props: Props) {
    const { values, name, state } = props;
    const [val, setval] = React.useState(state);

    if (values) {
        const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
            setval(values.indexOf(`${event.target.value}`));
        };

        // eslint-disable-next-line max-len
        const rett = values.map((value: string) => (<MenuItem key={`${name} ${value}`} value={value}>{value}</MenuItem>));
        const ret = (
            <FormControl fullWidth key={name}>
                <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                    {name}
                </InputLabel>
                <Select
                    value={values[val]}
                    label={name}
                    onChange={handleChange}
                    autoWidth
                    sx={{ margin: '10px 0 10px 0' }}
                >
                    {rett}
                </Select>
            </FormControl>
        );
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                {ret}
            </Box>
        );
    }
    return (<></>);
}
