/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Download from '@mui/icons-material/Download';
import Delete from '@mui/icons-material/Delete';
import Done from '@mui/icons-material/Done';
import RemoveDone from '@mui/icons-material/RemoveDone';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Label from '@mui/icons-material/Label';
import { useMemo, useState } from 'react';
import { t as translate } from 'i18next';
import { MenuItem } from '@/components/manga/MenuItem.tsx';
import { TManga } from '@/typings.ts';
import { actionToTranslationKey, MangaAction, Mangas } from '@/lib/data/Mangas.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { CategorySelect } from '@/components/navbar/action/CategorySelect.tsx';

const ACTION_DISABLES_SELECTION_MODE: MangaAction[] = ['remove_from_library'] as const;

const getMenuItemTitle = (action: MangaAction, count: number): string => {
    const countSuffix = count > 0 ? ` (${count})` : '';
    return `${translate(actionToTranslationKey[action].action.selected)}${countSuffix}`;
};

export const MangasSelectionFABActionItems = ({
    selectedMangas,
    handleClose,
}: {
    selectedMangas: TManga[];
    handleClose: (selectionModeState: boolean) => void;
}) => {
    const { settings } = useMetadataServerSettings();
    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);

    const handleAction = (action: MangaAction, mangas: TManga[]) => {
        Mangas.performAction(action, Mangas.getIds(mangas), {
            autoDeleteChapters: settings.deleteChaptersManuallyMarkedRead,
        }).catch(() => {});
        handleClose(!ACTION_DISABLES_SELECTION_MODE.includes(action));
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
            <MenuItem
                Icon={Download}
                isDisabled={!downloadableMangas.length}
                onClick={() => handleAction('download', downloadableMangas)}
                title={getMenuItemTitle('download', downloadableMangas.length)}
            />
            <MenuItem
                Icon={Delete}
                isDisabled={!downloadedMangas.length}
                onClick={() => handleAction('delete', downloadedMangas)}
                title={getMenuItemTitle('delete', downloadedMangas.length)}
            />
            <MenuItem
                Icon={Done}
                isDisabled={!unreadMangas.length}
                onClick={() => handleAction('mark_as_read', unreadMangas)}
                title={getMenuItemTitle('mark_as_read', unreadMangas.length)}
            />
            <MenuItem
                Icon={RemoveDone}
                isDisabled={!readMangas.length}
                onClick={() => handleAction('mark_as_unread', readMangas)}
                title={getMenuItemTitle('mark_as_unread', readMangas.length)}
            />
            <MenuItem
                Icon={Label}
                onClick={() => handleAction('change_categories', selectedMangas)}
                title={getMenuItemTitle('change_categories', selectedMangas.length)}
            />
            <MenuItem
                Icon={FavoriteBorderIcon}
                onClick={() => handleAction('remove_from_library', selectedMangas)}
                title={getMenuItemTitle('remove_from_library', selectedMangas.length)}
            />
            {isCategorySelectOpen && (
                <CategorySelect
                    open={isCategorySelectOpen}
                    onClose={() => {
                        setIsCategorySelectOpen(false);
                        handleClose(true);
                    }}
                    mangaIds={Mangas.getIds(selectedMangas)}
                />
            )}
        </>
    );
};
