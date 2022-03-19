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
    onChange: (change: boolean | undefined | null, name: string) => void
}

enum CheckState {
    SELECTED, INTERMEDIATE, UNSELECTED,
}

/**
 * It takes a boolean value and returns a CheckState value.
 * @param {boolean | undefined | null} checked - The checked state of the checkbox.
 * @returns The `checkedToState` function returns a `CheckState` based on the `checked` value.
 */
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
/**
 * It takes a CheckState and returns a boolean or undefined.
 * @param {CheckState} state - The check state of the checkbox.
 * @returns The `stateToChecked` function returns a boolean or undefined.
 */
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

/**
 * It takes a state and returns the next state.
 * @param {CheckState} state - The current state of the checkbox.
 * @returns The next state.
 */
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

/**
 * It creates a checkbox with three states: selected, intermediate, and unselected.
 * @param {IThreeStateCheckboxProps} props - IThreeStateCheckboxProps
 */
const ThreeStateCheckbox = (props: IThreeStateCheckboxProps) => {
    const {
        name, checked, onChange,
    } = props;
    const [localChecked, setLocalChecked] = useState(checkedToState(checked));
    useEffect(() => setLocalChecked(checkedToState(checked)), [checked]);
    /**
     * The function takes the current state of the checkbox and returns the next state of the checkbox.
     * 
     * 
     * The function is called every time the checkbox is clicked
     * @param e - React.ChangeEvent<HTMLInputElement>
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalChecked(stateTransition(localChecked));
        if (onChange) {
            onChange(stateToChecked(stateTransition(localChecked)), e.currentTarget.name);
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
