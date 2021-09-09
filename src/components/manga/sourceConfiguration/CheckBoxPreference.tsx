/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

export default function CheckBoxPreference({ title, summary }: CheckBoxPreferenceProps) {
    return (
        <ListItem>
            <ListItemText
                primary={title}
                secondary={summary}
            />
        </ListItem>
    );
}
