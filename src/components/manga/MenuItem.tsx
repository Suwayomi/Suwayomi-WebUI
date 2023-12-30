/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ListItemIcon, ListItemText, MenuItem as MuiMenuItem } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon/SvgIcon';

interface IProps {
    title: string;
    Icon: OverridableComponent<SvgIconTypeMap> & { muiName: string };
    onClick: () => void;
    isDisabled?: boolean;
}

export const MenuItem = ({ onClick, title, Icon, isDisabled }: IProps) => (
    <MuiMenuItem onClick={onClick} disabled={isDisabled}>
        <ListItemIcon>
            <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{title}</ListItemText>
    </MuiMenuItem>
);
