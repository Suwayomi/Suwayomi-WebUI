/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Download from '@mui/icons-material/Download';
import Delete from '@mui/icons-material/Delete';
import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import Done from '@mui/icons-material/Done';
import RemoveDone from '@mui/icons-material/RemoveDone';
import { useTranslation } from 'react-i18next';
import { SelectionFABActionItem } from '@/components/manga/SelectionFABActionItem.tsx';
import { IChapterWithMeta } from '@/components/manga/ChapterList.tsx';

type SelectionAction = 'download' | 'delete' | 'bookmark' | 'unbookmark' | 'mark_as_read' | 'mark_as_unread';

export const ChapterSelectionFABActionItems = ({
    selectedChapters,
    onAction,
    handleClose,
}: {
    selectedChapters: IChapterWithMeta[];
    onAction: (action: SelectionAction, chapters: IChapterWithMeta[]) => void;
    handleClose: () => void;
}) => {
    const { t } = useTranslation();

    const handleAction = (action: SelectionAction, chapters: IChapterWithMeta[]) => {
        onAction(action, chapters);
        handleClose();
    };

    return (
        <>
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
        </>
    );
};
