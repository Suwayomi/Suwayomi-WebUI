/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, ButtonProps, Stack } from '@mui/material';

export const CustomIconButton = ({ children, ...props }: ButtonProps) => (
    <Button {...props}>
        <Stack direction="row" alignItems="center" justifyContent="center" gap="10px" flexWrap="wrap">
            {children}
        </Stack>
    </Button>
);
