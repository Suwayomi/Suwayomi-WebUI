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
    position: number
    group: number | undefined
    updateFilterValue: Function
    update: any
}

export default function CheckBoxFilter(props: Props) {
    const {
        state,
        name,
        position,
        group,
        updateFilterValue,
        update,
    } = props;
    const [val, setval] = React.useState(state);

    /**
     * It updates the state of the checkbox.
     * @param event - The event object that was passed to the callback.
     */
    const handleChange = (event: { target: { name: any; checked: any; }; }) => {
        setval(event.target.checked);
        const upd = update.filter((e: {
            position: number; group: number | undefined;
        }) => !(position === e.position && group === e.group));
        updateFilterValue([...upd, { position, state: event.target.checked.toString(), group }]);
    };

    if (state !== undefined) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                <FormControlLabel
                    key={name}
                    control={(
                        <Checkbox
                            name={name}
                            checked={val}
                            onChange={handleChange}
                        />
                    )}
                    label={name}
                />
            </Box>
        );
    }
    return (<></>);
}
