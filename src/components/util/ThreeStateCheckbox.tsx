/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Checkbox, createSvgIcon } from '@mui/material';
import React, {
    useEffect, useState,
} from 'react';

export interface IThreeStateCheckboxProps {
    name: string
    checked: boolean | undefined | null
    onChange: (change: boolean | undefined | null) => void
}

enum CheckState {
    SELECTED, INTERMEDIATE, UNSELECTED,
}

function checkedToState(checked: boolean | undefined | null): CheckState {
    switch (checked) {
        case true:
            return CheckState.SELECTED;
        case false:
            return CheckState.INTERMEDIATE;
        default:
            return CheckState.UNSELECTED;
    }
}
function stateToChecked(state: CheckState): boolean | undefined {
    switch (state) {
        case CheckState.SELECTED:
            return true;
        case CheckState.INTERMEDIATE:
            return false;
        default:
        case CheckState.UNSELECTED:
            return undefined;
    }
}

function stateTransition(state: CheckState): CheckState {
    switch (state) {
        case CheckState.SELECTED:
            return CheckState.INTERMEDIATE;
        case CheckState.INTERMEDIATE:
            return CheckState.UNSELECTED;
        case CheckState.UNSELECTED:
        default:
            return CheckState.SELECTED;
    }
}

const ThreeStateCheckbox = (props: IThreeStateCheckboxProps) => {
    const {
        name, checked, onChange,
    } = props;
    const [localChecked, setLocalChecked] = useState(checkedToState(checked));
    useEffect(() => setLocalChecked(checkedToState(checked)), [checked]);
    const handleChange = () => {
        setLocalChecked(stateTransition(localChecked));
        if (onChange) {
            onChange(stateToChecked(stateTransition(localChecked)));
        }
    };
    const CancelBox = createSvgIcon(
        <>
            <path
                d="M 19 6.41 L 13.41 12 L 19 17.59 L 17.59 19 L 12 13.41 L 6.41 19 V 19 H 6.41 L 5 17.59 L 11 12 L 5 6.41 L 6.41 5 L 12 10.59 L 17.59 5 L 19 6.41 M 5 5 m 0 -2 H 5 c -1.1 0 -2 0.9 -2 2 v 14 c 0 1.1 0.9 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 z "
            />
        </>,
        'CancelBox',
    );

    return (
        <Checkbox
            name={name}
            checked={localChecked === CheckState.SELECTED}
            indeterminate={localChecked === CheckState.INTERMEDIATE}
            indeterminateIcon={<CancelBox />}
            onChange={handleChange}
            className={`${localChecked}`}
        />
    );
};
export default ThreeStateCheckbox;
