/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Download from '@mui/icons-material/Download';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import {
    Fab, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import { pluralize } from 'components/util/helpers';
import React, { useRef, useState } from 'react';

interface SelectionFABProps{
    selectedChapters: IChapter[]
    onAction: (action: 'download') => void
}

const SelectionFAB: React.FC<SelectionFABProps> = (props) => {
    const { selectedChapters, onAction } = props;
    const count = selectedChapters.length;

    const anchorEl = useRef<HTMLElement>();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    return (
        <Box
            sx={{
                position: 'fixed', bottom: '2em', right: '3em', pt: 1,
            }}
            ref={anchorEl}
        >
            <Fab
                variant="extended"
                color="primary"
                id="selectionMenuButton"
                onClick={() => setOpen(true)}
            >
                {`${count} ${pluralize(count, 'chapter')}`}
                <MoreHoriz sx={{ ml: 1 }} />
            </Fab>
            <Menu
                id="selectionMenu"
                anchorEl={anchorEl.current}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                MenuListProps={{
                    'aria-labelledby': 'selectionMenuButton',
                }}
            >
                <MenuItem
                    onClick={() => { onAction('download'); handleClose(); }}
                >
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Download selected
                    </ListItemText>
                </MenuItem>
                {/* <MenuItem onClick={() => { onClearSelection(); handleClose(); }}>
                    <ListItemIcon>
                        <Clear fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        ClearSelection
                    </ListItemText>
                </MenuItem> */}
            </Menu>
        </Box>
    );
};

export default SelectionFAB;
