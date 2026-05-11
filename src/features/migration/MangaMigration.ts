/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import type {
    GetMangaToMigrateQuery,
    GetMangaToMigrateToFetchMutation,
    SetChapterMetasItemInput,
} from '@/lib/graphql/generated/graphql.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ALL_APP_METADATA_KEY_PREFIXES } from '@/features/metadata/Metadata.constants.ts';
import type { MigrateMode, MigrateOptions } from '@/features/migration/Migration.types.ts';
import type {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterNumberInfo,
    ChapterReadInfo,
} from '@/features/chapter/Chapter.types.ts';
import type { GqlMetaHolder } from '@/features/metadata/Metadata.types.ts';
import { getMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';

type MangaToMigrate = NonNullable<GetMangaToMigrateQuery['manga']>;
type MangaToMigrateTo = NonNullable<GetMangaToMigrateToFetchMutation['fetchManga']>['manga'];

export type MigrationChapter = ChapterIdInfo &
    ChapterReadInfo &
    ChapterBookmarkInfo &
    ChapterNumberInfo &
    ChapterDownloadInfo &
    GqlMetaHolder;

type MigrateAction = { copy: () => Promise<unknown>[]; cleanup: () => Promise<unknown>[] };
type MigrateActionCreator = () => MigrateAction;

const performMigrationAction = async (migrateAction: keyof MigrateAction, ...actions: MigrateAction[]) =>
    Promise.all(actions.flatMap((action) => action[migrateAction]()));

export class MangaMigration {
    static async migrate(
        mangaToMigrate: MangaToMigrate | null | undefined,
        mangaToMigrateTo: MangaToMigrateTo | null | undefined,
        chaptersToMigrateTo: MigrationChapter[] | null | undefined,
        {
            mode,
            migrateChapters,
            migrateCategories,
            migrateTracking,
            deleteChapters,
            migrateMetadata,
        }: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
        removeMangaFromCategories: boolean,
    ): Promise<void> {
        if (!mangaToMigrate || !mangaToMigrateTo) {
            throw new Error('MangaMigration::migrate: missing manga data');
        }

        if (migrateChapters && !mangaToMigrate.chapters) {
            throw new Error('MangaMigration::migrate: missing chapters data');
        }

        const performMigrationActions = async (...actionCreators: [boolean | undefined, MigrateActionCreator][]) => {
            const migrationActions: TupleUnion<keyof MigrateAction> = ['copy', 'cleanup'];

            const actions = actionCreators
                .filter(([performAction]) => performAction)
                .map(([, actionCreator]) => actionCreator());

            for (const migrationAction of migrationActions) {
                // the migration actions (copy, cleanup) are supposed to be run sequentially to ensure that the cleanup
                // only happens in case the copy succeeded

                // oxlint-disable-next-line no-await-in-loop
                await performMigrationAction(migrationAction, ...actions);
            }
        };

        await performMigrationActions(
            [
                migrateChapters,
                () =>
                    MangaMigration.migrateChapters(
                        mode,
                        mangaToMigrate.chapters?.nodes,
                        chaptersToMigrateTo,
                        !!deleteChapters,
                        !!migrateMetadata,
                    ),
            ],
            [migrateTracking, () => MangaMigration.migrateTracking(mode, mangaToMigrate, mangaToMigrateTo)],
            [
                true,
                () =>
                    MangaMigration.migrateManga(
                        mode,
                        mangaToMigrate,
                        mangaToMigrateTo,
                        !!migrateCategories,
                        removeMangaFromCategories,
                        !!migrateMetadata,
                    ),
            ],
        );
    }

    static async migrateByIdWithQuery(
        mangaId: MangaIdInfo['id'],
        mangaIdToMigrateTo: number,
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
        const { migrateChapters, migrateCategories, migrateTracking, deleteChapters, migrateMetadata } = options;

        const [{ data: mangaToMigrateData }, { data: mangaToMigrateToData }, { removeMangaFromCategories }] =
            await Promise.all([
                requestManager.getMangaToMigrate(mangaId, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                    deleteChapters,
                    migrateMetadata,
                }).response,
                requestManager.getMangaToMigrate(mangaIdToMigrateTo, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                    deleteChapters,
                    migrateMetadata,
                }).response,
                getMetadataServerSettings(),
            ]);

        await MangaMigration.migrate(
            mangaToMigrateData?.manga,
            mangaToMigrateToData?.manga,
            mangaToMigrateToData?.manga?.chapters?.nodes,
            options,
            removeMangaFromCategories,
        );
    }

    static async migrateByIdWithFetch(
        mangaId: MangaIdInfo['id'],
        mangaIdToMigrateTo: number,
        options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
        const { migrateChapters, migrateCategories, migrateTracking, deleteChapters, migrateMetadata } = options;

        const [{ data: mangaToMigrateData }, { data: mangaToMigrateToData }, { removeMangaFromCategories }] =
            await Promise.all([
                requestManager.getMangaToMigrate(mangaId, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                    deleteChapters,
                    migrateMetadata,
                }).response,
                requestManager.getMangaToMigrateToFetch(mangaIdToMigrateTo, {
                    migrateChapters,
                    migrateCategories,
                    migrateTracking,
                    apolloOptions: { errorPolicy: 'all' },
                }).response,
                getMetadataServerSettings(),
            ]);

        await MangaMigration.migrate(
            mangaToMigrateData?.manga,
            mangaToMigrateToData?.fetchManga?.manga,
            mangaToMigrateToData?.fetchChapters?.chapters,
            options,
            removeMangaFromCategories,
        );
    }

    private static migrateChapters(
        mode: MigrateMode,
        chaptersToMigrate: MigrationChapter[] | null | undefined,
        chaptersToMigrateTo: MigrationChapter[] | null | undefined,
        deleteChapters: boolean,
        migrateMetadata: boolean,
    ): MigrateAction {
        if (!chaptersToMigrate || !chaptersToMigrateTo) {
            throw new Error('Chapters are missing');
        }

        const migratableChapters = Chapters.getMatchingChapterNumberChapters(chaptersToMigrate, chaptersToMigrateTo);

        const highestReadChapterNumber = chaptersToMigrate.reduce((chapterNumber, chapterToMigrate) => {
            if (chapterToMigrate.isRead && chapterNumber < chapterToMigrate.chapterNumber) {
                return chapterToMigrate.chapterNumber;
            }

            return chapterNumber;
        }, Number.MIN_SAFE_INTEGER);

        const bookmarkedChapters: number[] = [];

        const chapterPreDeleteIds: number[] = [];
        const chapterUpdateItems: SetChapterMetasItemInput[] = [];

        const readChapters = Chapters.getIds(
            chaptersToMigrateTo.filter(
                (chapterToMigrateTo) => chapterToMigrateTo.chapterNumber <= highestReadChapterNumber,
            ),
        );

        migratableChapters.forEach(([chapterToMigrate, chapterToMigrateTo]) => {
            const { isBookmarked, meta } = chapterToMigrate;

            if (isBookmarked) {
                bookmarkedChapters.push(chapterToMigrateTo.id);
            }

            if (migrateMetadata && meta?.length) {
                chapterPreDeleteIds.push(chapterToMigrateTo.id);
                chapterUpdateItems.push({
                    chapterIds: [chapterToMigrateTo.id],
                    metas: meta.map(({ key, value }) => ({ key, value })),
                });
            }
        });

        return {
            copy: () =>
                [
                    readChapters.length && requestManager.updateChapters(readChapters, { isRead: true }).response,
                    bookmarkedChapters.length &&
                        requestManager.updateChapters(bookmarkedChapters, { isBookmarked: true }).response,
                    chapterUpdateItems.length &&
                        requestManager.updateChapterMeta({
                            preUpdateDeleteInput: {
                                items: [
                                    {
                                        chapterIds: chapterPreDeleteIds,
                                        prefixes: ALL_APP_METADATA_KEY_PREFIXES,
                                    },
                                ],
                            },
                            updateInput: { items: chapterUpdateItems },
                        }).response,
                ].filter((promise) => !!promise),
            cleanup: () =>
                mode === 'migrate'
                    ? [
                          deleteChapters
                              ? requestManager.deleteDownloadedChapters(
                                    Chapters.getIds(Chapters.getDownloaded(chaptersToMigrate)),
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
    ): MigrateAction {
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
                        requestManager.bindTracker(
                            mangaToMigrateTo.id,
                            trackRecord.trackerId,
                            trackRecord.remoteId,
                            trackRecord.private,
                        ).response,
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
        migrateMetadata: boolean,
    ): MigrateAction {
        if (migrateCategories && !mangaToMigrateFrom?.categories) {
            throw new Error('Categories are missing');
        }

        const mangaMeta = migrateMetadata ? mangaToMigrateFrom.meta : undefined;

        return {
            copy: () =>
                [
                    requestManager.updateManga(mangaToMigrateTo.id, {
                        updateManga: { inLibrary: true },
                        updateMangaCategories: migrateCategories
                            ? {
                                  addToCategories: mangaToMigrateFrom.categories?.nodes.map((category) => category.id),
                              }
                            : undefined,
                    }).response,
                    mangaMeta?.length &&
                        requestManager.updateMangaMeta({
                            preUpdateDeleteInput: {
                                items: [
                                    {
                                        mangaIds: [mangaToMigrateTo.id],
                                        prefixes: ALL_APP_METADATA_KEY_PREFIXES,
                                    },
                                ],
                            },
                            updateInput: {
                                items: [
                                    {
                                        mangaIds: [mangaToMigrateTo.id],
                                        metas: mangaMeta.map(({ key, value }) => ({ key, value })),
                                    },
                                ],
                            },
                        }).response,
                ].filter((promise) => !!promise),
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
}
