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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Label from '@mui/icons-material/Label';
import { useMemo, useState } from 'react';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Link } from 'react-router-dom';
import SyncIcon from '@mui/icons-material/Sync';
import { Dialog } from '@mui/material';
import { TManga } from '@/typings.ts';
import { actionToTranslationKey, MangaAction, MangaDownloadInfo, Mangas, MangaUnreadInfo } from '@/lib/data/Mangas.ts';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { MenuItem } from '@/components/menu/MenuItem.tsx';
import { createGetMenuItemTitle, createIsMenuItemDisabled, createShouldShowMenuItem } from '@/components/menu/util.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { TrackManga } from '@/components/tracker/TrackManga.tsx';
import { useCategorySelect } from '@/components/navbar/action/useCategorySelect.tsx';

const ACTION_DISABLES_SELECTION_MODE: MangaAction[] = ['remove_from_library'] as const;

type BaseProps = { onClose: (selectionModeState: boolean) => void; setHideMenu: (hide: boolean) => void };

export type SingleModeProps = {
    manga: Pick<TManga, 'id' | 'title' | 'source' | 'trackRecords'> & MangaDownloadInfo & MangaUnreadInfo;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
};

type SelectModeProps = {
    selectedMangas: TManga[];
};

type Props =
    | (BaseProps & SingleModeProps & PropertiesNever<SelectModeProps>)
    | (BaseProps & PropertiesNever<SingleModeProps> & SelectModeProps);

export const MangaActionMenuItems = ({
    manga,
    handleSelection,
    selectedMangas: passedSelectedMangas,
    onClose,
    setHideMenu,
}: Props) => {
    const { t } = useTranslation();

    const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);

    const isSingleMode = !!manga;
    const selectedMangas = passedSelectedMangas ?? [];

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode, actionToTranslationKey);
    const shouldShowMenuItem = createShouldShowMenuItem(isSingleMode);
    const isMenuItemDisabled = createIsMenuItemDisabled(isSingleMode);

    const isFullyDownloaded = !!manga && manga.downloadCount === manga.chapters.totalCount;
    const hasDownloadedChapters = !!manga?.downloadCount;
    const hasUnreadChapters = !!manga?.unreadCount;
    const hasReadChapters = !!manga && manga.unreadCount !== manga.chapters.totalCount;

    const { openCategorySelect, CategorySelectComponent } = useCategorySelect({
        mangaId: manga?.id,
        mangaIds: passedSelectedMangas ? Mangas.getIds(selectedMangas) : undefined,
        onClose: () => onClose(true),
        addToLibrary: false,
    });

    const handleSelect = () => {
        handleSelection?.(manga.id, true);
        onClose(true);
    };

    const performAction = (action: MangaAction, mangas: TManga[]) => {
        Mangas.performAction(action, manga ? [manga.id] : Mangas.getIds(mangas), {
            wasManuallyMarkedAsRead: true,
        }).catch(defaultPromiseErrorHandler(`MangaActionMenuItems:performAction(${action})`));

        onClose(!ACTION_DISABLES_SELECTION_MODE.includes(action));
    };

    const { downloadableMangas, downloadedMangas, unreadMangas, readMangas } = useMemo(
        () => ({
            downloadableMangas: [
                ...Mangas.getNotDownloaded(selectedMangas),
                ...Mangas.getPartiallyDownloaded(selectedMangas),
            ],
            downloadedMangas: [
                ...Mangas.getPartiallyDownloaded(selectedMangas),
                ...Mangas.getFullyDownloaded(selectedMangas),
            ],
            unreadMangas: [...Mangas.getUnread(selectedMangas), ...Mangas.getPartiallyRead(selectedMangas)],
            readMangas: [...Mangas.getPartiallyRead(selectedMangas), ...Mangas.getFullyRead(selectedMangas)],
        }),
        [selectedMangas],
    );

    return (
        <>
            {!!handleSelection && isSingleMode && (
                <MenuItem onClick={handleSelect} Icon={CheckBoxOutlineBlank} title={t('chapter.action.label.select')} />
            )}
            {shouldShowMenuItem(!isFullyDownloaded) && (
                <MenuItem
                    Icon={Download}
                    disabled={isMenuItemDisabled(!downloadableMangas.length)}
                    onClick={() => performAction('download', downloadableMangas)}
                    title={getMenuItemTitle('download', downloadableMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasDownloadedChapters) && (
                <MenuItem
                    Icon={Delete}
                    disabled={isMenuItemDisabled(!downloadedMangas.length)}
                    onClick={() => performAction('delete', downloadedMangas)}
                    title={getMenuItemTitle('delete', downloadedMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasUnreadChapters) && (
                <MenuItem
                    Icon={Done}
                    disabled={isMenuItemDisabled(!unreadMangas.length)}
                    onClick={() => performAction('mark_as_read', unreadMangas)}
                    title={getMenuItemTitle('mark_as_read', unreadMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasReadChapters) && (
                <MenuItem
                    Icon={RemoveDone}
                    disabled={isMenuItemDisabled(!readMangas.length)}
                    onClick={() => performAction('mark_as_unread', readMangas)}
                    title={getMenuItemTitle('mark_as_unread', readMangas.length)}
                />
            )}
            {isSingleMode && (
                <Link
                    to={`/migrate/source/${manga?.source?.id}/manga/${manga?.id}/search?query=${manga?.title}`}
                    state={{ mangaTitle: manga?.title }}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <MenuItem Icon={SyncAltIcon} title={getMenuItemTitle('migrate', selectedMangas.length)} />
                </Link>
            )}
            {isSingleMode && (
                <MenuItem
                    onClick={() => {
                        setIsTrackDialogOpen(true);
                        setHideMenu(true);
                    }}
                    Icon={SyncIcon}
                    title={getMenuItemTitle('track', selectedMangas.length)}
                />
            )}
            <MenuItem
                onClick={() => {
                    openCategorySelect(true);
                    setHideMenu(true);
                }}
                Icon={Label}
                title={getMenuItemTitle('change_categories', selectedMangas.length)}
            />
            <MenuItem
                onClick={() => performAction('remove_from_library', selectedMangas)}
                Icon={FavoriteBorderIcon}
                title={getMenuItemTitle('remove_from_library', selectedMangas.length)}
            />
            {CategorySelectComponent}
            {isTrackDialogOpen && (
                <Dialog
                    open
                    maxWidth="md"
                    fullWidth
                    scroll="paper"
                    onClose={() => {
                        setIsTrackDialogOpen(false);
                        onClose(true);
                    }}
                >
                    <TrackManga manga={manga!} />
                </Dialog>
            )}
        </>
    );
};
