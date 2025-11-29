/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetChaptersReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import {
    IReaderSettings,
    ReaderOpenChapterLocationState,
    ReaderStateChapters,
} from '@/features/reader/Reader.types.ts';
import { filterChapters } from '@/features/chapter/utils/ChapterList.util.tsx';
import { ChapterListOptions } from '@/features/chapter/Chapter.types.ts';
import { getReaderChapterFromCache } from '@/features/reader/Reader.utils.ts';
import { DirectionOffset } from '@/base/Base.types.ts';
import { getReaderChaptersStore } from '@/features/reader/stores/ReaderStore.ts';

import { READER_DEFAULT_CHAPTERS_STATE } from '@/features/reader/stores/ReaderChaptersStore.ts';

export const useReaderSetChaptersState = (
    chaptersResponse: ReturnType<typeof requestManager.useGetMangaChapters<GetChaptersReaderQuery>>,
    chapterSourceOrder: number,
    mangaChapters: ReaderStateChapters['mangaChapters'],
    initialChapter: ReaderStateChapters['initialChapter'],
    chapterForDuplicatesHandling: ReaderStateChapters['chapterForDuplicatesHandling'],
    shouldSkipDupChapters: IReaderSettings['shouldSkipDupChapters'],
    shouldSkipFilteredChapters: IReaderSettings['shouldSkipFilteredChapters'],
    chapterListOptions: ChapterListOptions,
) => {
    const navigate = useNavigate();
    const locationState = useLocation<ReaderOpenChapterLocationState>().state;

    const { updateInitialChapter } = locationState ?? {};
    const finalInitialChapter = updateInitialChapter ? undefined : initialChapter;

    const newMangaChapters = chaptersResponse.data?.chapters.nodes;
    const newCurrentChapter = useMemo(
        () => (newMangaChapters ? (newMangaChapters[newMangaChapters.length - chapterSourceOrder] ?? null) : undefined),
        [newMangaChapters, chapterSourceOrder],
    );
    const newInitialChapter = finalInitialChapter ?? newCurrentChapter;
    const newChapterForDuplicatesHandling = chapterForDuplicatesHandling ?? newCurrentChapter;

    const filteredChapters = useMemo(() => {
        if (!newMangaChapters) {
            return newMangaChapters;
        }

        return shouldSkipFilteredChapters
            ? filterChapters(mangaChapters ?? newMangaChapters, chapterListOptions)
            : newMangaChapters;
    }, [newMangaChapters, shouldSkipFilteredChapters, mangaChapters, chapterListOptions]);

    const uniqueChapters = useMemo(() => {
        if (!filteredChapters || !newChapterForDuplicatesHandling) {
            return filteredChapters;
        }

        return shouldSkipDupChapters
            ? Chapters.removeDuplicates(newChapterForDuplicatesHandling, filteredChapters)
            : filteredChapters;
    }, [filteredChapters, shouldSkipDupChapters, newChapterForDuplicatesHandling]);

    const visibleChapters = useMemo(() => {
        if (!uniqueChapters) {
            return [];
        }

        return uniqueChapters.map((chapter) => getReaderChapterFromCache(chapter.id)!);
    }, [uniqueChapters]);

    const prevVisibleChaptersRef = useRef<typeof visibleChapters>([]);

    useEffect(() => {
        // Check if visibleChapters actually changed by comparing chapter IDs
        const hasChaptersChanged =
            visibleChapters.length !== prevVisibleChaptersRef.current.length ||
            visibleChapters.some((chapter, index) => chapter.id !== prevVisibleChaptersRef.current[index]?.id);

        // Use the previous reference if chapters haven't actually changed
        const stableVisibleChapters = hasChaptersChanged ? visibleChapters : prevVisibleChaptersRef.current;

        // Update the ref for next comparison
        if (hasChaptersChanged) {
            prevVisibleChaptersRef.current = visibleChapters;
        }

        const nextChapter =
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, stableVisibleChapters, {
                offset: DirectionOffset.NEXT,
            });
        const previousChapter =
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, stableVisibleChapters, {
                offset: DirectionOffset.PREVIOUS,
            });

        const hasInitialChapterChanged = newInitialChapter != null && newInitialChapter.id !== finalInitialChapter?.id;

        if (hasInitialChapterChanged) {
            navigate('', { replace: true, state: { ...locationState, updateInitialChapter: undefined } });
        }

        getReaderChaptersStore().setReaderStateChapters((prevState) => {
            const hasCurrentChapterChanged = newCurrentChapter?.id !== prevState.currentChapter?.id;

            return {
                ...prevState,
                mangaChapters: prevState.mangaChapters ?? newMangaChapters,
                chapters: stableVisibleChapters,
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
        visibleChapters,
        newCurrentChapter,
        newInitialChapter,
        finalInitialChapter,
        newMangaChapters,
        newChapterForDuplicatesHandling,
        locationState,
    ]);
};
