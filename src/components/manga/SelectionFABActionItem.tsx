/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon/SvgIcon';

interface IProps<Action, Item> {
    action: Action;
    matchingItems: Item[];
    title: string;
    Icon: OverridableComponent<SvgIconTypeMap> & { muiName: string };
    onClick: (action: Action, items: Item[]) => void;
}

export const SelectionFABActionItem = <Action extends string, Item>({
    action,
    matchingItems,
    onClick,
    title,
    Icon,
}: IProps<Action, Item>) => {
    const count = matchingItems.length;
    return (
        <MenuItem onClick={() => onClick(action, matchingItems)} disabled={count === 0}>
            <ListItemIcon>
                <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
                {title}
                {count > 0 ? ` (${count})` : ''}
            </ListItemText>
        </MenuItem>
    );
};
