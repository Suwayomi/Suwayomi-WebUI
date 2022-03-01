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
}

export default function TriStateFilter(props: Props) {
    const {
        state,
        name,
        position,
        group,
        updateFilterValue,
    } = props;
    const [val, setval] = React.useState({
        [name]: state,
    });

    // eslint-disable-next-line max-len
    const handleChange = (checked: boolean | null | undefined) => {
        const tmp = val;
        // eslint-disable-next-line eqeqeq
        if (checked != undefined) {
            tmp[name] = checked ? 1 : 2;
        } else {
            delete tmp[name];
        }
        setval({
            ...tmp,
        });
        // eslint-disable-next-line max-len
        updateFilterValue({ position, state: (tmp[name] === undefined ? 0 : tmp[name]).toString(), group });
    };

    if (state !== undefined) {
        let check;
        if (val[name] !== 0) {
            check = val[name] === 1;
        } else {
            check = undefined;
        }
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
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
