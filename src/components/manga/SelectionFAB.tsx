/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import {
    Fab, ListItemIcon, ListItemText, Menu, MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import { pluralize } from 'components/util/helpers';
import React, { useRef, useState } from 'react';
import type { IChapterWithMeta } from './ChapterList';

interface SelectionFABProps{
    selectedChapters: IChapterWithMeta[]
    onAction: (action: 'download' | 'delete', chapters: IChapterWithMeta[]) => void
}

const SelectionFAB: React.FC<SelectionFABProps> = (props) => {
    const { selectedChapters, onAction } = props;
    const count = selectedChapters.length;

    const anchorEl = useRef<HTMLElement>();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    const notDownloadedChapters = selectedChapters.filter(
        ({ chapter, downloadChapter }) => !chapter.downloaded && downloadChapter === undefined,
    );
    const notDownloadedCount = notDownloadedChapters.length;

    const downloadedChapters = selectedChapters.filter(({ chapter }) => chapter.downloaded);
    const downloadedCount = downloadedChapters.length;

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
                    onClick={() => { onAction('download', notDownloadedChapters); handleClose(); }}
                    disabled={notDownloadedCount === 0}
                >
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Download selected
                        {notDownloadedCount > 0 ? ` (${notDownloadedCount})` : ''}
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => { onAction('delete', downloadedChapters); handleClose(); }}
                    disabled={downloadedCount === 0}
                >
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Delete selected
                        {downloadedCount > 0 ? ` (${downloadedCount})` : ''}
                    </ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default SelectionFAB;
