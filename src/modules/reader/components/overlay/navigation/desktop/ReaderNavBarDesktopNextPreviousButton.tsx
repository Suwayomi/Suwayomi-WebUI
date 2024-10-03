/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tooltip from '@mui/material/Tooltip';
import { ComponentProps } from 'react';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton';

export const ReaderNavBarDesktopNextPreviousButton = ({
    title,
    children,
    ...customIconButtonProps
}: ComponentProps<typeof CustomIconButton> & {
    title: string;
}) => (
    <Tooltip title={title}>
        <CustomIconButton sx={{ minWidth: 0, px: 1, flexBasis: '15%' }} variant="contained" {...customIconButtonProps}>
            {children}
        </CustomIconButton>
    </Tooltip>
);
