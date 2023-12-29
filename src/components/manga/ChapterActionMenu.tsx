/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ListItemIcon, ListItemText } from '@mui/material';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import RemoveDone from '@mui/icons-material/RemoveDone';
import Done from '@mui/icons-material/Done';
import { useTranslation } from 'react-i18next';
import { bindMenu } from 'material-ui-popup-state';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import DoneAll from '@mui/icons-material/DoneAll';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import {
    ChapterAction,
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterReadInfo,
    Chapters,
} from '@/lib/data/Chapters.ts';
import { TChapter } from '@/typings.ts';

export const ChapterActionMenu = ({
    chapter,
    allChapters,
    handleSelection,
    canBeDownloaded,
    ...bindMenuProps
}: {
    chapter: ChapterDownloadInfo & ChapterBookmarkInfo & ChapterReadInfo;
    allChapters: TChapter[];
    handleSelection?: SelectableCollectionReturnType<TChapter['id']>['handleSelection'];
    canBeDownloaded: boolean;
} & ReturnType<typeof bindMenu>) => {
    const { t } = useTranslation();

    const {
        settings: { deleteChaptersManuallyMarkedRead },
    } = useMetadataServerSettings();

    const { isDownloaded } = chapter;

    const handleSelect = () => {
        handleSelection?.(chapter.id, true);
        bindMenuProps.onClose();
    };

    const performAction = (action: ChapterAction | 'mark_prev_as_read') => {
        const isMarkPrevAsRead = action === 'mark_prev_as_read';
        const actualAction: ChapterAction = isMarkPrevAsRead ? 'mark_as_read' : action;

        const getChapters = (): (ChapterDownloadInfo & ChapterBookmarkInfo & ChapterReadInfo)[] => {
            if (!isMarkPrevAsRead) {
                return [chapter];
            }

            const index = allChapters.findIndex(({ id: chapterId }) => chapterId === chapter.id);

            const isFirstChapter = index + 1 > allChapters.length - 1;
            if (isFirstChapter) {
                return [];
            }

            return allChapters.slice(index + 1);
        };

        Chapters.performAction(actualAction, [chapter.id], {
            chapters: getChapters(),
            autoDeleteChapters: deleteChaptersManuallyMarkedRead,
        });
        bindMenuProps.onClose();
    };

    return (
        <Menu {...bindMenuProps} open={bindMenuProps.open}>
            <MenuItem onClick={handleSelect}>
                <ListItemIcon>
                    <CheckBoxOutlineBlank fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('chapter.action.label.select')}</ListItemText>
            </MenuItem>
            {isDownloaded && (
                <MenuItem onClick={() => performAction('delete')}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('chapter.action.download.delete.label.action')}</ListItemText>
                </MenuItem>
            )}
            {canBeDownloaded && (
                <MenuItem onClick={() => performAction('download')}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('chapter.action.download.add.label.action')}</ListItemText>
                </MenuItem>
            )}
            <MenuItem onClick={() => performAction(chapter.isBookmarked ? 'unbookmark' : 'bookmark')}>
                <ListItemIcon>
                    {chapter.isBookmarked && <BookmarkRemove fontSize="small" />}
                    {!chapter.isBookmarked && <BookmarkAdd fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                    {chapter.isBookmarked && t('chapter.action.bookmark.remove.label.action')}
                    {!chapter.isBookmarked && t('chapter.action.bookmark.add.label.action')}
                </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => performAction(chapter.isRead ? 'mark_as_unread' : 'mark_as_read')}>
                <ListItemIcon>
                    {chapter.isRead && <RemoveDone fontSize="small" />}
                    {!chapter.isRead && <Done fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                    {chapter.isRead && t('chapter.action.mark_as_read.remove.label.action')}
                    {!chapter.isRead && t('chapter.action.mark_as_read.add.label.action.current')}
                </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => performAction('mark_prev_as_read')}>
                <ListItemIcon>
                    <DoneAll fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('chapter.action.mark_as_read.add.label.action.previous')}</ListItemText>
            </MenuItem>
        </Menu>
    );
};
