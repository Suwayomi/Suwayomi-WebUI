/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Box } from '@mui/system';
import {
    Input,
    InputLabel,
    FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
    state: string
    name: string
}

export default function TextFilter(props: Props) {
    const { state, name } = props;

    const [val, setval] = React.useState({
        [name]: state,
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const tmp = val;
        tmp[e.target.name] = e.target.value === '' ? '' : e.target.value;
        setval({
            ...tmp,
        });
    }

    // eslint-disable-next-line eqeqeq
    if (state != undefined) {
        const ret = (
            <>
                <SearchIcon
                    sx={{
                        margin: 'auto',
                    }}
                />
                <FormControl fullWidth>
                    <InputLabel sx={{ margin: '10px 0 10px 0' }}>
                        {name}
                    </InputLabel>
                    <Input
                        name={name}
                        value={val[name] || ''}
                        onChange={handleChange}
                        sx={{ margin: '10px 0 10px 0' }}
                    />
                </FormControl>
            </>
        );
        return (
            <Box sx={{ display: 'flex', flexDirection: 'row', minWidth: 120 }}>
                {ret}
            </Box>
        );
    }
    return (<></>);
}
