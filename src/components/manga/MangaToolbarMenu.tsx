/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Label from '@mui/icons-material/Label';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Refresh from '@mui/icons-material/Refresh';
import {
    IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import CategorySelect from 'components/navbar/action/CategorySelect';
import React, { useState } from 'react';

interface IProps {
    manga: IManga;
    onRefresh: () => any;
    refreshing: boolean;
}

const MangaToolbarMenu = ({ manga, onRefresh, refreshing }: IProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [editCategories, setEditCategories] = useState(false);

    return (
        <>
            <IconButton
                id="chaptersMenuButton"
                aria-controls={open ? 'chaptersMenu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                <MoreHoriz />
            </IconButton>
            <Menu
                id="chaptersMenu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'chaptersMenuButton',
                }}
            >
                <MenuItem
                    onClick={() => { onRefresh(); handleClose(); }}
                    disabled={refreshing}
                >
                    <ListItemIcon>
                        <Refresh fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Reload data from source
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={manga.inLibrary !== true}
                    onClick={() => { setEditCategories(true); handleClose(); }}
                >
                    <ListItemIcon>
                        <Label fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Edit manga categories
                    </ListItemText>
                </MenuItem>
            </Menu>

            <CategorySelect
                open={editCategories}
                setOpen={setEditCategories}
                mangaId={manga.id}
            />
        </>
    );
};

export default MangaToolbarMenu;
