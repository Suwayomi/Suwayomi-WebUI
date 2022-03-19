/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
// adopted from: https://github.com/tachiyomiorg/tachiyomi/blob/master/app/src/main/java/eu/kanade/tachiyomi/widget/EmptyView.kt

import React from 'react';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Box } from '@mui/system';

const ERROR_FACES = [
    '(･o･;)',
    'Σ(ಠ_ಠ)',
    'ಥ_ಥ',
    '(˘･_･˘)',
    '(；￣Д￣)',
    '(･Д･。',
];

/**
 * Generate a random number between 0 and the length of the array, and return the element at that index
 * @returns A random error face.
 */
function getRandomErrorFace() {
    const randIndex = Math.floor(Math.random() * ERROR_FACES.length);
    return ERROR_FACES[randIndex];
}

interface IProps {
    message: string
    messageExtra?: JSX.Element
}

export default function EmptyView({ message, messageExtra }: IProps) {
    const theme = useTheme();
    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{
            position: 'absolute',
            left: `calc(50% + ${isMobileWidth ? '0px' : theme.spacing(8 / 2)})`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
        }}
        >
            <Typography variant="h3" gutterBottom>
                {getRandomErrorFace()}
            </Typography>
            <Typography variant="h5">
                {message}
            </Typography>
            {messageExtra}
        </Box>
    );
}

EmptyView.defaultProps = {
    messageExtra: undefined,
};
