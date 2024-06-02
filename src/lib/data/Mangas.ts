/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t as translate } from 'i18next';
import { DocumentNode } from '@apollo/client/core';
import { MetadataMigrationSettings, TManga, TranslationKey } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    ChapterConditionInput,
    GetMangasChapterIdsWithStateQuery,
    GetMangaToMigrateQuery,
    GetMangaToMigrateToFetchMutation,
    UpdateMangaCategoriesPatchInput,
} from '@/lib/graphql/generated/graphql.ts';
import { Chapters } from '@/lib/data/Chapters.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { getMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { FULL_MANGA_FIELDS } from '@/lib/graphql/Fragments.ts';

export type MangaAction =
    | 'download'
    | 'delete'
    | 'mark_as_read'
    | 'mark_as_unread'
    | 'remove_from_library'
    | 'change_categories'
    | 'migrate'
    | 'track';

export const actionToTranslationKey: {
    [key in MangaAction]: {
        action: {
            single: TranslationKey;
            selected: TranslationKey;
        };
        success: TranslationKey;
        error: TranslationKey;
    };
} = {
    download: {
        action: {
            single: 'chapter.action.download.add.label.action',
            selected: 'chapter.action.download.add.button.selected',
        },
        success: 'chapter.action.download.add.label.success',
        error: 'chapter.action.download.add.label.error',
    },
    delete: {
        action: {
            single: 'chapter.action.download.delete.label.action',
            selected: 'chapter.action.download.delete.button.selected',
        },
        success: 'chapter.action.download.delete.label.success',
        error: 'chapter.action.download.delete.label.error',
    },
    mark_as_read: {
        action: {
            single: 'chapter.action.mark_as_read.add.label.action.current',
            selected: 'chapter.action.mark_as_read.add.button.selected',
        },
        success: 'chapter.action.mark_as_read.add.label.success',
        error: 'chapter.action.mark_as_read.add.label.error',
    },
    mark_as_unread: {
        action: {
            single: 'chapter.action.mark_as_read.remove.label.action',
            selected: 'chapter.action.mark_as_read.remove.button.selected',
        },
        success: 'chapter.action.mark_as_read.remove.label.success',
        error: 'chapter.action.mark_as_read.remove.label.error',
    },
    remove_from_library: {
        action: {
            single: 'manga.action.library.remove.label.action',
            selected: 'manga.action.library.remove.button.selected',
        },
        success: 'manga.action.library.remove.label.success',
        error: 'manga.action.library.remove.label.error',
    },
    change_categories: {
        action: {
            single: 'manga.action.category.label.action',
            selected: 'manga.action.category.button.selected',
        },
        success: 'manga.action.category.label.success',
        error: 'manga.action.category.label.error',
    },
    migrate: {
        action: {
            single: 'global.button.migrate',
            selected: 'global.button.migrate', // not supported
        },
        success: 'manga.action.migrate.label.success',
        error: 'manga.action.migrate.label.error',
    },
    track: {
        action: {
            single: 'manga.action.track.add.label.action',
            selected: 'manga.action.track.add.label.action', // not supported
        },
        success: 'manga.action.track.add.label.success',
        error: 'manga.action.track.add.label.error',
    },
};

export type MangaChapterCountInfo = { chapters: Pick<TManga['chapters'], 'totalCount'> };
export type MangaDownloadInfo = Pick<TManga, 'downloadCount'> & MangaChapterCountInfo;
export type MangaUnreadInfo = Pick<TManga, 'unreadCount'> & MangaChapterCountInfo;
export type MangaThumbnailInfo = Pick<TManga, 'thumbnailUrl' | 'thumbnailUrlLastFetched'>;

export type MigrateMode = 'copy' | 'migrate';

type MangaToMigrate = NonNullable<GetMangaToMigrateQuery['manga']>;
type MangaToMigrateTo = NonNullable<GetMangaToMigrateToFetchMutation['fetchManga']>['manga'];

type DownloadChaptersOptions = {
    size?: number;
    onlyUnread?: boolean;
    downloadAhead?: boolean;
};
type MarkAsReadOptions = { wasManuallyMarkedAsRead: boolean };
type ChangeCategoriesOptions = { changeCategoriesPatch: UpdateMangaCategoriesPatchInput };
type MigrateOptions = {
    mangaIdToMigrateTo: number;
    mode: MigrateMode;
} & Partial<MetadataMigrationSettings>;

type MarkAsReadActionOption = MarkAsReadOptions &
    PropertiesNever<ChangeCategoriesOptions> &
    PropertiesNever<MigrateOptions> &
    PropertiesNever<DownloadChaptersOptions>;
type ChangeCategoriesActionOption = PropertiesNever<MarkAsReadOptions> &
    ChangeCategoriesOptions &
    PropertiesNever<MigrateOptions> &
    PropertiesNever<DownloadChaptersOptions>;
type MigrateActionOption = PropertiesNever<MarkAsReadOptions> &
    PropertiesNever<ChangeCategoriesOptions> &
    MigrateOptions &
    PropertiesNever<DownloadChaptersOptions>;
type DownloadActionOption = PropertiesNever<MarkAsReadOptions> &
    PropertiesNever<ChangeCategoriesOptions> &
    PropertiesNever<MigrateOptions> &
    DownloadChaptersOptions;
type DefaultActionOption = Partial<MarkAsReadOptions> &
    Partial<ChangeCategoriesOptions> &
    Partial<MigrateOptions> &
    Partial<DownloadChaptersOptions>;

type PerformActionOptions<Action extends MangaAction> = Action extends 'mark_as_read'
    ? MarkAsReadActionOption
    : Action extends 'change_categories'
      ? ChangeCategoriesActionOption
      : Action extends 'migrate'
        ? MigrateActionOption
        : Action extends 'download'
          ? DownloadActionOption
          : DefaultActionOption;

export class Mangas {
    static getIds(mangas: { id: number }[]): number[] {
        return mangas.map((manga) => manga.id);
    }

    static getFromCache<T>(
        id: number,
        fragment: DocumentNode = FULL_MANGA_FIELDS,
        fragmentName: string = 'FULL_MANGA_FIELDS',
    ): T | null {
        return requestManager.graphQLClient.client.cache.readFragment<T>({
            id: requestManager.graphQLClient.client.cache.identify({
                __typename: 'MangaType',
                id,
            }),
            fragment,
            fragmentName,
        });
    }

    static isNotDownloaded({ downloadCount }: MangaDownloadInfo): boolean {
        return downloadCount === 0;
    }

    static getNotDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isNotDownloaded);
    }

    static isFullyDownloaded({ downloadCount, chapters: { totalCount } }: MangaDownloadInfo): boolean {
        return downloadCount === totalCount;
    }

    static getFullyDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isFullyDownloaded);
    }

    static isPartiallyDownloaded(manga: MangaDownloadInfo): boolean {
        return !Mangas.isNotDownloaded(manga) && !Mangas.isFullyDownloaded(manga);
    }

    static getPartiallyDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isPartiallyDownloaded);
    }

    static isUnread({ unreadCount, chapters: { totalCount } }: MangaUnreadInfo): boolean {
        return unreadCount === totalCount;
    }

    static getUnread<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isUnread);
    }

    static isFullyRead({ unreadCount }: MangaUnreadInfo): boolean {
        return unreadCount === 0;
    }

    static getFullyRead<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isFullyRead);
    }

    static isPartiallyRead(manga: MangaUnreadInfo): boolean {
        return !Mangas.isUnread(manga) && !Mangas.isFullyRead(manga);
    }

    static getPartiallyRead<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isPartiallyRead);
    }

    static getThumbnailUrl(manga: Partial<MangaThumbnailInfo>): string {
        const thumbnailUrl = manga.thumbnailUrl
            ? `${manga.thumbnailUrl}?fetchedAt=${manga.thumbnailUrlLastFetched}`
            : 'nonExistingMangaUrl';
        return requestManager.getValidImgUrlFor(thumbnailUrl);
    }

    static getDuplicateLibraryMangas(title: string): ReturnType<typeof requestManager.getMangas> {
        return requestManager.getMangas({
            condition: { inLibrary: true },
            filter: { title: { likeInsensitive: title } },
        });
    }

    static async getChapterIdsWithState(
        mangaIds: number[],
        state: Pick<ChapterConditionInput, 'isRead' | 'isDownloaded' | 'isBookmarked'>,
    ): Promise<GetMangasChapterIdsWithStateQuery['chapters']['nodes']> {
        const { data } = await requestManager.getMangasChapterIdsWithState(mangaIds, state).response;
        return data.chapters.nodes;
    }

    static async downloadChapters(
        mangaIds: number[],
        { size, onlyUnread, downloadAhead = false }: DownloadChaptersOptions = {},
    ): Promise<void> {
        const [chaptersToConsider, unReadDownloadedChapters] = await Promise.all([
            Mangas.getChapterIdsWithState(mangaIds, {
                isRead: onlyUnread ? false : undefined,
                isDownloaded: false,
            }),
            downloadAhead ? Mangas.getChapterIdsWithState(mangaIds, { isRead: false, isDownloaded: true }) : [],
        ]);

        type MangaIdToDownloadSize = [MangaId: string, DownloadSize: number | undefined];

        const mangaIdToDefaultDownloadSize = mangaIds.map((mangaId) => [
            String(mangaId),
            size,
        ]) satisfies MangaIdToDownloadSize[];

        const mangaIdToChaptersToConsider = Object.groupBy(chaptersToConsider, ({ mangaId }) => mangaId);
        const mangaIdToUnReadDownloadedChapters = Object.groupBy(unReadDownloadedChapters, ({ mangaId }) => mangaId);

        const mangaIdToDownloadSize = Object.entries(mangaIdToUnReadDownloadedChapters).map(
            ([mangaId, downloadedChapters = []]) => {
                const downloadAheadSize = Math.max(0, (size ?? downloadedChapters.length) - downloadedChapters.length);
                const actualSize = downloadAhead ? downloadAheadSize : size;

                return [mangaId, actualSize];
            },
        ) satisfies MangaIdToDownloadSize[];

        const mangaIdToActualDownloadSize = Object.entries(
            Object.fromEntries([...mangaIdToDefaultDownloadSize, ...mangaIdToDownloadSize]),
        ) satisfies MangaIdToDownloadSize[];

        const chapterIdsToDownload = mangaIdToActualDownloadSize
            .map(([mangaId, actualSize]) => {
                const mangaChapters = mangaIdToChaptersToConsider[Number(mangaId)] ?? [];

                if (!mangaChapters.length) {
                    return [];
                }

                const shouldDownloadAll = actualSize === undefined;
                if (shouldDownloadAll) {
                    return mangaChapters;
                }

                const uniqueMangaChapters = Chapters.removeDuplicates(mangaChapters[0], mangaChapters);
                const uniqueMangaChaptersToDownload = uniqueMangaChapters.slice(0, actualSize);

                return Chapters.addDuplicates(uniqueMangaChaptersToDownload, mangaChapters);
            })
            .flat();

        if (!chapterIdsToDownload.length) {
            return Promise.resolve();
        }

        return Chapters.download(Chapters.getIds(chapterIdsToDownload));
    }

    static async deleteChapters(mangaIds: number[]): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isDownloaded: true });
        return Chapters.delete(Chapters.getIds(chapters));
    }

    static async markAsRead(mangaIds: number[], wasManuallyMarkedAsRead: boolean = false): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isRead: false });
        return Chapters.markAsRead(chapters, wasManuallyMarkedAsRead, mangaIds.length === 1 ? mangaIds[0] : undefined);
    }

    static async markAsUnread(mangaIds: number[]): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isRead: true });
        return Chapters.markAsUnread(Chapters.getIds(chapters));
    }

    static async removeFromLibrary(mangaIds: number[]): Promise<void> {
        const { removeMangaFromCategories } = await getMetadataServerSettings();
        return Mangas.executeAction(
            'remove_from_library',
            mangaIds.length,
            () =>
                requestManager.updateMangas(mangaIds, {
                    updateMangas: { inLibrary: false },
                    updateMangasCategories: removeMangaFromCategories ? { clearCategories: true } : undefined,
                }).response,
        );
    }

    static async changeCategories(mangaIds: number[], patch: UpdateMangaCategoriesPatchInput): Promise<void> {
        return Mangas.executeAction(
            'change_categories',
            mangaIds.length,
            () => requestManager.updateMangasCategories(mangaIds, patch).response,
        );
    }

    private static async migrateChapters(
        mangaToMigrate: GetMangaToMigrateQuery['manga'],
        mangaToMigrateToInfo: GetMangaToMigrateToFetchMutation,
    ): Promise<void> {
        if (!mangaToMigrate.chapters || !mangaToMigrateToInfo.fetchChapters?.chapters) {
            throw new Error('Chapters are missing');
        }

        const chaptersToMigrate = mangaToMigrate.chapters.nodes;

        const chaptersToMigrateTo = mangaToMigrateToInfo.fetchChapters?.chapters;
        const migratableChapters = Chapters.getMatchingChapterNumberChapters(chaptersToMigrate, chaptersToMigrateTo);

        const readChapters: number[] = [];
        const bookmarkedChapters: number[] = [];

        migratableChapters.forEach(([chapterToMigrate, chapterToMigrateTo]) => {
            const { isRead, isBookmarked } = chapterToMigrate;

            if (isRead) {
                readChapters.push(chapterToMigrateTo.id);
            }

            if (isBookmarked) {
                bookmarkedChapters.push(chapterToMigrateTo.id);
            }
        });

        await Promise.all([
            requestManager.updateChapters(readChapters, { isRead: true }).response,
            requestManager.updateChapters(bookmarkedChapters, { isBookmarked: true }).response,
        ]);
    }

    private static async migrateCategories(
        mangaToMigrate: MangaToMigrate,
        mangaToMigrateTo: MangaToMigrateTo,
    ): Promise<void> {
        if (!mangaToMigrate?.categories) {
            throw new Error('Categories are missing');
        }

        await requestManager.updateMangasCategories([mangaToMigrateTo.id], {
            addToCategories: mangaToMigrate.categories.nodes.map((category) => category.id),
        }).response;
    }

    private static async migrateTracking(
        mode: MigrateMode,
        mangaToMigrate: MangaToMigrate,
        mangaToMigrateTo: MangaToMigrateTo,
    ): Promise<void> {
        if (!mangaToMigrate.trackRecords) {
            throw new Error('TrackRecords of manga to migrate are missing');
        }

        if (!mangaToMigrateTo.trackRecords) {
            throw new Error('TrackRecords of manga to migrate to are missing');
        }

        const trackBindingsToAdd = mangaToMigrate.trackRecords.nodes.filter((trackRecordToMigrate) =>
            mangaToMigrateTo.trackRecords!.nodes.every(
                (trackRecord) => trackRecordToMigrate.remoteId !== trackRecord.remoteId,
            ),
        );

        await Promise.all([
            ...(mode === 'migrate'
                ? mangaToMigrate.trackRecords.nodes.map(
                      (trackRecord) => requestManager.unbindTracker(trackRecord.id).response,
                  )
                : []),
            ...trackBindingsToAdd.map((trackRecord) =>
                requestManager.bindTracker(mangaToMigrateTo.id, trackRecord.trackerId, trackRecord.remoteId),
            ),
        ]);
    }

    static async migrate(
        mangaId: number,
        mangaIdToMigrateTo: number,
        {
            mode,
            migrateChapters,
            migrateCategories,
            migrateTracking,
            deleteChapters,
        }: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
        return Mangas.executeAction('migrate', 1, async () => {
            const [{ data: mangaToMigrateData }, { data: mangaToMigrateToData }] = await Promise.all([
                requestManager.getMangaToMigrate(mangaId, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                    deleteChapters,
                }).response,
                requestManager.getMangaToMigrateToFetch(mangaIdToMigrateTo, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                }).response,
            ]);

            if (!mangaToMigrateData.manga || !mangaToMigrateToData?.fetchManga?.manga) {
                throw new Error('Mangas::migrate: missing manga data');
            }

            if (
                migrateChapters &&
                (!mangaToMigrateData.manga.chapters || !mangaToMigrateToData.fetchChapters?.chapters)
            ) {
                throw new Error('Mangas::migrate: missing chapters data');
            }

            await Promise.all([
                migrateChapters ? Mangas.migrateChapters(mangaToMigrateData.manga, mangaToMigrateToData) : undefined,
                deleteChapters
                    ? requestManager.deleteDownloadedChapters(
                          Chapters.getIds(Chapters.getDownloaded(mangaToMigrateData.manga.chapters?.nodes ?? [])),
                      ).response
                    : undefined,
                migrateCategories
                    ? Mangas.migrateCategories(mangaToMigrateData.manga, mangaToMigrateToData.fetchManga.manga)
                    : undefined,
                migrateTracking
                    ? Mangas.migrateTracking(mode, mangaToMigrateData.manga, mangaToMigrateToData.fetchManga.manga)
                    : undefined,
                !mangaToMigrateToData.fetchManga.manga.inLibrary
                    ? requestManager.updateManga(mangaIdToMigrateTo, { updateManga: { inLibrary: true } }).response
                    : undefined,
                mode === 'migrate'
                    ? requestManager.updateManga(mangaId, { updateManga: { inLibrary: false } }).response
                    : undefined,
            ]);
        });
    }

    private static async executeAction(
        action: MangaAction,
        itemCount: number,
        fnToExecute: () => Promise<unknown>,
    ): Promise<void> {
        try {
            await fnToExecute();
            makeToast(translate(actionToTranslationKey[action].success, { count: itemCount }), 'success');
        } catch (e) {
            makeToast(translate(actionToTranslationKey[action].error, { count: itemCount }), 'error');
            throw e;
        }
    }

    static async performAction<Action extends MangaAction>(
        action: Action,
        mangaIds: number[],
        {
            wasManuallyMarkedAsRead,
            changeCategoriesPatch,
            mangaIdToMigrateTo,
            downloadAhead,
            onlyUnread,
            size,
            ...migrateOptions
        }: PerformActionOptions<Action>,
    ): Promise<void> {
        switch (action) {
            case 'download':
                return Mangas.downloadChapters(mangaIds, { downloadAhead, onlyUnread, size });
            case 'delete':
                return Mangas.deleteChapters(mangaIds);
            case 'mark_as_read':
                return Mangas.markAsRead(mangaIds, wasManuallyMarkedAsRead!);
            case 'mark_as_unread':
                return Mangas.markAsUnread(mangaIds);
            case 'remove_from_library':
                return Mangas.removeFromLibrary(mangaIds);
            case 'change_categories':
                return Mangas.changeCategories(mangaIds, changeCategoriesPatch!);
            case 'migrate': {
                return Mangas.migrate(mangaIds[0], mangaIdToMigrateTo!, migrateOptions as unknown as MigrateOptions);
            }
            default:
                throw new Error(`Mangas::performAction: unknown action "${action}"`);
        }
    }
}
