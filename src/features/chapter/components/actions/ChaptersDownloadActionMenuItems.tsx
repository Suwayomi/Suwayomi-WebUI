/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import MenuItem from '@mui/material/MenuItem';
import { msg } from '@lingui/core/macro';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { i18n } from '@/i18n';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

const DOWNLOAD_OPTIONS: {
    title: MessageDescriptor;
    getCount: (downloadAheadLimit: number) => number | undefined;
    onlyUnread?: boolean;
    isDownloadAhead?: boolean;
}[] = [
    {
        title: msg`{count, plural, one {Next chapter} other {Next # chapters}}`,
        getCount: () => 1,
    },
    {
        title: msg`{count, plural, one {Next chapter} other {Next # chapters}}`,
        getCount: () => 5,
    },
    {
        title: msg`{count, plural, one {Next chapter} other {Next # chapters}}`,
        getCount: () => 10,
    },
    {
        title: msg`{count, plural, one {Next chapter} other {Next # chapters}}`,
        getCount: () => 25,
    },
    {
        title: msg`Download ahead ({count})`,
        getCount: (downloadAheadLimit) => downloadAheadLimit,
        onlyUnread: true,
        isDownloadAhead: true,
    },
    {
        title: msg`Unread`,
        getCount: () => undefined,
        onlyUnread: true,
    },
    {
        title: msg`All`,
        getCount: () => undefined,
        onlyUnread: false,
    },
];

export const ChaptersDownloadActionMenuItems = ({
    mangaIds,
    closeMenu,
}: {
    mangaIds: MangaType['id'][];
    closeMenu: () => void;
}) => {
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
            {DOWNLOAD_OPTIONS.map(({ title, getCount, onlyUnread, isDownloadAhead }) => (
                <MenuItem
                    key={
                        /* lingui-extract-ignore */
                        i18n.t({ ...title, values: { count: getCount(downloadAheadLimit) } })
                    }
                    onClick={() => handleSelect(getCount(downloadAheadLimit), onlyUnread, isDownloadAhead)}
                >
                    {
                        /* lingui-extract-ignore */
                        i18n.t({ ...title, values: { count: getCount(downloadAheadLimit) } })
                    }
                </MenuItem>
            ))}
        </>
    );
};
