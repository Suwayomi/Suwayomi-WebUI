/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export const CustomIconButton = <C extends React.ElementType>({
    children,
    ...props
}: ButtonProps<C, { component?: C }>) => (
    <Button
        {...props}
        sx={MUIUtil.mergeSx(
            {
                minWidth: 'unset',
                px: '10px',
            },
            props.sx,
        )}
    >
        {children}
    </Button>
);
