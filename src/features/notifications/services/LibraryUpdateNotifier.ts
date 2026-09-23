/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { plural } from '@lingui/core/macro';
import { distinctUntilChanged, map } from 'rxjs';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_CHAPTERS_UPDATES } from '@/lib/graphql/chapter/ChapterQuery.ts';
import { UPDATER_JOB_INFO_FIELDS } from '@/lib/graphql/updater/UpdaterFragments.ts';
import type {
    GetChaptersUpdatesQuery,
    GetChaptersUpdatesQueryVariables,
    UpdaterJobInfoFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import type { ChapterFilterInput } from '@/lib/graphql/generated/graphql-base.types.ts';
import { ChapterOrderBy, SortOrder } from '@/lib/graphql/generated/graphql-base.types.ts';
import {
    getMetadataServerSettings,
    updateMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { Notifications } from '@/features/notifications/services/Notifications.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

const LOCK_NAME = 'library-update-notifier';

const PAGE_SIZE = 50;

/** Keeps a big batch of newly added entries from causing an endless number of requests */
const MAX_PAGES = 10;

/** More than that gets shown as "100+" */
const MAX_CHAPTERS = 100;

/** Beyond that a notification per entry turns into a wall of notifications, thus, they get summarized into one */
const MAX_NOTIFICATIONS = 3;

type Chapter = GetChaptersUpdatesQuery['chapters']['nodes'][number];

type LibraryUpdates = {
    chapters: Chapter[];
    isTruncated: boolean;
};

type UpdatesSearch = {
    chapters: Chapter[];
    newestFetchedAt: number;
    initialFetchMangaIds: MangaIdInfo['id'][];
    checkedMangaIds: MangaIdInfo['id'][];
    page: number;
    after?: string;
};

const notify = (title: string, options: Parameters<typeof Notifications.show>[1]) =>
    Notifications.show(title, options).catch(defaultPromiseErrorHandler('LibraryUpdateNotifier::notify'));

export class LibraryUpdateNotifier {
    private static updateStatusSubscription: { unsubscribe: () => void } | undefined;

    /** Changes with every start and stop, so that superseded work can tell it should not continue */
    private static generation = 0;

    private static check: Promise<void> | undefined;

    private static isRecheckRequested = false;

    static async start(): Promise<void> {
        LibraryUpdateNotifier.stop();
        const { generation } = LibraryUpdateNotifier;

        const { notifyNewChapters, notifyNewChaptersLastNotifiedAt } = await getMetadataServerSettings();
        if (!notifyNewChapters) {
            return;
        }

        if (!notifyNewChaptersLastNotifiedAt) {
            await LibraryUpdateNotifier.setLastNotifiedAt(await LibraryUpdateNotifier.getNewestFetchedAt());
        }

        if (generation === LibraryUpdateNotifier.generation) {
            LibraryUpdateNotifier.subscribeToUpdateStatus();
        }
    }

    static stop(): void {
        LibraryUpdateNotifier.generation += 1;
        LibraryUpdateNotifier.updateStatusSubscription?.unsubscribe();
        LibraryUpdateNotifier.updateStatusSubscription = undefined;
    }

    static async enable(): Promise<void> {
        await updateMetadataServerSettings('notifyNewChapters', true);
        await LibraryUpdateNotifier.setLastNotifiedAt(await LibraryUpdateNotifier.getNewestFetchedAt());
        await LibraryUpdateNotifier.start();
    }

    static async disable(): Promise<void> {
        LibraryUpdateNotifier.stop();
        await updateMetadataServerSettings('notifyNewChapters', false);
        await LibraryUpdateNotifier.setLastNotifiedAt(0);
    }

    private static subscribeToUpdateStatus(): void {
        LibraryUpdateNotifier.updateStatusSubscription?.unsubscribe();
        LibraryUpdateNotifier.updateStatusSubscription = requestManager.graphQLClient.client
            .watchFragment<UpdaterJobInfoFieldsFragment>({
                fragment: UPDATER_JOB_INFO_FIELDS,
                from: { __typename: 'UpdaterJobsInfoType' },
            })
            .pipe(
                map(({ data }) => !!data?.isRunning),
                distinctUntilChanged(),
            )
            .subscribe((isRunning) => {
                // the first value triggers the check for updates that ran while the client was closed. a running update
                // gets checked once it finished, instead of reporting it partially
                if (!isRunning) {
                    LibraryUpdateNotifier.checkForUpdates().catch(
                        defaultPromiseErrorHandler('LibraryUpdateNotifier::checkForUpdates'),
                    );
                }
            });
    }

    /**
     * Only runs once at a time. An update that finishes in the meantime gets checked for once the current check is done.
     */
    private static async checkForUpdates(): Promise<void> {
        if (LibraryUpdateNotifier.check) {
            LibraryUpdateNotifier.isRecheckRequested = true;
            return LibraryUpdateNotifier.check;
        }

        const { generation } = LibraryUpdateNotifier;
        LibraryUpdateNotifier.isRecheckRequested = false;
        LibraryUpdateNotifier.check = LibraryUpdateNotifier.withLock(async () => {
            const updates = await LibraryUpdateNotifier.getUpdates();
            if (updates.chapters.length && generation === LibraryUpdateNotifier.generation) {
                LibraryUpdateNotifier.showNotifications(updates);
            }
        }).finally(() => {
            LibraryUpdateNotifier.check = undefined;
        });
        await LibraryUpdateNotifier.check;

        if (LibraryUpdateNotifier.isRecheckRequested) {
            await LibraryUpdateNotifier.checkForUpdates();
        }
    }

    /**
     * Every open tab runs a notifier. Since the starting point is shared, the first one to get the lock notifies and
     * the others find nothing new afterwards. Locks are only available in a secure context and only cover the tabs of
     * the same browser.
     */
    private static async withLock(fn: () => Promise<void>): Promise<void> {
        if (!navigator.locks) {
            return fn();
        }

        return navigator.locks.request(LOCK_NAME, fn);
    }

    private static async getUpdates(): Promise<LibraryUpdates> {
        // it is shared, thus, it has to be up to date to not notify about what another device has already notified about
        const { notifyNewChaptersLastNotifiedAt: lastNotifiedAt } = await getMetadataServerSettings({
            fetchPolicy: 'network-only',
        });
        // gets removed by disabling the setting, e.g. on another device
        if (!lastNotifiedAt) {
            return { chapters: [], isTruncated: false };
        }

        const { chapters, newestFetchedAt, after } = await LibraryUpdateNotifier.searchUpdates(lastNotifiedAt);

        await LibraryUpdateNotifier.setLastNotifiedAt(newestFetchedAt);

        return {
            chapters: chapters.slice(0, MAX_CHAPTERS),
            isTruncated: !!after || chapters.length > MAX_CHAPTERS,
        };
    }

    /**
     * The chapters of entries that got their chapter list fetched for the first time, e.g. because they were added to
     * the library, are no updates. They get excluded once they are known, and pages get fetched until enough updates
     * were found.
     *
     * The returned cursor is set when there are more chapters.
     */
    private static async searchUpdates(
        lastNotifiedAt: number,
        previous: UpdatesSearch = {
            chapters: [],
            newestFetchedAt: lastNotifiedAt,
            initialFetchMangaIds: [],
            checkedMangaIds: [],
            page: 0,
        },
    ): Promise<UpdatesSearch> {
        const { nodes, pageInfo } = await LibraryUpdateNotifier.fetchChapters(
            {
                fetchedAt: { greaterThan: `${lastNotifiedAt}` },
                isRead: { equalTo: false },
                ...(previous.initialFetchMangaIds.length ? { mangaId: { notIn: previous.initialFetchMangaIds } } : {}),
            },
            { first: PAGE_SIZE, after: previous.after },
        );

        const uncheckedMangaIds = [...new Set(nodes.map((chapter) => chapter.manga.id))].filter(
            (mangaId) => !previous.checkedMangaIds.includes(mangaId),
        );
        const isInitialFetchList = await Promise.all(
            uncheckedMangaIds.map((mangaId) => LibraryUpdateNotifier.isInitialFetch(mangaId, lastNotifiedAt)),
        );
        const initialFetchMangaIds = uncheckedMangaIds.filter((_, index) => isInitialFetchList[index]);

        const search: UpdatesSearch = {
            chapters: [
                ...previous.chapters,
                ...nodes.filter((chapter) => !initialFetchMangaIds.includes(chapter.manga.id)),
            ],
            newestFetchedAt: Math.max(previous.newestFetchedAt, ...nodes.map((chapter) => Number(chapter.fetchedAt))),
            initialFetchMangaIds: [...previous.initialFetchMangaIds, ...initialFetchMangaIds],
            checkedMangaIds: [...previous.checkedMangaIds, ...uncheckedMangaIds],
            page: previous.page + 1,
            // an empty page can come without a cursor, using none would start over from the first page
            after: (pageInfo.hasNextPage && pageInfo.endCursor) || undefined,
        };

        if (!search.after || search.chapters.length >= MAX_CHAPTERS || search.page >= MAX_PAGES) {
            return search;
        }

        return LibraryUpdateNotifier.searchUpdates(lastNotifiedAt, search);
    }

    private static showNotifications({ chapters, isTruncated }: LibraryUpdates): void {
        const chaptersByMangaId = Object.groupBy(chapters, (chapter) => chapter.manga.id);
        const mangaIds = Object.keys(chaptersByMangaId).map(Number);

        if (mangaIds.length > MAX_NOTIFICATIONS || isTruncated) {
            const count = chapters.length;
            const entryCount = mangaIds.length;

            notify(
                isTruncated
                    ? plural(count, { one: '#+ new chapter', other: '#+ new chapters' })
                    : plural(count, { one: '# new chapter', other: '# new chapters' }),
                {
                    body: isTruncated ? undefined : plural(entryCount, { one: 'in # entry', other: 'in # entries' }),
                    tag: 'new-chapters',
                    onClick: () => ReactRouter.navigate(AppRoutes.updates.path),
                },
            );

            return;
        }

        // the system fetches the icon without the session, which fails on a server that requires a login
        const canShowIcon = !AuthManager.isAuthRequired();

        mangaIds.forEach((mangaId) => {
            // the result of groupBy can't contain undefined values for the keys it returned
            const mangaChapters = chaptersByMangaId[mangaId]!;
            const [{ manga }] = mangaChapters;
            const count = mangaChapters.length;

            notify(manga.title, {
                body: plural(count, { one: '# new chapter', other: '# new chapters' }),
                icon: canShowIcon && manga.thumbnailUrl ? Mangas.getThumbnailUrl(manga) : undefined,
                // replaces a previous notification of the same entry instead of stacking them up
                tag: `new-chapters-${mangaId}`,
                onClick: () => ReactRouter.navigate(AppRoutes.manga.path(mangaId)),
            });
        });
    }

    /** An entry without any chapter from before the last notification got its chapter list fetched for the first time */
    private static async isInitialFetch(mangaId: MangaIdInfo['id'], lastNotifiedAt: number): Promise<boolean> {
        const { totalCount } = await LibraryUpdateNotifier.fetchChapters(
            { mangaId: { equalTo: mangaId }, fetchedAt: { lessThanOrEqualTo: `${lastNotifiedAt}` } },
            { first: 1 },
            false,
        );

        return !totalCount;
    }

    /** Uses the fetch date of the server instead of the clock of the client, which can differ */
    private static async getNewestFetchedAt(): Promise<number> {
        const { nodes } = await LibraryUpdateNotifier.fetchChapters({}, { first: 1 });

        return nodes.length ? Number(nodes[0].fetchedAt) : Math.floor(Date.now() / 1000);
    }

    private static async fetchChapters(
        filter: ChapterFilterInput,
        { first, after }: { first: number; after?: string },
        isInLibrary: boolean = true,
    ): Promise<GetChaptersUpdatesQuery['chapters']> {
        const { data } = await requestManager.getChapters<GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables>(
            GET_CHAPTERS_UPDATES,
            {
                filter: isInLibrary ? { ...filter, inLibrary: { equalTo: true } } : filter,
                order: [{ by: ChapterOrderBy.FetchedAt, byType: SortOrder.Desc }],
                first,
                after,
            },
            { fetchPolicy: 'no-cache' },
        ).response;

        assertIsDefined(data);

        return data.chapters;
    }

    private static async setLastNotifiedAt(fetchedAt: number): Promise<void> {
        await updateMetadataServerSettings('notifyNewChaptersLastNotifiedAt', fetchedAt);
    }
}
