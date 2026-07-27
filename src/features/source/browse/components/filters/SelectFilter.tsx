/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { IPos } from '@/features/source/Source.types.ts';
import isEqual from 'lodash/fp/isEqual';

interface Props {
    values: any;
    name: string;
    state: number;
    positions: number[];
    updateFilterValue: (value: IPos[]) => void;
    update: any;
}

function NoSelect(
    values: string[],
    name: string,
    state: number,
    positions: number[],
    updateFilterValue: (value: IPos[]) => void,
    update: any,
) {
    const [val, setval] = useState(state);

    if (values) {
        const handleChange = (event: { target: { name: any; value: any } }) => {
            const vall = values.indexOf(`${event.target.value}`);
            setval(vall);
            const upd = update.filter((e: { positions: number[] }) => !isEqual(positions, e.positions));
            updateFilterValue([...upd, { type: 'selectState', positions, state: vall }]);
        };

        const rett = values.map((value: string) => (
            <MenuItem key={`${name} ${value}`} value={value}>
                {value}
            </MenuItem>
        ));
        return (
            <FormControl sx={{ my: 1 }} variant="standard">
                <InputLabel>{name}</InputLabel>
                <Select name={name} value={values[val]} label={name} onChange={handleChange}>
                    {rett}
                </Select>
            </FormControl>
        );
    }
    return null;
}

export const SelectFilter: React.FC<Props> = ({ values, name, state, positions, updateFilterValue, update }) =>
    NoSelect(values, name, state, positions, updateFilterValue, update);
