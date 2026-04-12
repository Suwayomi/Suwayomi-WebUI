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
import { getMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { ALL_APP_METADATA_KEY_PREFIXES } from '@/features/metadata/Metadata.constants.ts';
import type { MigrateMode, MigrateOptions } from '@/features/migration/Migration.types.ts';

type MangaToMigrate = NonNullable<GetMangaToMigrateQuery['manga']>;
type MangaToMigrateTo = NonNullable<GetMangaToMigrateToFetchMutation['fetchManga']>['manga'];

type MigrateAction = { copy: () => Promise<unknown>[]; cleanup: () => Promise<unknown>[] };
type MigrateActionCreator = () => MigrateAction;

const performMigrationAction = async (migrateAction: keyof MigrateAction, ...actions: MigrateAction[]) =>
    Promise.all(actions.flatMap((action) => action[migrateAction]()));

export class MangaMigration {
    static async migrate(
        mangaId: MangaIdInfo['id'],
        mangaIdToMigrateTo: number,
        {
            mode,
            migrateChapters,
            migrateCategories,
            migrateTracking,
            deleteChapters,
            migrateMetadata,
        }: Omit<MigrateOptions, 'mangaIdToMigrateTo'>,
    ): Promise<void> {
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

        if (!mangaToMigrateData?.manga || !mangaToMigrateToData?.fetchManga?.manga) {
            throw new Error('MangaMigration::migrate: missing manga data');
        }

        if (migrateChapters && !mangaToMigrateData.manga.chapters) {
            throw new Error('MangaMigration::migrate: missing chapters data');
        }

        if (!mangaToMigrateToData.fetchChapters?.chapters) {
            mangaToMigrateToData.fetchChapters = { chapters: [] };
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
                        mangaToMigrateData.manga,
                        mangaToMigrateToData,
                        !!deleteChapters,
                        !!migrateMetadata,
                    ),
            ],
            [
                migrateTracking,
                () =>
                    MangaMigration.migrateTracking(
                        mode,
                        mangaToMigrateData.manga,
                        mangaToMigrateToData.fetchManga!.manga,
                    ),
            ],
            [
                true,
                () =>
                    MangaMigration.migrateManga(
                        mode,
                        mangaToMigrateData.manga,
                        mangaToMigrateToData.fetchManga!.manga,
                        !!migrateCategories,
                        removeMangaFromCategories,
                        !!migrateMetadata,
                    ),
            ],
        );
    }

    private static migrateChapters(
        mode: MigrateMode,
        mangaToMigrate: GetMangaToMigrateQuery['manga'],
        mangaToMigrateToInfo: GetMangaToMigrateToFetchMutation,
        deleteChapters: boolean,
        migrateMetadata: boolean,
    ): MigrateAction {
        if (!mangaToMigrate.chapters || !mangaToMigrateToInfo.fetchChapters?.chapters) {
            throw new Error('Chapters are missing');
        }

        const chaptersToMigrate = mangaToMigrate.chapters.nodes;

        const chaptersToMigrateTo = mangaToMigrateToInfo.fetchChapters?.chapters;
        const migratableChapters = Chapters.getMatchingChapterNumberChapters(chaptersToMigrate, chaptersToMigrateTo);

        const readChapters: number[] = [];
        const bookmarkedChapters: number[] = [];

        const chapterPreDeleteIds: number[] = [];
        const chapterUpdateItems: SetChapterMetasItemInput[] = [];

        migratableChapters.forEach(([chapterToMigrate, chapterToMigrateTo]) => {
            const { isRead, isBookmarked, meta } = chapterToMigrate;

            if (isRead) {
                readChapters.push(chapterToMigrateTo.id);
            }

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
