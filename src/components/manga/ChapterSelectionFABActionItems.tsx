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
import { ChaptersWithMeta } from '@/lib/data/ChaptersWithMeta.ts';
import { ChapterAction, Chapters } from '@/lib/data/Chapters.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';

export const ChapterSelectionFABActionItems = ({
    selectedChapters,
    handleClose,
}: {
    selectedChapters: IChapterWithMeta[];
    handleClose: () => void;
}) => {
    const { t } = useTranslation();

    const {
        settings: { deleteChaptersManuallyMarkedRead },
    } = useMetadataServerSettings();

    const handleAction = (action: ChapterAction, chaptersWithMeta: IChapterWithMeta[]) => {
        const chapters = ChaptersWithMeta.getChapters(chaptersWithMeta);
        Chapters.performAction(action, Chapters.getIds(chapters), {
            autoDeleteChapters: deleteChaptersManuallyMarkedRead,
            chapters,
        }).catch(() => {});
        handleClose();
    };

    return (
        <>
            <SelectionFABActionItem
                action="download"
                Icon={Download}
                matchingItems={ChaptersWithMeta.getDownloadable(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.download.add.button.selected')}
            />
            <SelectionFABActionItem
                action="delete"
                Icon={Delete}
                matchingItems={ChaptersWithMeta.getDownloaded(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.download.delete.button.selected')}
            />
            <SelectionFABActionItem
                action="bookmark"
                Icon={BookmarkAdd}
                matchingItems={ChaptersWithMeta.getNonBookmarked(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.bookmark.add.button.selected')}
            />
            <SelectionFABActionItem
                action="unbookmark"
                Icon={BookmarkRemove}
                matchingItems={ChaptersWithMeta.getBookmarked(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.bookmark.remove.button.selected')}
            />
            <SelectionFABActionItem
                action="mark_as_read"
                Icon={Done}
                matchingItems={ChaptersWithMeta.getNonRead(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.mark_as_read.add.button.selected')}
            />
            <SelectionFABActionItem
                action="mark_as_unread"
                Icon={RemoveDone}
                matchingItems={ChaptersWithMeta.getRead(selectedChapters)}
                onClick={handleAction}
                title={t('chapter.action.mark_as_read.remove.button.selected')}
            />
        </>
    );
};
