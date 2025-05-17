/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import i18next, { t as translate } from 'i18next';
import { DocumentNode, Unmasked } from '@apollo/client/core';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    ChapterConditionInput,
    GetMangasBaseQuery,
    GetMangasBaseQueryVariables,
    GetMangasChapterIdsWithStateQuery,
    GetMangaToMigrateQuery,
    GetMangaToMigrateToFetchMutation,
    MangaBaseFieldsFragment,
    UpdateMangaCategoriesPatchInput,
} from '@/lib/graphql/generated/graphql.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { getMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { GET_MANGAS_BASE } from '@/lib/graphql/queries/MangaQuery.ts';
import { MANGA_BASE_FIELDS } from '@/lib/graphql/fragments/MangaFragments.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';
import {
    MangaAction,
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaDownloadInfo,
    MangaGenreInfo,
    MangaIdInfo,
    MangaSourceLngInfo,
    MangaSourceNameInfo,
    MangaThumbnailInfo,
    MangaType,
    MangaUnreadInfo,
    MigrateMode,
} from '@/modules/manga/Manga.types.ts';
import {
    MANGA_ACTION_TO_TRANSLATION,
    MANGA_TAGS_BY_MANGA_TYPE,
    SOURCES_BY_MANGA_TYPE,
} from '@/modules/manga/Manga.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

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

type MigrateFuncReturn = { copy: () => Promise<unknown>[]; cleanup: () => Promise<unknown>[] };

const ARTIST_AUTHOR_SEPARATOR_REGEX = /\s*[,|、]\s*/;

export class Mangas {
    static getIds(mangas: MangaIdInfo[]): number[] {
        return mangas.map((manga) => manga.id);
    }

    static getFromCache<T = MangaBaseFieldsFragment>(
        id: MangaIdInfo['id'],
        fragment: DocumentNode = MANGA_BASE_FIELDS,
        fragmentName: string = 'MANGA_BASE_FIELDS',
    ): Unmasked<T> | null {
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
            : '';
        return requestManager.getValidImgUrlFor(thumbnailUrl);
    }

    static getDuplicateLibraryMangas(
        title: string,
    ): ReturnType<typeof requestManager.getMangas<GetMangasBaseQuery, GetMangasBaseQueryVariables>> {
        return requestManager.getMangas<GetMangasBaseQuery, GetMangasBaseQueryVariables>(GET_MANGAS_BASE, {
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

    private static migrateChapters(
        mode: MigrateMode,
        mangaToMigrate: GetMangaToMigrateQuery['manga'],
        mangaToMigrateToInfo: GetMangaToMigrateToFetchMutation,
        deleteChapters: boolean,
    ): MigrateFuncReturn {
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

        return {
            copy: () =>
                [
                    readChapters.length && requestManager.updateChapters(readChapters, { isRead: true }).response,
                    bookmarkedChapters.length &&
                        requestManager.updateChapters(bookmarkedChapters, { isBookmarked: true }).response,
                ].filter((promise) => !!promise),
            cleanup: () =>
                mode === 'migrate'
                    ? [
                          deleteChapters
                              ? requestManager.deleteDownloadedChapters(
                                    Chapters.getIds(Chapters.getDownloaded(mangaToMigrate.chapters?.nodes ?? [])),
                                ).response
                              : Promise.resolve(),
                      ]
                    : [],
        };
    }

    private static migrateTracking(
        mode: MigrateMode,
        mangaToMigrate: MangaToMigrate,
        mangaToMigrateTo: MangaToMigrateTo,
    ): MigrateFuncReturn {
        if (!mangaToMigrate.trackRecords) {
            throw new Error('TrackRecords of manga to migrate are missing');
        }

        if (!mangaToMigrateTo.trackRecords) {
            throw new Error('TrackRecords of manga to migrate to are missing');
        }

        const trackBindingsToAdd = mangaToMigrate.trackRecords.nodes.filter((trackRecordToMigrate) =>
            mangaToMigrateTo.trackRecords?.nodes.every(
                (trackRecord) => trackRecordToMigrate.remoteId !== trackRecord.remoteId,
            ),
        );

        return {
            copy: () =>
                trackBindingsToAdd.map(
                    (trackRecord) =>
                        requestManager.bindTracker(mangaToMigrateTo.id, trackRecord.trackerId, trackRecord.remoteId)
                            .response,
                ),
            cleanup: () =>
                mode === 'migrate'
                    ? (mangaToMigrate.trackRecords?.nodes.map(
                          (trackRecord) => requestManager.unbindTracker(trackRecord.id).response,
                      ) ?? [])
                    : [],
        };
    }

    private static migrateManga(
        mode: MigrateMode,
        mangaToMigrateFrom: MangaToMigrate,
        mangaToMigrateTo: MangaToMigrateTo,
        migrateCategories: boolean,
        removeMangaFromCategories: boolean,
    ): MigrateFuncReturn {
        if (!mangaToMigrateFrom?.categories) {
            throw new Error('Categories are missing');
        }

        return {
            copy: () => [
                requestManager.updateManga(mangaToMigrateTo.id, {
                    updateManga: { inLibrary: true },
                    updateMangaCategories: migrateCategories
                        ? {
                              addToCategories: mangaToMigrateFrom.categories?.nodes.map((category) => category.id),
                          }
                        : undefined,
                }).response,
            ],
            cleanup: () =>
                mode === 'migrate'
                    ? [
                          requestManager.updateManga(mangaToMigrateFrom.id, {
                              updateManga: { inLibrary: false },
                              updateMangaCategories: removeMangaFromCategories ? { clearCategories: true } : undefined,
                          }).response,
                      ]
                    : [],
        };
    }

    static async migrate(
        mangaId: MangaIdInfo['id'],
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
            const [{ data: mangaToMigrateData }, { data: mangaToMigrateToData }, { removeMangaFromCategories }] =
                await Promise.all([
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
                        apolloOptions: { errorPolicy: 'all' },
                    }).response,
                    getMetadataServerSettings(),
                ]);

            if (!mangaToMigrateData.manga || !mangaToMigrateToData?.fetchManga?.manga) {
                throw new Error('Mangas::migrate: missing manga data');
            }

            if (migrateChapters && !mangaToMigrateData.manga.chapters) {
                throw new Error('Mangas::migrate: missing chapters data');
            }

            if (!mangaToMigrateToData.fetchChapters?.chapters) {
                mangaToMigrateToData.fetchChapters = { chapters: [] };
            }

            const performMigrationAction = async (
                migrateAction: keyof MigrateFuncReturn,
                ...actions: [boolean | undefined, MigrateFuncReturn][]
            ) =>
                Promise.all(
                    actions
                        .filter(([performAction]) => performAction)
                        .map(([, action]) => action[migrateAction]())
                        .flat(),
                );

            const performMigrationActions = async (...actions: [boolean | undefined, MigrateFuncReturn][]) => {
                const migrationActions: TupleUnion<keyof MigrateFuncReturn> = ['copy', 'cleanup'];

                for (const migrationAction of migrationActions) {
                    // the migration actions (copy, cleanup) are supposed to be run sequentially to ensure that the cleanup
                    // only happens in case the copy succeeded
                    // eslint-disable-next-line no-await-in-loop
                    await performMigrationAction(migrationAction, ...actions);
                }
            };

            await performMigrationActions(
                [
                    migrateChapters,
                    Mangas.migrateChapters(mode, mangaToMigrateData.manga, mangaToMigrateToData, !!deleteChapters),
                ],
                [
                    migrateTracking,
                    Mangas.migrateTracking(mode, mangaToMigrateData.manga, mangaToMigrateToData.fetchManga.manga),
                ],
                [
                    true,
                    Mangas.migrateManga(
                        mode,
                        mangaToMigrateData.manga,
                        mangaToMigrateToData.fetchManga.manga,
                        !!migrateCategories,
                        removeMangaFromCategories,
                    ),
                ],
            );
        });
    }

    private static async executeAction(
        action: MangaAction,
        itemCount: number,
        fnToExecute: () => Promise<unknown>,
    ): Promise<void> {
        try {
            await fnToExecute();
            makeToast(translate(MANGA_ACTION_TO_TRANSLATION[action].success, { count: itemCount }), 'success');
        } catch (e) {
            makeToast(
                translate(MANGA_ACTION_TO_TRANSLATION[action].error, { count: itemCount }),
                'error',
                getErrorMessage(e),
            );
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

    static getType(manga: MangaGenreInfo & MangaSourceNameInfo & MangaSourceLngInfo): MangaType {
        if (Mangas.isType(manga, MangaType.MANGA)) {
            return MangaType.MANGA;
        }

        if (Mangas.isType(manga, MangaType.COMIC)) {
            return MangaType.COMIC;
        }

        if (Mangas.isType(manga, MangaType.WEBTOON)) {
            return MangaType.WEBTOON;
        }

        if (Mangas.isType(manga, MangaType.MANHWA)) {
            return MangaType.MANHWA;
        }

        if (Mangas.isType(manga, MangaType.MANHUA)) {
            return MangaType.MANHUA;
        }

        return MangaType.MANGA;
    }

    static isType(manga: MangaGenreInfo & MangaSourceNameInfo & MangaSourceLngInfo, type: MangaType): boolean {
        const translateMangaTagsByMangaTypeEntries = Object.entries(MANGA_TAGS_BY_MANGA_TYPE).map(
            ([mangaType, tags]) => [
                mangaType,
                ['en', i18next.language, manga.source?.lang]
                    .filter((lng) => !!lng)
                    .flatMap((language) => tags.flatMap((tag) => translate(tag, { lng: language }))),
            ],
        );
        const translatedMangaTagsByMangaType = Object.fromEntries(translateMangaTagsByMangaTypeEntries) as Record<
            string,
            string[]
        >;

        const isMatchByGenre = manga.genre.some((genre) =>
            translatedMangaTagsByMangaType[type].some((tag) => genre.toLowerCase().includes(tag.toLowerCase())),
        );
        const isMatchBySource = SOURCES_BY_MANGA_TYPE[type].includes(manga.source?.name.toLowerCase() ?? '');

        return isMatchByGenre || isMatchBySource;
    }

    static isLongStripType(manga: MangaGenreInfo & MangaSourceNameInfo & MangaSourceLngInfo): boolean {
        return (
            Mangas.isType(manga, MangaType.WEBTOON) ||
            Mangas.isType(manga, MangaType.MANHWA) ||
            Mangas.isType(manga, MangaType.MANHUA)
        );
    }

    static getArtists<Manga extends MangaArtistInfo>(manga: Manga): string[] | undefined {
        return manga.artist?.split(ARTIST_AUTHOR_SEPARATOR_REGEX);
    }

    static getAuthors<Manga extends MangaAuthorInfo>(manga: Manga): string[] | undefined {
        return manga.author?.split(ARTIST_AUTHOR_SEPARATOR_REGEX);
    }
}
