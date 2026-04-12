/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Direction } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { t } from '@lingui/core/macro';
import type { ChapterIdInfo, TChapterReader } from '@/features/chapter/Chapter.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { IReaderSettings, ReaderOpenChapterLocationState } from '@/features/reader/Reader.types.ts';
import { ReaderExitMode, ReaderOverlayMode, ReadingDirection, ReadingMode } from '@/features/reader/Reader.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MANGA_META_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { useBackButton } from '@/base/hooks/useBackButton.ts';
import { GLOBAL_READER_SETTING_KEYS } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import type { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import {
    getChapterIdsForDownloadAhead,
    getChapterIdsToDeleteForChapterUpdate,
    getReaderChapterFromCache,
    isInDownloadAheadRange,
    updateReaderStateVisibleChapters,
} from '@/features/reader/Reader.utils.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { Queue } from '@/lib/Queue.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { FALLBACK_MANGA, GLOBAL_READER_SETTINGS_MANGA } from '@/features/manga/Manga.constants.ts';
import { getMetadataKey } from '@/features/metadata/Metadata.utils.ts';
import { DirectionOffset } from '@/base/Base.types.ts';
import {
    getReaderChaptersStore,
    getReaderPagesStore,
    getReaderSettingsStore,
    getReaderStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getMetadataUpdateFunction } from '@/features/metadata/services/MetadataUpdater.ts';
import { MetadataChunker } from '@/features/metadata/services/MetadataChunker.ts';
import { MetadataValueCache } from '@/features/metadata/services/MetadataValueCache.ts';
import { convertFromGqlMeta, convertToGqlMeta } from '@/features/metadata/services/MetadataConverter.ts';
import { GLOBAL_METADATA } from '@/lib/graphql/common/Fragments.ts';
import type {
    AppMetadataKeys,
    GqlMetaHolder,
    Metadata,
    MetadataHolderType,
} from '@/features/metadata/Metadata.types.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';

const DIRECTION_TO_INVERTED: Record<Direction, Direction> = {
    ltr: 'rtl',
    rtl: 'ltr',
};

const DIRECTION_TO_READING_DIRECTION: Record<Direction, ReadingDirection> = {
    ltr: ReadingDirection.LTR,
    rtl: ReadingDirection.RTL,
};

export class ReaderService {
    private static downloadAheadQueue: Queue = new Queue(1);

    private static chapterUpdateQueues: Map<ChapterIdInfo['id'], Queue> = new Map();

    private static getOrCreateChapterUpdateQueue(id: ChapterIdInfo['id']): Queue {
        if (!ReaderService.chapterUpdateQueues.has(id)) {
            ReaderService.chapterUpdateQueues.set(id, new Queue(1));
        }

        return ReaderService.chapterUpdateQueues.get(id)!;
    }

    static navigateToChapter(chapter: TChapterReader, state?: ReaderOpenChapterLocationState): void {
        ReactRouter.navigate(Chapters.getReaderUrl(chapter), {
            replace: true,
            state,
        });
    }

    static downloadAhead(
        currentChapter: TChapterReader,
        nextChapter: TChapterReader | undefined,
        nextChapters: TChapterReader[],
        pageIndex: number,
        downloadAheadLimit: number,
    ): void {
        const key = `${currentChapter.id}_${nextChapter?.id}_${pageIndex}_${downloadAheadLimit}`;

        ReaderService.downloadAheadQueue.enqueue(key, async () => {
            const chapterIdsForDownloadAhead = getChapterIdsForDownloadAhead(
                currentChapter,
                nextChapter,
                nextChapters,
                pageIndex,
                downloadAheadLimit,
            );

            if (!chapterIdsForDownloadAhead.length) {
                return;
            }

            try {
                await Chapters.download(chapterIdsForDownloadAhead);
            } catch (e) {
                defaultPromiseErrorHandler('ReaderService::useUpdateCurrentPageIndex: download ahead')(e);
            }
        });
    }

    static preloadChapter(
        pageIndex: number,
        pageCount: number,
        chapter: TChapterReader | undefined | null,
        lastLeadingChapterSourceOrder: number,
        lastTrailingChapterSourceOrder: number,
        direction: DirectionOffset,
    ): void {
        if (!chapter) {
            return;
        }

        const isPreviousChapter = direction === DirectionOffset.PREVIOUS;
        const isNextChapter = direction === DirectionOffset.NEXT;

        const isAlreadyPreloaded =
            (isPreviousChapter && lastLeadingChapterSourceOrder <= chapter.sourceOrder) ||
            (isNextChapter && lastTrailingChapterSourceOrder >= chapter.sourceOrder);
        const shouldPreload = !isAlreadyPreloaded && isInDownloadAheadRange(pageIndex, pageCount, direction);
        if (!shouldPreload) {
            return;
        }

        getReaderChaptersStore().setReaderStateChapters((state) =>
            updateReaderStateVisibleChapters(
                isPreviousChapter,
                state,
                chapter.sourceOrder,
                false,
                isPreviousChapter ? true : undefined,
                isNextChapter ? true : undefined,
            ),
        );
    }

    static useUpdateChapter(): (patch: UpdateChapterPatchInput) => void {
        const {
            settings: { deleteChaptersWhileReading, deleteChaptersWithBookmark, updateProgressAfterReading },
        } = useMetadataServerSettings();

        return useCallback(
            (patch) => {
                const { manga } = getReaderStore();
                const { currentChapter, mangaChapters, chapters } = getReaderChaptersStore();
                const { shouldSkipDupChapters } = getReaderSettingsStore();

                if (!manga || !currentChapter || !mangaChapters) {
                    return;
                }

                const previousChapters = Chapters.getNextChapters(currentChapter, chapters, {
                    offset: DirectionOffset.PREVIOUS,
                });

                const update = async () => {
                    const chapterIdsToUpdate = Chapters.getIds(
                        shouldSkipDupChapters
                            ? Chapters.addDuplicates([currentChapter], mangaChapters)
                            : [currentChapter],
                    );

                    const chapterIdsToDelete = getChapterIdsToDeleteForChapterUpdate(
                        currentChapter,
                        mangaChapters,
                        previousChapters,
                        patch,
                        deleteChaptersWhileReading,
                        deleteChaptersWithBookmark,
                        shouldSkipDupChapters,
                    );

                    const isUpdateRequired =
                        !!chapterIdsToDelete.length ||
                        chapterIdsToUpdate.some((id) => {
                            const chapterUpToDateData = getReaderChapterFromCache(id);
                            if (!chapterUpToDateData) {
                                return false;
                            }

                            return (
                                (patch.isRead !== undefined && patch.isRead !== chapterUpToDateData.isRead) ||
                                (patch.lastPageRead !== undefined &&
                                    patch.lastPageRead !== chapterUpToDateData.lastPageRead) ||
                                (patch.isBookmarked !== undefined &&
                                    patch.isBookmarked !== chapterUpToDateData.isBookmarked)
                            );
                        });
                    if (!isUpdateRequired) {
                        return;
                    }

                    await requestManager
                        .updateChapters(
                            chapterIdsToUpdate,
                            {
                                ...patch,
                                chapterIdsToDelete,
                                trackProgressMangaId:
                                    updateProgressAfterReading && patch.isRead && manga.trackRecords.totalCount
                                        ? manga.id
                                        : undefined,
                            },
                            { errorPolicy: 'all' },
                        )
                        .response.catch(defaultPromiseErrorHandler('ReaderService::useUpdateChapter'));
                };

                ReaderService.getOrCreateChapterUpdateQueue(currentChapter.id).enqueue(`${currentChapter.id}`, update);
            },
            [deleteChaptersWhileReading, deleteChaptersWithBookmark, updateProgressAfterReading],
        );
    }

    static useGetThemeDirection(): Direction {
        const { direction } = useTheme();
        const readingDirection = useReaderSettingsStore((state) => state.readingDirection.value);

        return DIRECTION_TO_READING_DIRECTION[direction] === readingDirection
            ? direction
            : DIRECTION_TO_INVERTED[direction];
    }

    /**
     * Updates the setting and updated the current page index accordingly.
     *
     * In case the current page is a spread page, the page index won't get changed.
     *
     * Enable:
     *  Push pages to the left
     *
     *  Page 3+2 -> Page 2+1 - the third page gets pushed to the left, out of the screen
     *
     * Disable:
     *  Push pages to the right
     *
     *  Page 3+2 -> Page 4+3 - the second page gets pushed to the right, out of the screen
     */
    static setOffsetDoubleSpreads(shouldOffset: boolean): void {
        const { pages, currentPageIndex, pageSpreadStates } = getReaderPagesStore();
        const { readingMode } = getReaderSettingsStore();

        const isDoublePageMode = readingMode.value === ReadingMode.DOUBLE_PAGE;
        const isSpreadPage = !!pageSpreadStates[currentPageIndex]?.isSpread;

        const updatePageIndex = isDoublePageMode && !isSpreadPage;
        if (!updatePageIndex) {
            ReaderService.updateSetting('shouldOffsetDoubleSpreads', shouldOffset);
            return;
        }

        const page = getPage(currentPageIndex, pages);
        const updatedPageIndex = shouldOffset ? page.primary.index : currentPageIndex;

        getReaderPagesStore().setCurrentPageIndex(updatedPageIndex);
        ReaderService.updateSetting('shouldOffsetDoubleSpreads', shouldOffset);
    }

    private static getMetadataWithUnmodifiedKey(
        metaHolder: (MangaIdInfo & GqlMetaHolder) | GqlMetaHolder,
        metaHolderType: MetadataHolderType,
        key: string,
        isGlobalSetting: boolean,
    ): Metadata | undefined {
        // Since we update the value in the apollo cache before sending the mutation, we need the actual unmodified value
        // to be able to handle updating chunked metadata
        const unmodifiedOriginalValue =
            MetadataValueCache.getCachedValue(
                metaHolderType,
                isGlobalSetting ? undefined : (metaHolder as MangaIdInfo).id,
                key,
            ) ?? '';

        const currentMetadata = isGlobalSetting
            ? MetadataChunker.getExistingMetadata(metaHolder, metaHolderType)
            : convertFromGqlMeta(metaHolder.meta);

        const settingMetaKeysToDelete = MetadataChunker.computeChunkDeletions(currentMetadata, key, 0);
        const currentMetadataWithoutKey = convertToGqlMeta(currentMetadata)?.filter(
            (meta) => !settingMetaKeysToDelete.includes(meta.key),
        );
        const existingMeta = {
            ...convertFromGqlMeta(currentMetadataWithoutKey),
            ...convertFromGqlMeta(MetadataChunker.chunkValue(key, unmodifiedOriginalValue.toString())),
        };

        return existingMeta;
    }

    /**
     * Writes the change immediately to the cache and sends a mutation in case "commit" is true.
     */
    static updateSetting<Setting extends keyof IReaderSettings>(
        setting: Setting,
        value: IReaderSettings[Setting],
        commit: boolean = true,
        isGlobal: boolean = false,
        profile?: ReadingMode,
    ): void {
        const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
        const metaHolderType = isGlobalSetting ? 'global' : 'manga';

        const { manga: currentManga } = getReaderStore();
        const manga = isGlobalSetting ? GLOBAL_READER_SETTINGS_MANGA : (currentManga ?? FALLBACK_MANGA);

        if (!manga || manga.id === FALLBACK_MANGA.id) {
            return;
        }

        const key = getMetadataKey(setting, profile !== undefined ? [profile?.toString()] : undefined);
        const metaValue = JSON.stringify(value);
        const chunkedMeta = MetadataChunker.chunkValue(key, metaValue);

        const existingMeta = ReaderService.getMetadataWithUnmodifiedKey(manga, metaHolderType, key, isGlobalSetting);

        const keysToDelete = MetadataChunker.computeChunkDeletions(existingMeta, key, chunkedMeta.length - 1);

        const updatedMetadata = convertToGqlMeta({
            ...existingMeta,
            ...convertFromGqlMeta(chunkedMeta),
        })?.filter((meta) => !keysToDelete.includes(meta.key));

        const { cache } = requestManager.graphQLClient.client;

        if (isGlobalSetting) {
            cache.modify({
                fields: {
                    metas(existingMetas) {
                        return {
                            ...existingMetas,
                            nodes: updatedMetadata?.map((meta) =>
                                cache.writeFragment({
                                    fragment: GLOBAL_METADATA,
                                    data: {
                                        __typename: 'GlobalMetaType',
                                        key: meta.key,
                                        value: meta.value,
                                    },
                                }),
                            ),
                        };
                    },
                },
            });
        } else {
            cache.modify({
                id: cache.identify({ __typename: 'MangaType', id: manga.id }),
                fields: {
                    meta() {
                        return updatedMetadata?.map((meta) =>
                            cache.writeFragment({
                                fragment: MANGA_META_FIELDS,
                                data: {
                                    __typename: 'MangaMetaType',
                                    mangaId: manga.id,
                                    key: meta.key,
                                    value: meta.value,
                                },
                            }),
                        );
                    },
                },
            });
        }

        if (commit) {
            getMetadataUpdateFunction(metaHolderType, { id: manga.id, meta: convertFromGqlMeta(updatedMetadata) })({
                update: [[setting, metaValue]],
                delete: keysToDelete as AppMetadataKeys[],
                keyPrefixes: profile !== undefined ? [profile.toString()] : undefined,
            }).catch((e) => {
                makeToast(t`Could not save the reader settings to the server`, 'error', getErrorMessage(e));
            });
        }
    }

    static deleteSetting<Setting extends keyof IReaderSettings>(
        setting: Setting,
        isGlobal: boolean = false,
        profile?: ReadingMode,
    ): void {
        const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
        const metaHolderType = isGlobalSetting ? 'global' : 'manga';

        const { manga: currentManga } = getReaderStore();
        const manga = isGlobalSetting ? GLOBAL_READER_SETTINGS_MANGA : (currentManga ?? FALLBACK_MANGA);

        if (!manga || manga.id === FALLBACK_MANGA.id) {
            return;
        }

        const key = getMetadataKey(setting, profile !== undefined ? [profile?.toString()] : undefined);

        const existingMeta = ReaderService.getMetadataWithUnmodifiedKey(manga, metaHolderType, key, isGlobalSetting);

        const keysToDelete = MetadataChunker.computeChunkDeletions(existingMeta, key, 0);

        const updatedMetadata = convertToGqlMeta(existingMeta)?.filter((meta) => !keysToDelete.includes(meta.key));

        getMetadataUpdateFunction(metaHolderType, { id: manga.id, meta: convertFromGqlMeta(updatedMetadata) })({
            delete: [setting],
            keyPrefixes: profile !== undefined ? [`${profile}`] : undefined,
        }).catch((e) => makeToast(t`Could not save the reader settings to the server`, 'error', getErrorMessage(e)));
    }

    static useOverlayMode(): { mode: ReaderOverlayMode; isDesktop: boolean; isMobile: boolean } {
        const isTouchDevice = MediaQuery.useIsTouchDevice();
        const overlayMode = useReaderSettingsStore('overlayMode');

        const isAutoModeSelected = overlayMode === ReaderOverlayMode.AUTO;
        const isDesktopModeSelected = overlayMode === ReaderOverlayMode.DESKTOP;
        const isMobileModeSelected = overlayMode === ReaderOverlayMode.MOBILE;

        const isDesktop = isDesktopModeSelected || (isAutoModeSelected && !isTouchDevice);
        const isMobile = isMobileModeSelected || (isAutoModeSelected && isTouchDevice);

        return {
            mode: isDesktop ? ReaderOverlayMode.DESKTOP : ReaderOverlayMode.MOBILE,
            isDesktop,
            isMobile,
        };
    }

    static useExit(): () => void {
        const exitMode = useReaderSettingsStore('exitMode');
        const handleBack = useBackButton();
        const navigate = useNavigate();

        const openMangaPage = useCallback(() => {
            const { manga } = getReaderStore();

            if (!manga) {
                return () => {};
            }

            return navigate(AppRoutes.manga.path(manga.id));
        }, []);

        switch (exitMode) {
            case ReaderExitMode.PREVIOUS:
                return handleBack;
            case ReaderExitMode.MANGA:
                return openMangaPage;
            default:
                throw new Error(`Unexpected "exitMode" (${exitMode})`);
        }
    }
}
