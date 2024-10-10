/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const TapZone = ({ title, ...stackProps }: StackProps & { title: String }) => (
    <Stack
        {...stackProps}
        sx={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            ...stackProps?.sx,
        }}
    >
        <Typography
            component="h1"
            variant="h2"
            sx={{
                wordBreak: 'break-word',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px  1px 0 #000, 1px  1px 0 #000;',
                userSelect: 'none',
            }}
        >
            {title}
        </Typography>
    </Stack>
);
