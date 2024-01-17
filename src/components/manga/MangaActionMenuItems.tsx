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
import { TManga } from '@/typings.ts';
import { actionToTranslationKey, MangaAction, MangaDownloadInfo, Mangas, MangaUnreadInfo } from '@/lib/data/Mangas.ts';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { CategorySelect } from '@/components/navbar/action/CategorySelect.tsx';
import { MenuItem } from '@/components/menu/MenuItem.tsx';
import { createGetMenuItemTitle, createIsMenuItemDisabled, createShouldShowMenuItem } from '@/components/menu/util.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

const ACTION_DISABLES_SELECTION_MODE: MangaAction[] = ['remove_from_library'] as const;

type BaseProps = { onClose: (selectionModeState: boolean) => void; setHideMenu: (hide: boolean) => void };

export type SingleModeProps = {
    manga: Pick<TManga, 'id'> & MangaDownloadInfo & MangaUnreadInfo;
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

    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);

    const isSingleMode = !!manga;
    const selectedMangas = passedSelectedMangas ?? [];

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode, actionToTranslationKey);
    const shouldShowMenuItem = createShouldShowMenuItem(isSingleMode);
    const isMenuItemDisabled = createIsMenuItemDisabled(isSingleMode);

    const isFullyDownloaded = !!manga && manga.downloadCount === manga.chapters.totalCount;
    const hasDownloadedChapters = !!manga?.downloadCount;
    const hasUnreadChapters = !!manga?.unreadCount;
    const hasReadChapters = !!manga && manga.unreadCount !== manga.chapters.totalCount;

    const handleSelect = () => {
        handleSelection?.(manga.id, true);
        onClose(true);
    };

    const performAction = (action: MangaAction, mangas: TManga[]) => {
        console.log('MangaActionMenuItem', manga);
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
                    isDisabled={isMenuItemDisabled(!downloadableMangas.length)}
                    onClick={() => performAction('download', downloadableMangas)}
                    title={getMenuItemTitle('download', downloadableMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasDownloadedChapters) && (
                <MenuItem
                    Icon={Delete}
                    isDisabled={isMenuItemDisabled(!downloadedMangas.length)}
                    onClick={() => performAction('delete', downloadedMangas)}
                    title={getMenuItemTitle('delete', downloadedMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasUnreadChapters) && (
                <MenuItem
                    Icon={Done}
                    isDisabled={isMenuItemDisabled(!unreadMangas.length)}
                    onClick={() => performAction('mark_as_read', unreadMangas)}
                    title={getMenuItemTitle('mark_as_read', unreadMangas.length)}
                />
            )}
            {shouldShowMenuItem(hasReadChapters) && (
                <MenuItem
                    Icon={RemoveDone}
                    isDisabled={isMenuItemDisabled(!readMangas.length)}
                    onClick={() => performAction('mark_as_unread', readMangas)}
                    title={getMenuItemTitle('mark_as_unread', readMangas.length)}
                />
            )}
            <MenuItem
                onClick={() => {
                    setIsCategorySelectOpen(true);
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
            {isCategorySelectOpen && (
                <CategorySelect
                    open={isCategorySelectOpen}
                    onClose={() => {
                        setIsCategorySelectOpen(false);
                        onClose(true);
                    }}
                    mangaId={manga?.id as undefined} // either mangaId or mangaIds is undefined, however, ts is not able to infer it correctly and raises an error
                    mangaIds={(passedSelectedMangas ? Mangas.getIds(selectedMangas) : undefined) as number[]}
                />
            )}
        </>
    );
};
