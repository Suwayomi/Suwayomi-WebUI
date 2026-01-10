/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import MenuItem from '@mui/material/MenuItem';
import gql from 'graphql-tag';
import { msg } from '@lingui/core/macro';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import {
    ChapterOrderBy,
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
    MangaType,
    SortOrder,
} from '@/lib/graphql/generated/graphql.ts';
import { MANGA_META_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';
import { getMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/chapter/ChapterQuery.ts';
import { filterChapters } from '@/features/chapter/utils/ChapterList.util.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { CHAPTER_ACTION_TO_TRANSLATION } from '@/features/chapter/Chapter.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { i18n } from '@/i18n';

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

const handleDownload = async (
    mangaIds: MangaType['id'][],
    onlyUnread: boolean,
    size: number | undefined,
    downloadAhead: boolean,
): Promise<void> => {
    const isMultiMangaManga = mangaIds.length > 1;
    if (isMultiMangaManga) {
        Mangas.performAction('download', mangaIds, {
            downloadAhead,
            onlyUnread,
            size,
        }).catch(defaultPromiseErrorHandler('ChaptersDownloadActionMenuItems::handleSelect:multiMangaMode'));
        return;
    }

    const mangaId = mangaIds[0];
    const manga = Mangas.getFromCache(
        mangaId,
        gql`
            ${MANGA_META_FIELDS}
            fragment MangaInLibraryState on MangaType {
                id
                meta {
                    ...MANGA_META_FIELDS
                }
            }
        `,
        'MangaInLibraryState',
    )!;
    const meta = getMangaMetadata(manga);
    const chapters = await requestManager.getChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
        GET_CHAPTERS_MANGA,
        {
            // Align conditions/filters with the query from ChapterList to potentially be able to reuse the cache
            condition: { mangaId: Number(mangaId) },
            order: [{ by: ChapterOrderBy.SourceOrder, byType: SortOrder.Desc }],
        },
    ).response;
    const filteredChapters = filterChapters(chapters.data.chapters.nodes, meta);

    const doNecessaryDownloadAheadDownloadsExist =
        downloadAhead &&
        Chapters.removeDuplicates(filteredChapters.slice(-1)[0], filteredChapters)
            .slice(-(size ?? 0))
            .every((chapter) => !Chapters.isRead(chapter) && Chapters.isDownloaded(chapter));
    if (doNecessaryDownloadAheadDownloadsExist) {
        return;
    }

    const unreadUndownloadedChapters = filteredChapters.filter((chapter) => {
        if (onlyUnread && chapter.isRead) {
            return false;
        }

        return !chapter.isDownloaded;
    });

    const uniqueChapters = Chapters.removeDuplicates(
        unreadUndownloadedChapters.slice(-1)[0],
        unreadUndownloadedChapters,
    );
    const chaptersToDownload = uniqueChapters.slice(-(size ?? 0));
    const chaptersToDownloadWithDuplicates = Chapters.addDuplicates(chaptersToDownload, unreadUndownloadedChapters);

    if (!chaptersToDownloadWithDuplicates.length) {
        return;
    }

    Chapters.performAction('download', Chapters.getIds(chaptersToDownloadWithDuplicates), {}).catch(
        defaultPromiseErrorHandler('ChaptersDownloadActionMenuItems::handleSelect::singleMangaMode'),
    );
};

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
        handleDownload(mangaIds, onlyUnread, size, downloadAhead).catch((e) =>
            makeToast(
                /* lingui-extract-ignore */
                i18n.t({
                    ...CHAPTER_ACTION_TO_TRANSLATION.download.error,
                    values: { count: size },
                }),
                'error',
                getErrorMessage(e),
            ),
        );

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
