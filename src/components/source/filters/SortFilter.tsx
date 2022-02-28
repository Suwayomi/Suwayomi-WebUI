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
    state: IState
}

export default function SortFilter(props: Props) {
    const {
        values,
        name,
        state,
    } = props;

    const [val, setval] = React.useState({
        [name]: state.index,
    });

    if (values) {
        const handleChange = (event: { target: { name: any; value: any; }; }) => {
            const tmp = val;
            tmp[event.target.name] = values.indexOf(`${event.target.value}`);
            setval({
                ...tmp,
            });
        };

        // eslint-disable-next-line max-len
        const rett = values.map((value: string) => (<MenuItem key={`${name} ${value}`} value={value}>{value}</MenuItem>));
        const ret = (
            <FormControl fullWidth>
                <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                    {name}
                </InputLabel>
                <Select
                    name={name}
                    value={values[val[name]]}
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
            <Box key={name} sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                {ret}
            </Box>
        );
    }
    return (<></>);
}
