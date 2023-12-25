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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Label from '@mui/icons-material/Label';
import { useState } from 'react';
import { TManga } from '@/typings.ts';
import { MangaAction, MangaDownloadInfo, Mangas, MangaUnreadInfo } from '@/lib/data/Mangas.ts';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { CategorySelect } from '@/components/navbar/action/CategorySelect.tsx';

export const MangaActionMenu = ({
    manga,
    handleSelection,
    ...bindMenuProps
}: {
    manga: Pick<TManga, 'id'> & MangaDownloadInfo & MangaUnreadInfo;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
} & ReturnType<typeof bindMenu>) => {
    const { t } = useTranslation();

    const { settings } = useMetadataServerSettings();
    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);

    const isFullyDownloaded = manga.downloadCount === manga.chapters.totalCount;
    const hasDownloadedChapters = !!manga.downloadCount;
    const hasUnreadChapters = !!manga.unreadCount;
    const hasReadChapters = manga.unreadCount !== manga.chapters.totalCount;

    const handleSelect = () => {
        handleSelection?.(manga.id, true);
        bindMenuProps.onClose();
    };

    const performAction = (action: MangaAction) => {
        Mangas.performAction(action, [manga.id], {
            autoDeleteChapters: settings.deleteChaptersManuallyMarkedRead,
        }).catch(() => {});

        bindMenuProps.onClose();
    };

    return (
        <>
            <Menu {...bindMenuProps} open={bindMenuProps.open && !isCategorySelectOpen}>
                {!!handleSelection && (
                    <MenuItem onClick={handleSelect}>
                        <ListItemIcon>
                            <CheckBoxOutlineBlank fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('chapter.action.label.select')}</ListItemText>
                    </MenuItem>
                )}
                {!isFullyDownloaded && (
                    <MenuItem onClick={() => performAction('download')}>
                        <ListItemIcon>
                            <Download fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('chapter.action.download.add.label.action')}</ListItemText>
                    </MenuItem>
                )}
                {hasDownloadedChapters && (
                    <MenuItem onClick={() => performAction('delete')}>
                        <ListItemIcon>
                            <Delete fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('chapter.action.download.delete.label.action')}</ListItemText>
                    </MenuItem>
                )}
                {hasUnreadChapters && (
                    <MenuItem onClick={() => performAction('mark_as_read')}>
                        <ListItemIcon>
                            <Done fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('chapter.action.mark_as_read.add.label.action.current')}</ListItemText>
                    </MenuItem>
                )}
                {hasReadChapters && (
                    <MenuItem onClick={() => performAction('mark_as_unread')}>
                        <ListItemIcon>
                            <RemoveDone fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('chapter.action.mark_as_read.remove.label.action')}</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={() => setIsCategorySelectOpen(true)}>
                    <ListItemIcon>
                        <Label fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('manga.action.category.label.action')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => performAction('remove_from_library')}>
                    <ListItemIcon>
                        <FavoriteBorderIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('manga.action.library.remove.label.action')}</ListItemText>
                </MenuItem>
            </Menu>
            {isCategorySelectOpen && (
                <CategorySelect
                    open={isCategorySelectOpen}
                    setOpen={(open) => {
                        setIsCategorySelectOpen(open);
                        bindMenuProps.onClose();
                    }}
                    mangaId={manga.id}
                />
            )}
        </>
    );
};
