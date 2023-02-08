/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import React from 'react';

interface Props {
    state: string;
    name: string;
    position: number;
    group: number | undefined;
    updateFilterValue: Function;
    update: any;
}

const TextFilter: React.FC<Props> = (props) => {
    const { state, name, position, group, updateFilterValue, update } = props;
    const [Search, setsearch] = React.useState(state || '');
    let typingTimer: NodeJS.Timeout;

    function doneTyping(e: React.ChangeEvent<HTMLInputElement>) {
        const upd = update.filter(
            (el: { position: number; group: number | undefined }) => !(position === el.position && group === el.group),
        );
        updateFilterValue([...upd, { position, state: e.target.value, group }]);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setsearch(e.target.value);

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            doneTyping(e);
        }, 2500);
    }

    if (state !== undefined) {
        return (
            <FormControl sx={{ my: 1 }} variant="standard">
                <InputLabel>{name}</InputLabel>
                <Input
                    name={name}
                    value={Search || ''}
                    onChange={handleChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    }
                />
            </FormControl>
        );
    }
    return <></>;
};

export default TextFilter;
