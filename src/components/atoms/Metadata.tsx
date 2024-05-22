/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack, { StackProps } from '@mui/material/Stack';
import Typography, { TypographyProps } from '@mui/material/Typography';

export const Metadata = ({
    title,
    value,
    stackProps,
    titleProps,
    valueProps,
}: {
    title: string;
    value: string;
    stackProps?: StackProps;
    titleProps?: TypographyProps;
    valueProps?: TypographyProps;
}) => (
    <Stack
        {...stackProps}
        sx={{ flexDirection: 'row', columnGap: 1, flexWrap: 'wrap', alignItems: 'baseline', ...stackProps?.sx }}
    >
        <Typography {...titleProps}>{title}</Typography>
        <Typography color="text.secondary" {...valueProps}>
            {value}
        </Typography>
    </Stack>
);
