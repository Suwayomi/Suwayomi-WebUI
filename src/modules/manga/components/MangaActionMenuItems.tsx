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
import Dialog from '@mui/material/Dialog';
import TranslateIcon from '@mui/icons-material/Translate';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { SelectableCollectionReturnType } from '@/modules/collection/hooks/useSelectableCollection.ts';
import { MenuItem } from '@/modules/core/components/menu/MenuItem.tsx';
import {
    createGetMenuItemTitle,
    createIsMenuItemDisabled,
    createShouldShowMenuItem,
} from '@/modules/core/components/menu/Menu.utils.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { TrackManga } from '@/modules/tracker/components/TrackManga.tsx';
import { useCategorySelect } from '@/modules/category/hooks/useCategorySelect.tsx';
import { ChaptersDownloadActionMenuItems } from '@/modules/chapter/components/actions/ChaptersDownloadActionMenuItems.tsx';
import { NestedMenuItem } from '@/modules/core/components/menu/NestedMenuItem.tsx';
import { MangaChapterStatFieldsFragment, MangaType } from '@/lib/graphql/generated/graphql.ts';
import { MangaAction, MangaDownloadInfo, MangaIdInfo, MangaUnreadInfo } from '@/modules/manga/Manga.types.ts';
import { MANGA_ACTION_TO_TRANSLATION } from '@/modules/manga/Manga.constants.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';

const ACTION_DISABLES_SELECTION_MODE: MangaAction[] = ['remove_from_library'] as const;

type BaseProps = { onClose: (selectionModeState: boolean) => void; setHideMenu: (hide: boolean) => void };

export type SingleModeProps = {
    manga: Pick<MangaType, 'id' | 'title' | 'sourceId'> & MangaDownloadInfo & MangaUnreadInfo;
    handleSelection?: SelectableCollectionReturnType<MangaType['id']>['handleSelection'];
};

type SelectModeProps = {
    selectedMangas: MangaChapterStatFieldsFragment[];
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

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode, MANGA_ACTION_TO_TRANSLATION);
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

    const performAction = (action: MangaAction, mangas: MangaIdInfo[]) => {
        Mangas.performAction(action, manga ? [manga.id] : Mangas.getIds(mangas), {
            wasManuallyMarkedAsRead: true,
        }).catch(defaultPromiseErrorHandler(`MangaActionMenuItems:performAction(${action})`));

        onClose(!ACTION_DISABLES_SELECTION_MODE.includes(action));
    };

    const handleTranslate = () => {
        // Implement your translation logic here
        console.log('Translating manga:', manga?.id || selectedMangas.map((m) => m.id));

        // Example: Open a translation service in a new tab
        // You can replace this with your actual translation implementation
        const title = manga?.title || selectedMangas[0]?.title;
        if (title) {
            window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(title)}`, '_blank');
        }

        onClose(true);
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
            <MenuItem onClick={handleTranslate} Icon={TranslateIcon} title={t('manga.action.label.translate')} />
            {shouldShowMenuItem(!isFullyDownloaded) && (
                <NestedMenuItem
                    disabled={isMenuItemDisabled(!downloadableMangas.length)}
                    LeftIcon={Download}
                    label={getMenuItemTitle('download', downloadableMangas.length)}
                    parentMenuOpen
                >
                    <ChaptersDownloadActionMenuItems
                        mangaIds={isSingleMode ? [manga.id] : Mangas.getIds(selectedMangas)}
                        closeMenu={() => onClose(true)}
                    />
                </NestedMenuItem>
            )}
            <MenuItem
                onClick={() => {
                    // Implement your "T transfter" logic here
                    console.log('T transfter clicked', manga?.id || selectedMangas.map((m) => m.id));
                    onClose(true);
                }}
                Icon={Label}
                title="T transfter"
            />
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
                    to={AppRoutes.migrate.childRoutes.search.path(manga?.sourceId ?? -1, manga?.id ?? -1, manga?.title)}
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
