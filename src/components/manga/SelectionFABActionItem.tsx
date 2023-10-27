/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import Delete from '@mui/icons-material/Delete';
import Done from '@mui/icons-material/Done';
import Download from '@mui/icons-material/Download';
import RemoveDone from '@mui/icons-material/RemoveDone';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import React from 'react';
import type { IChapterWithMeta } from '@/components/manga/ChapterList';
import type { SelectionAction } from '@/components/manga/SelectionFAB';

interface IProps {
    action: SelectionAction;
    matchingChapters: IChapterWithMeta[];
    title: string;
    onClick: (action: SelectionAction, chapters: IChapterWithMeta[]) => void;
}

const ICONS = {
    download: Download,
    delete: Delete,
    bookmark: BookmarkAdd,
    unbookmark: BookmarkRemove,
    mark_as_read: Done,
    mark_as_unread: RemoveDone,
};

export const SelectionFABActionItem: React.FC<IProps> = ({ action, matchingChapters, onClick, title }) => {
    const count = matchingChapters.length;
    const Icon = ICONS[action];
    return (
        <MenuItem onClick={() => onClick(action, matchingChapters)} disabled={count === 0}>
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
