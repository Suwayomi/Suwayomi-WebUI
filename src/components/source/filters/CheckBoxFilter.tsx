/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Box } from '@mui/system';
import { Checkbox, FormControlLabel } from '@mui/material';

interface Props {
    state: boolean
    name: string
}

export default function CheckBoxFilter(props: Props) {
    const { state, name } = props;
    // eslint-disable-next-line no-console
    console.log(state, name);
    const [val, setval] = React.useState({
        [name]: state,
    });

    const handleChange = (event: { target: { name: any; checked: any; }; }) => {
        const tmp = val;
        tmp[event.target.name] = event.target.checked;
        setval({
            ...tmp,
        });
    };

    // eslint-disable-next-line eqeqeq
    if (state != undefined) {
        const ret = (
            // eslint-disable-next-line max-len
            <FormControlLabel key={name} control={<Checkbox name={name} checked={val[name]} onChange={handleChange} />} label={name} />
        );
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                {ret}
            </Box>
        );
    }
    return (<></>);
}
