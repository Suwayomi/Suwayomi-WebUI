/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ListSubheaderProps } from '@mui/material/ListSubheader';
// oxlint-disable-next-line no-restricted-imports
import MuiListSubheader from '@mui/material/ListSubheader';
import { OffsetComponent } from '@/base/OffsetComponent.tsx';
import type { ComponentProps } from 'react';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export const ListSubheader = ({
    children,
    disableSticky,
    customSticky = true,
    customOffsetProps,
    ...props
}: ListSubheaderProps & { customSticky?: boolean; customOffsetProps?: ComponentProps<typeof OffsetComponent> }) => {
    if (customSticky && !disableSticky) {
        return (
            <OffsetComponent
                {...customOffsetProps}
                sx={MUIUtil.mergeSx({ backgroundColor: 'background.paper' }, customOffsetProps?.sx)}
            >
                <MuiListSubheader {...props} disableSticky>
                    {children}
                </MuiListSubheader>
            </OffsetComponent>
        );
    }

    return (
        <MuiListSubheader {...props} disableSticky={disableSticky}>
            {children}
        </MuiListSubheader>
    );
};
