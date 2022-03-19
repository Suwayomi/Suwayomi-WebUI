/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Box } from '@mui/system';
import { FormControlLabel } from '@mui/material';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';

interface Props {
    state: number
    name: string
    position: number
    group: number | undefined
    updateFilterValue: Function
    update: any
}

export default function TriStateFilter(props: Props) {
    const {
        state,
        name,
        position,
        group,
        updateFilterValue,
        update,
    } = props;
    const [val, setval] = React.useState({
        [name]: state,
    });

    /**
     * It takes a checked value and updates the value of the filter
     * @param {boolean | null | undefined} checked - The value of the checkbox.
     */
    const handleChange = (checked: boolean | null | undefined) => {
        const tmp = val;
        if (checked !== undefined) {
            tmp[name] = checked ? 1 : 2;
        } else {
            delete tmp[name];
        }
        setval({
            ...tmp,
        });
        const upd = update.filter((e: {
            position: number; group: number | undefined;
        }) => !(position === e.position && group === e.group));
        updateFilterValue([...upd, {
            position,
            state: (tmp[name] === undefined ? 0 : tmp[name]).toString(),
            group,
        }]);
    };

    if (state !== undefined) {
        let check;
        if (val[name] !== 0) {
            check = val[name] === 1;
        } else {
            check = undefined;
        }
        return (
            <Box sx={{ marginLeft: 3 }}>
                <FormControlLabel
                    key={name}
                    control={(
                        <ThreeStateCheckbox name="Unread" checked={check} onChange={(checked) => handleChange(checked)} />
                    )}
                    label={name}
                />
            </Box>
        );
    }
    return (<></>);
}
