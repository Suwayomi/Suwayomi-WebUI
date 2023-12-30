/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import RemoveDone from '@mui/icons-material/RemoveDone';
import Done from '@mui/icons-material/Done';
import { useTranslation } from 'react-i18next';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import DoneAll from '@mui/icons-material/DoneAll';
import { t as translate } from 'i18next';
import { useMemo } from 'react';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import {
    actionToTranslationKey,
    ChapterAction,
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterReadInfo,
    Chapters,
} from '@/lib/data/Chapters.ts';
import { TChapter } from '@/typings.ts';
import { MenuItem } from '@/components/manga/MenuItem.tsx';
import { IChapterWithMeta } from '@/components/manga/ChapterList.tsx';
import { ChaptersWithMeta } from '@/lib/data/ChaptersWithMeta.ts';

const createGetMenuItemTitle =
    (isSingleMode: boolean) =>
    (action: ChapterAction, count: number): string => {
        const countSuffix = count > 0 ? ` (${count})` : '';
        return `${translate(
            actionToTranslationKey[action].action[isSingleMode ? 'single' : 'selected'],
        )}${countSuffix}`;
    };

const createShouldShowMenuItem =
    (isSingleMode: boolean) =>
    (shouldBeVisible: boolean = false): boolean =>
        isSingleMode ? shouldBeVisible : true;

const createIsMenuItemDisabled =
    (isSingleMode: boolean) =>
    (shouldBeDisabled: boolean): boolean =>
        isSingleMode ? false : shouldBeDisabled;

type BaseProps = { onClose: () => void };

type SingleModeProps = {
    chapter: ChapterDownloadInfo & ChapterBookmarkInfo & ChapterReadInfo;
    allChapters: TChapter[];
    handleSelection?: SelectableCollectionReturnType<TChapter['id']>['handleSelection'];
    canBeDownloaded: boolean;
};

type SelectModeProps = {
    selectedChapters: IChapterWithMeta[];
};

type Props =
    | (BaseProps & SingleModeProps & PropertiesNever<SelectModeProps>)
    | (BaseProps & PropertiesNever<SingleModeProps> & SelectModeProps);

export const ChapterActionMenuItems = ({
    chapter,
    allChapters,
    handleSelection,
    canBeDownloaded = false,
    selectedChapters = [],
    onClose,
}: Props) => {
    const { t } = useTranslation();

    const {
        settings: { deleteChaptersManuallyMarkedRead },
    } = useMetadataServerSettings();

    const isSingleMode = !!chapter;
    const { isDownloaded, isRead, isBookmarked } = chapter ?? {};

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode);
    const shouldShowMenuItem = createShouldShowMenuItem(isSingleMode);
    const isMenuItemDisabled = createIsMenuItemDisabled(isSingleMode);

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

    const handleSelect = () => {
        handleSelection?.(chapter.id, true);
        onClose();
    };

    const performAction = (action: ChapterAction | 'mark_prev_as_read', chaptersWithMeta: IChapterWithMeta[]) => {
        const isMarkPrevAsRead = action === 'mark_prev_as_read';
        const actualAction: ChapterAction = isMarkPrevAsRead ? 'mark_as_read' : action;

        const getChapters = (): (ChapterDownloadInfo & ChapterBookmarkInfo & ChapterReadInfo)[] => {
            // select mode
            if (!chapter) {
                return ChaptersWithMeta.getChapters(chaptersWithMeta);
            }

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

        Chapters.performAction(actualAction, chapter ? [chapter.id] : ChaptersWithMeta.getIds(chaptersWithMeta), {
            chapters: getChapters(),
            autoDeleteChapters: deleteChaptersManuallyMarkedRead,
        });
        onClose();
    };

    return (
        <>
            {isSingleMode && (
                <MenuItem onClick={handleSelect} Icon={CheckBoxOutlineBlank} title={t('chapter.action.label.select')} />
            )}
            {shouldShowMenuItem(canBeDownloaded) && (
                <MenuItem
                    Icon={Download}
                    isDisabled={isMenuItemDisabled(!downloadableChapters.length)}
                    onClick={() => performAction('download', downloadableChapters)}
                    title={getMenuItemTitle('download', downloadableChapters.length)}
                />
            )}
            {shouldShowMenuItem(isDownloaded) && (
                <MenuItem
                    Icon={Delete}
                    isDisabled={isMenuItemDisabled(!downloadedChapters.length)}
                    onClick={() => performAction('delete', downloadedChapters)}
                    title={getMenuItemTitle('delete', downloadedChapters.length)}
                />
            )}
            {shouldShowMenuItem(!isBookmarked) && (
                <MenuItem
                    Icon={BookmarkAdd}
                    isDisabled={isMenuItemDisabled(!unbookmarkedChapters.length)}
                    onClick={() => performAction('bookmark', unbookmarkedChapters)}
                    title={getMenuItemTitle('bookmark', unbookmarkedChapters.length)}
                />
            )}
            {shouldShowMenuItem(isBookmarked) && (
                <MenuItem
                    Icon={BookmarkRemove}
                    isDisabled={isMenuItemDisabled(!bookmarkedChapters.length)}
                    onClick={() => performAction('unbookmark', bookmarkedChapters)}
                    title={getMenuItemTitle('unbookmark', bookmarkedChapters.length)}
                />
            )}
            {shouldShowMenuItem(!isRead) && (
                <MenuItem
                    Icon={Done}
                    isDisabled={isMenuItemDisabled(!unreadChapters.length)}
                    onClick={() => performAction('mark_as_read', unreadChapters)}
                    title={getMenuItemTitle('mark_as_read', unreadChapters.length)}
                />
            )}
            {shouldShowMenuItem(isRead) && (
                <MenuItem
                    Icon={RemoveDone}
                    isDisabled={isMenuItemDisabled(!readChapters.length)}
                    onClick={() => performAction('mark_as_unread', readChapters)}
                    title={getMenuItemTitle('mark_as_unread', readChapters.length)}
                />
            )}
            {isSingleMode && (
                <MenuItem
                    onClick={() => performAction('mark_prev_as_read', [])}
                    Icon={DoneAll}
                    title={t('chapter.action.mark_as_read.add.label.action.previous')}
                />
            )}
        </>
    );
};
