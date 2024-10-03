/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ComponentProps } from 'react';

import { ButtonSelect } from '@/modules/core/components/buttons/ButtonSelect.tsx';

export const ButtonSelectInput = <Value extends string | number>({
    label,
    ...buttonSelectProps
}: ComponentProps<typeof ButtonSelect<Value>> & { label: string }) => (
    <Stack>
        <Typography>{label}</Typography>
        <ButtonSelect {...buttonSelectProps} />
    </Stack>
);
