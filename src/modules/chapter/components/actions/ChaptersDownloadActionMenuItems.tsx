/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { TranslationKey } from '@/Base.types.ts';

const DOWNLOAD_OPTIONS: {
    title: TranslationKey;
    getCount: (downloadAheadLimit: number) => number | undefined;
    onlyUnread?: boolean;
}[] = [
    { title: 'chapter.action.download.add.label.next', getCount: () => 1 },
    { title: 'chapter.action.download.add.label.next', getCount: () => 5 },
    { title: 'chapter.action.download.add.label.next', getCount: () => 10 },
    { title: 'chapter.action.download.add.label.next', getCount: () => 25 },
    {
        title: 'chapter.action.download.add.label.ahead',
        getCount: (downloadAheadLimit) => downloadAheadLimit,
        onlyUnread: true,
    },
    { title: 'chapter.action.download.add.label.unread', getCount: () => undefined, onlyUnread: true },
    { title: 'chapter.action.download.add.label.all', getCount: () => undefined, onlyUnread: false },
];

export const ChaptersDownloadActionMenuItems = ({
    mangaIds,
    closeMenu,
}: {
    mangaIds: MangaType['id'][];
    closeMenu: () => void;
}) => {
    const { t } = useTranslation();

    const {
        settings: { downloadAheadLimit },
    } = useMetadataServerSettings();

    const handleSelect = (size?: number, onlyUnread: boolean = true, downloadAhead: boolean = false) => {
        Mangas.performAction('download', mangaIds, {
            downloadAhead,
            onlyUnread,
            size,
        }).catch(defaultPromiseErrorHandler('ChaptersDownloadActionMenuItems::handleSelect'));
        closeMenu?.();
    };

    return (
        <>
            {DOWNLOAD_OPTIONS.map(({ title, getCount, onlyUnread }) => (
                <MenuItem
                    key={t(title, { count: getCount(downloadAheadLimit) })}
                    onClick={() => handleSelect(getCount(downloadAheadLimit), onlyUnread)}
                >
                    {t(title, { count: getCount(downloadAheadLimit) })}
                </MenuItem>
            ))}
        </>
    );
};
