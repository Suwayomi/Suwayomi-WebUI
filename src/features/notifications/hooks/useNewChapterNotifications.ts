/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { GET_CHAPTERS_UPDATES } from '@/lib/graphql/chapter/ChapterQuery.ts';
import type { GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { ChapterOrderBy, SortOrder } from '@/lib/graphql/generated/graphql-base.types.ts';
import { Notifications } from '@/features/notifications/services/Notifications.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';

const LAST_NOTIFIED_AT_STORAGE_KEY = 'newChapterNotificationsLastFetchedAt';

/**
 * Enough to cover a normal update while preventing a huge query. The number of chapters that gets shown is taken from
 * the total count of the query, thus, a cut off list does not falsify it.
 */
const MAX_CHAPTERS = 100;

/** Beyond that a notification per entry turns into a wall of notifications, thus, they get summarized into one */
const MAX_NOTIFICATIONS = 3;

type NewChapter = GetChaptersUpdatesQuery['chapters']['nodes'][number];
type NewChapters = { chapters: NewChapter[]; totalCount: number };

const getNewChapters = async (lastNotifiedAt: number): Promise<NewChapters> => {
    const { data } = await requestManager.getChapters<GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables>(
        GET_CHAPTERS_UPDATES,
        {
            filter: {
                inLibrary: { equalTo: true },
                fetchedAt: { greaterThan: `${lastNotifiedAt}` },
                isRead: { equalTo: false },
            },
            order: [{ by: ChapterOrderBy.FetchedAt, byType: SortOrder.Desc }],
            first: MAX_CHAPTERS,
        },
        { fetchPolicy: 'no-cache' },
    ).response;

    return { chapters: data?.chapters.nodes ?? [], totalCount: data?.chapters.totalCount ?? 0 };
};

const openManga = (mangaId: MangaIdInfo['id']) => () => ReactRouter.navigate(AppRoutes.manga.path(mangaId));

const openUpdates = () => ReactRouter.navigate(AppRoutes.updates.path);

const onNotificationError = defaultPromiseErrorHandler('useNewChapterNotifications::show');

const showNotifications = ({ chapters, totalCount }: NewChapters): void => {
    const chaptersByMangaId = Object.groupBy(chapters, (chapter) => chapter.manga.id);

    // every chapter of the entry being new means that its chapter list was fetched for the first time, e.g. because it
    // just got added to the library, which is not something the user has to be told about
    const mangaIds = Object.keys(chaptersByMangaId).filter(
        (mangaId) =>
            chaptersByMangaId[Number(mangaId)]!.length !==
            chaptersByMangaId[Number(mangaId)]![0].manga.chapters.totalCount,
    );

    if (!mangaIds.length) {
        return;
    }

    // the entry count is only known for the chapters that were actually queried, thus, it can't be shown for a
    // truncated result without contradicting the chapter count
    const isTruncated = totalCount > chapters.length;
    if (mangaIds.length > MAX_NOTIFICATIONS || isTruncated) {
        const count = totalCount;
        const entryCount = mangaIds.length;

        Notifications.show(plural(count, { one: '# new chapter', other: '# new chapters' }), {
            body: isTruncated ? undefined : plural(entryCount, { one: 'in # entry', other: 'in # entries' }),
            tag: 'new-chapters',
            onClick: openUpdates,
        }).catch(onNotificationError);

        return;
    }

    mangaIds.forEach((mangaId) => {
        // the result of groupBy can't contain undefined values for the keys it returned
        const mangaChapters = chaptersByMangaId[Number(mangaId)]!;
        const [{ manga }] = mangaChapters;
        const count = mangaChapters.length;

        Notifications.show(manga.title, {
            body: plural(count, { one: '# new chapter', other: '# new chapters' }),
            icon: manga.thumbnailUrl ? Mangas.getThumbnailUrl(manga) : undefined,
            // replaces a previous notification of the same entry instead of stacking them up
            tag: `new-chapters-${manga.id}`,
            onClick: openManga(manga.id),
        }).catch(onNotificationError);
    });
};

/**
 * Shows a notification for the chapters that a library update fetched for entries in the library.
 *
 * Only covers the time the client is running, since notifying for a closed client would require the push API, which
 * the server does not provide.
 */
export const useNewChapterNotifications = (): void => {
    const {
        settings: { notifyNewChapters },
        loading: areSettingsLoading,
    } = useMetadataServerSettings();

    const { data } = requestManager.useGetGlobalUpdateSummary();
    const isUpdateRunning = !!data?.libraryUpdateStatus.jobsInfo.isRunning;

    const [lastNotifiedAt, setLastNotifiedAt] = useLocalStorage<number>(LAST_NOTIFIED_AT_STORAGE_KEY, 0);
    const lastNotifiedAtRef = useRef(lastNotifiedAt);
    lastNotifiedAtRef.current = lastNotifiedAt;

    const wasUpdateRunningRef = useRef(isUpdateRunning);
    // the settings are loaded asynchronously, thus, the enabled state is only known once they are available
    const wasEnabledRef = useRef<boolean | undefined>(undefined);

    // without a starting point everything that ever got fetched would count as new, thus, the moment the setting gets
    // enabled is used as the starting point
    useEffect(() => {
        if (areSettingsLoading) {
            return;
        }

        const wasEnabled = wasEnabledRef.current;
        wasEnabledRef.current = notifyNewChapters;

        const hasJustBeenEnabled = notifyNewChapters && (wasEnabled === false || !lastNotifiedAtRef.current);
        if (hasJustBeenEnabled) {
            setLastNotifiedAt(Math.floor(Date.now() / 1000));
        }
    }, [notifyNewChapters, areSettingsLoading]);

    useEffect(() => {
        const hasUpdateFinished = wasUpdateRunningRef.current && !isUpdateRunning;
        wasUpdateRunningRef.current = isUpdateRunning;

        if (!hasUpdateFinished || !notifyNewChapters) {
            return;
        }

        const notify = async () => {
            const newChapters = await getNewChapters(lastNotifiedAtRef.current);

            if (!newChapters.chapters.length) {
                return;
            }

            // advancing this even without being able to notify prevents a backlog from piling up, which would be
            // reported in one huge notification once the permission gets granted.
            // the chapters are ordered by their fetch date, thus, the first one is the most recent one
            setLastNotifiedAt(Number(newChapters.chapters[0].fetchedAt));

            if (Notifications.isPermissionGranted()) {
                showNotifications(newChapters);
            }
        };

        notify().catch(defaultPromiseErrorHandler('useNewChapterNotifications::notify'));
    }, [isUpdateRunning, notifyNewChapters]);
};
