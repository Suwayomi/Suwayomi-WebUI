/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Box } from '@mui/system';

interface Props {
    name: string
}

/**
 * It returns a box with the name of the filter.
 * @param {Props} props - Props
 */
export default function SeperatorFilter(props: Props) {
    const { name } = props;
    return (<Box key={name}>{name}</Box>);
}
