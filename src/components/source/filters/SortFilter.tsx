/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemButton, ListItemText, Stack } from '@mui/material';
import { Box } from '@mui/system';
import SortRadioInput from 'components/atoms/SortRadioInput';
import React from 'react';
import { IState } from 'typings';

interface Props {
    values: any;
    name: string;
    state: IState;
    position: number;
    group: number | undefined;
    updateFilterValue: Function;
    update: any;
}

const SortFilter: React.FC<Props> = (props: Props) => {
    const { values, name, state, position, group, updateFilterValue, update } = props;
    const [val, setval] = React.useState(state);

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    if (values) {
        const handleChange = (index: number) => {
            const tmp = val;
            if (tmp.index === index) {
                tmp.ascending = !tmp.ascending;
            } else {
                tmp.ascending = true;
            }
            tmp.index = index;
            setval(tmp);
            const upd = update.filter(
                (e: { position: number; group: number | undefined }) => !(position === e.position && group === e.group),
            );
            updateFilterValue([...upd, { position, state: JSON.stringify(tmp), group }]);
        };

        return (
            <Box sx={{ mx: -2 }}>
                <ListItemButton onClick={handleClick}>
                    <ListItemText primary={name} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open}>
                    <Stack sx={{ mx: 4 }}>
                        {values.map((value: string, index: number) => (
                            <SortRadioInput
                                key={`${name} ${value}`}
                                label={value}
                                checked={val.index === index}
                                sortDescending={!val.ascending}
                                onClick={() => handleChange(index)}
                            />
                        ))}
                    </Stack>
                </Collapse>
            </Box>
        );
    }
    return null;
};

export default SortFilter;
