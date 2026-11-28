/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chapters } from '@/controllers/chapter/services/Chapters.ts';
import type { requestManager } from '@/lib/requests/RequestManager.ts';
import type { GetChaptersReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import type { IReaderSettings, RouteStateReader, ReaderStateChapters } from '@/models/reader/Reader.types.ts';
import { filterChapters } from '@/utils/chapter/ChapterList.util.tsx';
import type { ChapterListFilterOptions } from '@/models/chapter/Chapter.types.ts';
import { getReaderChapterFromCache } from '@/utils/reader/Reader.utils.ts';
import { DirectionOffset } from '@/models/base/Base.types.ts';
import { getReaderChaptersStore } from '@/controllers/reader/stores/ReaderStore.ts';
import { STABLE_EMPTY_OBJECT } from '@/models/base/Base.constants.ts';

import { READER_DEFAULT_CHAPTERS_STATE } from '@/controllers/reader/stores/ReaderChaptersStore.ts';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';

export const useReaderSetChaptersState = (
    chaptersResponse: ReturnType<typeof requestManager.useGetMangaChapters<GetChaptersReaderQuery>>,
    chapterSourceOrder: number,
    mangaChapters: ReaderStateChapters['mangaChapters'],
    initialChapter: ReaderStateChapters['initialChapter'],
    chapterForDuplicatesHandling: ReaderStateChapters['chapterForDuplicatesHandling'],
    shouldSkipDupChapters: IReaderSettings['shouldSkipDupChapters'],
    shouldSkipFilteredChapters: IReaderSettings['shouldSkipFilteredChapters'],
    chapterListOptions: ChapterListFilterOptions,
) => {
    const navigate = useNavigate();
    const locationState = useLocation<RouteStateReader>().state;

    const { updateInitialChapter } = locationState ?? STABLE_EMPTY_OBJECT;
    const finalInitialChapter = updateInitialChapter ? undefined : initialChapter;

    useEffect(() => {
        const newMangaChapters = chaptersResponse.data?.chapters.nodes;
        const newCurrentChapter = newMangaChapters
            ? (newMangaChapters[newMangaChapters.length - chapterSourceOrder] ?? null)
            : undefined;
        const newInitialChapter = finalInitialChapter ?? newCurrentChapter;
        const newChapterForDuplicatesHandling = chapterForDuplicatesHandling ?? newCurrentChapter;

        const visibleChapters = (() => {
            if (!newMangaChapters || !newChapterForDuplicatesHandling) {
                return [];
            }

            const filteredChapters = shouldSkipFilteredChapters
                ? filterChapters(mangaChapters ?? newMangaChapters, chapterListOptions)
                : newMangaChapters;
            const uniqueChapters = shouldSkipDupChapters
                ? Chapters.removeDuplicates(newChapterForDuplicatesHandling, filteredChapters)
                : filteredChapters;

            return uniqueChapters.map((chapter) => getReaderChapterFromCache(chapter.id)!);
        })();
        const nextChapter =
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, visibleChapters, {
                offset: DirectionOffset.NEXT,
            });
        const previousChapter =
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, visibleChapters, {
                offset: DirectionOffset.PREVIOUS,
            });

        const hasInitialChapterChanged = newInitialChapter != null && newInitialChapter.id !== finalInitialChapter?.id;

        if (hasInitialChapterChanged) {
            navigate('', {
                replace: true,
                state: { ...locationState, ...AppRoutes.reader.state({ updateInitialChapter: undefined }) },
            });
        }

        getReaderChaptersStore().setReaderStateChapters((prevState) => {
            const hasCurrentChapterChanged = newCurrentChapter?.id !== prevState.currentChapter?.id;

            return {
                ...prevState,
                mangaChapters: prevState.mangaChapters ?? newMangaChapters,
                chapters: visibleChapters,
                initialChapter: newInitialChapter,
                chapterForDuplicatesHandling: newChapterForDuplicatesHandling,
                currentChapter: newCurrentChapter,
                nextChapter,
                previousChapter,
                isCurrentChapterReady: hasCurrentChapterChanged ? false : prevState.isCurrentChapterReady,
                visibleChapters: hasInitialChapterChanged
                    ? {
                          ...READER_DEFAULT_CHAPTERS_STATE.chapters.visibleChapters,
                          lastLeadingChapterSourceOrder:
                              newInitialChapter?.sourceOrder ??
                              READER_DEFAULT_CHAPTERS_STATE.chapters.visibleChapters.lastLeadingChapterSourceOrder,
                          lastTrailingChapterSourceOrder:
                              newInitialChapter?.sourceOrder ??
                              READER_DEFAULT_CHAPTERS_STATE.chapters.visibleChapters.lastTrailingChapterSourceOrder,
                          isLeadingChapterPreloadMode: false,
                          isTrailingChapterPreloadMode: false,
                          // do not set "scrollIntoView" to "true" for the initial render
                          scrollIntoView: !!prevState.initialChapter,
                      }
                    : prevState.visibleChapters,
            };
        });
    }, [
        chaptersResponse.data?.chapters.nodes,
        chapterSourceOrder,
        shouldSkipDupChapters,
        shouldSkipFilteredChapters,
        finalInitialChapter,
        chapterListOptions,
    ]);
};
