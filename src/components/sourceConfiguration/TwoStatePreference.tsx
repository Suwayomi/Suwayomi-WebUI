/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';

/**
 * It returns the correct component type for the given type.
 * @param {'Checkbox' | 'Switch'} type - The type of the component.
 * @returns A React component.
 */
function getTwoStateType(type: 'Checkbox' | 'Switch') {
    if (type === 'Switch') { return Switch; }
    return Checkbox;
}

/**
 * It creates a ListItem with a ListItemText and a ListItemSecondaryAction
 * @param {TwoStatePreferenceProps} props - A prop that's passed in from the caller.
 * @returns A list item.
 */
function TwoSatePreference(props: TwoStatePreferenceProps) {
    const {
        title, summary, currentValue, updateValue, type,
    } = props;
    const [internalCurrentValue, setInternalCurrentValue] = useState<boolean>(currentValue);

    useEffect(() => {
        setInternalCurrentValue(currentValue);
    }, [currentValue]);

    return (
        <ListItem>
            <ListItemText primary={title} secondary={summary} />
            <ListItemSecondaryAction>
                {React.createElement(getTwoStateType(type),
                    {
                        edge: 'end',
                        checked: internalCurrentValue,
                        onChange: () => {
                            updateValue(!currentValue);

                            // appear smooth
                            setInternalCurrentValue(!currentValue);
                        },
                    })}
            </ListItemSecondaryAction>
        </ListItem>
    );
}

/**
 * It creates a checkbox preference.
 * @param {CheckBoxPreferenceProps} props - CheckBoxPreferenceProps
 * @returns A React component.
 */
export function CheckBoxPreference(props: CheckBoxPreferenceProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TwoSatePreference {...props} type="Checkbox" />;
}
/**
 * It creates a new component that is a copy of the TwoSatePreference component, but with the type set
 * to "Switch".
 * @param {SwitchPreferenceCompatProps} props - SwitchPreferenceCompatProps
 * @returns A `TwoSatePreference` component.
 */
export function SwitchPreferenceCompat(props: SwitchPreferenceCompatProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TwoSatePreference {...props} type="Switch" />;
}

/* It exports the two components as a default export. */
export default { CheckBoxPreference, SwitchPreferenceCompat };
