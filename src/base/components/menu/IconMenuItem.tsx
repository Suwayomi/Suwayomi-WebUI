/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/*
 * src: https://github.com/webzep/mui-nested-menu/blob/main/packages/mui-nested-menu/src/components/IconMenuItem.tsx (2024-04-20 01:42)
 */

import ListItemIcon from '@mui/material/ListItemIcon';
import type { MenuItemProps as MuiMenuItemProps } from '@mui/material/MenuItem';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import type { Ref } from 'react';
import React from 'react';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import ListItemText from '@mui/material/ListItemText';

type IconMenuItemProps = {
    MenuItemProps?: MuiMenuItemProps;
    className?: string;
    disabled?: boolean;
    label?: string;
    renderLabel?: () => React.ReactNode;
    LeftIcon?: OverridableComponent<SvgIconTypeMap> & { muiName: string };
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    ref?: Ref<HTMLLIElement | null>;
    RightIcon?: OverridableComponent<SvgIconTypeMap> & { muiName: string };
    sx?: SxProps<Theme>;
};

export const IconMenuItem = ({
    MenuItemProps,
    className,
    label,
    LeftIcon,
    renderLabel,
    RightIcon,
    ...props
}: IconMenuItemProps) => (
    <MenuItem {...MenuItemProps} className={className} {...props}>
        {LeftIcon && (
            <ListItemIcon>
                <LeftIcon fontSize="small" />
            </ListItemIcon>
        )}
        <ListItemText>{label}</ListItemText>
        {RightIcon && (
            <ListItemIcon style={{ minWidth: 0 }}>
                <RightIcon fontSize="small" />
            </ListItemIcon>
        )}
    </MenuItem>
);
