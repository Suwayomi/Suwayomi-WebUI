/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Slider, { SliderProps } from '@mui/material/Slider';
import Typography, { TypographyProps } from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export const SliderInput = ({
    label,
    slotProps,
}: {
    label: string;
    slotProps?: {
        typography?: TypographyProps;
        slider?: SliderProps;
    };
}) => (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        <Typography
            {...slotProps?.typography}
            sx={{ flexBasis: '25%', whiteSpace: 'pre-line', ...slotProps?.typography?.sx }}
        >
            {label}
        </Typography>
        <Slider {...slotProps?.slider} sx={{ flexBasis: '75%', ...slotProps?.slider?.sx }} />
    </Stack>
);
