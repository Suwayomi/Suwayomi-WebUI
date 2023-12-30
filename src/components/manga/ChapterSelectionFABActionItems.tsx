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
import { useMemo } from 'react';
import { t as translate } from 'i18next';
import { MenuItem } from '@/components/manga/MenuItem.tsx';
import { IChapterWithMeta } from '@/components/manga/ChapterList.tsx';
import { ChaptersWithMeta } from '@/lib/data/ChaptersWithMeta.ts';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/lib/data/Chapters.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';

const getMenuItemTitle = (action: ChapterAction, count: number): string => {
    const countSuffix = count > 0 ? ` (${count})` : '';
    return `${translate(actionToTranslationKey[action].action.selected)}${countSuffix}`;
};

export const ChapterSelectionFABActionItems = ({
    selectedChapters,
    handleClose,
}: {
    selectedChapters: IChapterWithMeta[];
    handleClose: () => void;
}) => {
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

    const {
        downloadableChapters,
        downloadedChapters,
        unbookmarkedChapters,
        bookmarkedChapters,
        unreadChapters,
        readChapters,
    } = useMemo(
        () => ({
            downloadableChapters: ChaptersWithMeta.getDownloadable(selectedChapters),
            downloadedChapters: ChaptersWithMeta.getDownloaded(selectedChapters),
            unbookmarkedChapters: ChaptersWithMeta.getNonBookmarked(selectedChapters),
            bookmarkedChapters: ChaptersWithMeta.getBookmarked(selectedChapters),
            unreadChapters: ChaptersWithMeta.getNonRead(selectedChapters),
            readChapters: ChaptersWithMeta.getRead(selectedChapters),
        }),
        [selectedChapters],
    );

    return (
        <>
            <MenuItem
                Icon={Download}
                isDisabled={!downloadableChapters.length}
                onClick={() => handleAction('download', downloadableChapters)}
                title={getMenuItemTitle('download', downloadableChapters.length)}
            />
            <MenuItem
                Icon={Delete}
                isDisabled={!downloadedChapters.length}
                onClick={() => handleAction('delete', downloadedChapters)}
                title={getMenuItemTitle('delete', downloadedChapters.length)}
            />
            <MenuItem
                Icon={BookmarkAdd}
                isDisabled={!unbookmarkedChapters.length}
                onClick={() => handleAction('bookmark', unbookmarkedChapters)}
                title={getMenuItemTitle('bookmark', unbookmarkedChapters.length)}
            />
            <MenuItem
                Icon={BookmarkRemove}
                isDisabled={!bookmarkedChapters.length}
                onClick={() => handleAction('unbookmark', bookmarkedChapters)}
                title={getMenuItemTitle('unbookmark', bookmarkedChapters.length)}
            />
            <MenuItem
                Icon={Done}
                isDisabled={!unreadChapters.length}
                onClick={() => handleAction('mark_as_read', unreadChapters)}
                title={getMenuItemTitle('mark_as_read', unreadChapters.length)}
            />
            <MenuItem
                Icon={RemoveDone}
                isDisabled={!readChapters.length}
                onClick={() => handleAction('mark_as_unread', readChapters)}
                title={getMenuItemTitle('mark_as_unread', readChapters.length)}
            />
        </>
    );
};
