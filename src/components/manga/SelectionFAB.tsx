/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Fab, Menu } from '@mui/material';
import { Box } from '@mui/system';
import { pluralize } from 'components/util/helpers';
import React, { useRef, useState } from 'react';
import type { IChapterWithMeta } from 'components/manga/ChapterList';
import SelectionFABActionItem from 'components/manga/SelectionFABActionItem';

export type SelectionAction =
    | 'download'
    | 'delete'
    | 'bookmark'
    | 'unbookmark'
    | 'mark_as_read'
    | 'mark_as_unread';

interface SelectionFABProps {
    selectedChapters: IChapterWithMeta[];
    onAction: (action: SelectionAction, chapters: IChapterWithMeta[]) => void;
}

const SelectionFAB: React.FC<SelectionFABProps> = (props) => {
    const { selectedChapters, onAction } = props;
    const count = selectedChapters.length;

    const anchorEl = useRef<HTMLElement>();
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    const handleAction = (action: SelectionAction, chapters: IChapterWithMeta[]) => {
        onAction(action, chapters);
        handleClose();
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: '2em',
                right: '3em',
                pt: 1,
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
                <SelectionFABActionItem
                    action="download"
                    matchingChapters={selectedChapters.filter(
                        ({ chapter: c, downloadChapter: dc }) => !c.downloaded && dc === undefined,
                    )}
                    onClick={handleAction}
                    title="Download selected"
                />
                <SelectionFABActionItem
                    action="delete"
                    matchingChapters={selectedChapters.filter(({ chapter }) => chapter.downloaded)}
                    onClick={handleAction}
                    title="Delete selected"
                />
                <SelectionFABActionItem
                    action="bookmark"
                    matchingChapters={selectedChapters.filter(({ chapter }) => !chapter.bookmarked)}
                    onClick={handleAction}
                    title="Bookmark selected"
                />
                <SelectionFABActionItem
                    action="unbookmark"
                    matchingChapters={selectedChapters.filter(({ chapter }) => chapter.bookmarked)}
                    onClick={handleAction}
                    title="Remove bookmarks from selected"
                />
                <SelectionFABActionItem
                    action="mark_as_read"
                    matchingChapters={selectedChapters.filter(({ chapter }) => !chapter.read)}
                    onClick={handleAction}
                    title="Mark selected as read"
                />
                <SelectionFABActionItem
                    action="mark_as_unread"
                    matchingChapters={selectedChapters.filter(({ chapter }) => chapter.read)}
                    onClick={handleAction}
                    title="Mark selected as unread"
                />
            </Menu>
        </Box>
    );
};

export default SelectionFAB;
