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
import { useMemo } from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import { SelectableCollectionReturnType } from '@/modules/collection/hooks/useSelectableCollection.ts';
import {
    actionToTranslationKey,
    ChapterAction,
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterMangaInfo,
    ChapterReadInfo,
    ChapterRealUrlInfo,
    Chapters,
} from '@/modules/chapter/services/Chapters.ts';
import { MenuItem } from '@/modules/core/components/menu/MenuItem.tsx';
import { IChapterWithMeta } from '@/modules/chapter/components/ChapterList.tsx';
import { ChaptersWithMeta } from '@/modules/chapter/services/ChaptersWithMeta.ts';
import {
    createGetMenuItemTitle,
    createIsMenuItemDisabled,
    createShouldShowMenuItem,
} from '@/modules/core/components/menu/Menu.utils.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';

type BaseProps = { onClose: () => void; selectable?: boolean };

type TChapter = ChapterIdInfo &
    ChapterMangaInfo &
    ChapterDownloadInfo &
    ChapterBookmarkInfo &
    ChapterReadInfo &
    ChapterRealUrlInfo;

type SingleModeProps = {
    chapter: TChapter;
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
    selectable = true,
}: Props) => {
    const { t } = useTranslation();

    const isSingleMode = !!chapter;
    const { isDownloaded, isRead, isBookmarked } = chapter ?? {};

    const {
        settings: { deleteChaptersWithBookmark },
    } = useMetadataServerSettings();

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode, actionToTranslationKey);
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

        if (actualAction === 'delete' && chapter) {
            const isDeletable = Chapters.isDeletable(chapter, deleteChaptersWithBookmark);
            if (!isDeletable) {
                onClose();
                return;
            }
        }

        const getChapters = (): SingleModeProps['chapter'][] => {
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

        const chapters = getChapters();

        if (!chapters.length) {
            onClose();
            return;
        }

        Chapters.performAction(actualAction, Chapters.getIds(chapters), {
            chapters,
            wasManuallyMarkedAsRead: true,
            trackProgressMangaId: chapters[0]?.mangaId,
        }).catch(defaultPromiseErrorHandler('ChapterActionMenuItems::performAction'));
        onClose();
    };

    return (
        <>
            {isSingleMode && selectable && (
                <MenuItem onClick={handleSelect} Icon={CheckBoxOutlineBlank} title={t('chapter.action.label.select')} />
            )}
            {isSingleMode && (
                <MenuItem
                    Icon={LaunchIcon}
                    disabled={!chapter!.realUrl}
                    onClick={() => {
                        window.open(chapter!.realUrl!, '_blank', 'noopener,noreferrer');
                        onClose();
                    }}
                    title={t('chapter.action.label.open_on_source')}
                />
            )}
            {shouldShowMenuItem(canBeDownloaded) && (
                <MenuItem
                    Icon={Download}
                    disabled={isMenuItemDisabled(!downloadableChapters.length)}
                    onClick={() => performAction('download', downloadableChapters)}
                    title={getMenuItemTitle('download', downloadableChapters.length)}
                />
            )}
            {shouldShowMenuItem(isDownloaded) && (
                <MenuItem
                    Icon={Delete}
                    disabled={isMenuItemDisabled(!downloadedChapters.length)}
                    onClick={() =>
                        performAction(
                            'delete',
                            ChaptersWithMeta.getDeletable(downloadedChapters, deleteChaptersWithBookmark),
                        )
                    }
                    title={getMenuItemTitle('delete', downloadedChapters.length)}
                />
            )}
            {shouldShowMenuItem(!isBookmarked) && (
                <MenuItem
                    Icon={BookmarkAdd}
                    disabled={isMenuItemDisabled(!unbookmarkedChapters.length)}
                    onClick={() => performAction('bookmark', unbookmarkedChapters)}
                    title={getMenuItemTitle('bookmark', unbookmarkedChapters.length)}
                />
            )}
            {shouldShowMenuItem(isBookmarked) && (
                <MenuItem
                    Icon={BookmarkRemove}
                    disabled={isMenuItemDisabled(!bookmarkedChapters.length)}
                    onClick={() => performAction('unbookmark', bookmarkedChapters)}
                    title={getMenuItemTitle('unbookmark', bookmarkedChapters.length)}
                />
            )}
            {shouldShowMenuItem(!isRead) && (
                <MenuItem
                    Icon={Done}
                    disabled={isMenuItemDisabled(!unreadChapters.length)}
                    onClick={() => performAction('mark_as_read', unreadChapters)}
                    title={getMenuItemTitle('mark_as_read', unreadChapters.length)}
                />
            )}
            {shouldShowMenuItem(isRead) && (
                <MenuItem
                    Icon={RemoveDone}
                    disabled={isMenuItemDisabled(!readChapters.length)}
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
