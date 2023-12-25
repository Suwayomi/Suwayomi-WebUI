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
import { useTranslation } from 'react-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { SelectionFABActionItem } from '@/components/manga/SelectionFABActionItem.tsx';
import { TManga } from '@/typings.ts';
import { MangaAction, Mangas } from '@/lib/data/Mangas.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';

export const MangasSelectionFABActionItems = ({
    selectedMangas,
    handleClose,
}: {
    selectedMangas: TManga[];
    handleClose: () => void;
}) => {
    const { t } = useTranslation();
    const { settings } = useMetadataServerSettings();

    const handleAction = (action: MangaAction, mangas: TManga[]) => {
        Mangas.performAction(action, Mangas.getIds(mangas), {
            autoDeleteChapters: settings.deleteChaptersManuallyMarkedRead,
        }).catch(() => {});
        handleClose();
    };

    return (
        <>
            <SelectionFABActionItem<MangaAction, TManga>
                action="download"
                Icon={Download}
                matchingItems={[
                    ...Mangas.getNotDownloaded(selectedMangas),
                    ...Mangas.getPartiallyDownloaded(selectedMangas),
                ]}
                onClick={handleAction}
                title={t('chapter.action.download.add.button.selected')}
            />
            <SelectionFABActionItem<MangaAction, TManga>
                action="delete"
                Icon={Delete}
                matchingItems={[
                    ...Mangas.getPartiallyDownloaded(selectedMangas),
                    ...Mangas.getFullyDownloaded(selectedMangas),
                ]}
                onClick={handleAction}
                title={t('chapter.action.download.delete.button.selected')}
            />
            <SelectionFABActionItem<MangaAction, TManga>
                action="mark_as_read"
                Icon={Done}
                matchingItems={[...Mangas.getUnread(selectedMangas), ...Mangas.getPartiallyRead(selectedMangas)]}
                onClick={handleAction}
                title={t('chapter.action.mark_as_read.add.button.selected')}
            />
            <SelectionFABActionItem<MangaAction, TManga>
                action="mark_as_unread"
                Icon={RemoveDone}
                matchingItems={[...Mangas.getPartiallyRead(selectedMangas), ...Mangas.getFullyRead(selectedMangas)]}
                onClick={handleAction}
                title={t('chapter.action.mark_as_read.remove.button.selected')}
            />
            <SelectionFABActionItem<MangaAction, TManga>
                action="remove_from_library"
                Icon={FavoriteBorderIcon}
                matchingItems={[...Mangas.getPartiallyRead(selectedMangas), ...Mangas.getFullyRead(selectedMangas)]}
                onClick={handleAction}
                title={t('manga.action.library.remove.button.selected')}
            />
        </>
    );
};
