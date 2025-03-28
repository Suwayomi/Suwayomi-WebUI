/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button, { ButtonProps } from '@mui/material/Button';
import { ForwardedRef, forwardRef } from 'react';

export const CustomButtonIcon = forwardRef(
    <C extends React.ElementType>(
        { children, ...props }: ButtonProps<C, { component?: C }>,
        ref: ForwardedRef<HTMLButtonElement | null>,
    ) => (
        <Button
            ref={ref}
            {...props}
            sx={{
                minWidth: 'unset',
                px: '10px',
                ...props.sx,
            }}
        >
            {children}
        </Button>
    ),
);
