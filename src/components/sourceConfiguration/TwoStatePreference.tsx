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

function getTwoStateType(type: 'Checkbox' | 'Switch') {
    if (type === 'Switch') { return Switch; }
    return Checkbox;
}

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

export function CheckBoxPreference(props: CheckBoxPreferenceProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TwoSatePreference {...props} type="Checkbox" />;
}
export function SwitchPreferenceCompat(props: SwitchPreferenceCompatProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TwoSatePreference {...props} type="Switch" />;
}

export default { CheckBoxPreference, SwitchPreferenceCompat };
