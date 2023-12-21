/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Fab, Menu, Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Download from '@mui/icons-material/Download';
import Delete from '@mui/icons-material/Delete';
import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import Done from '@mui/icons-material/Done';
import RemoveDone from '@mui/icons-material/RemoveDone';
import { DEFAULT_FAB_STYLE } from '@/components/util/StyledFab';
import { SelectionFABActionItem } from '@/components/manga/SelectionFABActionItem';
import type { IChapterWithMeta } from '@/components/manga/ChapterList';

type SelectionAction = 'download' | 'delete' | 'bookmark' | 'unbookmark' | 'mark_as_read' | 'mark_as_unread';

interface SelectionFABProps {
    selectedChapters: IChapterWithMeta[];
    onAction: (action: SelectionAction, chapters: IChapterWithMeta[]) => void;
}

export const SelectionFAB: React.FC<SelectionFABProps> = (props) => {
    const { t } = useTranslation();

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
                ...DEFAULT_FAB_STYLE,
                height: `calc(${DEFAULT_FAB_STYLE.height} + 1)`,
                pt: 1,
                zIndex: 1, // the "Checkbox" (MUI) component of the "ChapterCard" has z-index 1, which causes it to take over the mouse events
            }}
            ref={anchorEl}
        >
            <Fab variant="extended" color="primary" id="selectionMenuButton" onClick={() => setOpen(true)}>
                {`${count} ${t('chapter.title', { count })}`}
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
                    Icon={Download}
                    matchingItems={selectedChapters.filter(
                        ({ chapter: c, downloadChapter: dc }) => !c.isDownloaded && dc === undefined,
                    )}
                    onClick={handleAction}
                    title={t('chapter.action.download.add.button.selected')}
                />
                <SelectionFABActionItem
                    action="delete"
                    Icon={Delete}
                    matchingItems={selectedChapters.filter(({ chapter }) => chapter.isDownloaded)}
                    onClick={handleAction}
                    title={t('chapter.action.download.delete.button.selected')}
                />
                <SelectionFABActionItem
                    action="bookmark"
                    Icon={BookmarkAdd}
                    matchingItems={selectedChapters.filter(({ chapter }) => !chapter.isBookmarked)}
                    onClick={handleAction}
                    title={t('chapter.action.bookmark.add.button.selected')}
                />
                <SelectionFABActionItem
                    action="unbookmark"
                    Icon={BookmarkRemove}
                    matchingItems={selectedChapters.filter(({ chapter }) => chapter.isBookmarked)}
                    onClick={handleAction}
                    title={t('chapter.action.bookmark.remove.button.selected')}
                />
                <SelectionFABActionItem
                    action="mark_as_read"
                    Icon={Done}
                    matchingItems={selectedChapters.filter(({ chapter }) => !chapter.isRead)}
                    onClick={handleAction}
                    title={t('chapter.action.mark_as_read.add.button.selected')}
                />
                <SelectionFABActionItem
                    action="mark_as_unread"
                    Icon={RemoveDone}
                    matchingItems={selectedChapters.filter(({ chapter }) => chapter.isRead)}
                    onClick={handleAction}
                    title={t('chapter.action.mark_as_read.remove.button.selected')}
                />
            </Menu>
        </Box>
    );
};
