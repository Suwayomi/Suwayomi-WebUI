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
    position: number
    group: number | undefined
    updateFilterValue: Function
    update: any
}

/**
 * It creates a text input for the filter bar
 * @param {Props} props - Props
 */
export default function TextFilter(props: Props) {
    const {
        state,
        name,
        position,
        group,
        updateFilterValue,
        update,
    } = props;
    const [Search, setsearch] = React.useState(state || '');
    let typingTimer: NodeJS.Timeout;

    /**
     * It updates the state of the filter value.
     * @param e - React.ChangeEvent<HTMLInputElement>
     */
    function doneTyping(e: React.ChangeEvent<HTMLInputElement>) {
        const upd = update.filter((el: {
            position: number; group: number | undefined;
        }) => !(position === el.position && group === el.group));
        updateFilterValue([...upd, { position, state: e.target.value, group }]);
    }

    /**
     * It sets the state of the search variable to the value of the input field.
     * @param e - React.ChangeEvent<HTMLInputElement>
     */
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setsearch(e.target.value);

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => { doneTyping(e); }, 2500);
    }

    if (state !== undefined) {
        return (
            <Box key={`${name}`} sx={{ display: 'flex', flexDirection: 'row', minWidth: 120 }}>
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
                            value={Search || ''}
                            onChange={handleChange}
                            sx={{ margin: '10px 0 10px 0' }}
                        />
                    </FormControl>
                </>
            </Box>
        );
    }
    return (<></>);
}
