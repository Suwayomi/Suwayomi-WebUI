/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset } from '@/Base.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetChaptersReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import { IReaderSettings, ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';
import { READER_STATE_CHAPTERS_DEFAULTS } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';

export const useReaderSetChaptersState = (
    chaptersResponse: ReturnType<typeof requestManager.useGetMangaChapters<GetChaptersReaderQuery>>,
    chapterSourceOrder: number,
    initialChapter: ReaderStateChapters['initialChapter'],
    chapterForDuplicatesHandling: ReaderStateChapters['chapterForDuplicatesHandling'],
    setReaderStateChapters: ReaderStateChapters['setReaderStateChapters'],
    shouldSkipDupChapters: IReaderSettings['shouldSkipDupChapters'],
) => {
    useEffect(() => {
        const newMangaChapters = chaptersResponse.data?.chapters.nodes;
        const newCurrentChapter = newMangaChapters
            ? (newMangaChapters[newMangaChapters.length - chapterSourceOrder] ?? null)
            : undefined;
        const newInitialChapter = initialChapter ?? newCurrentChapter;
        const newChapterForDuplicatesHandling = chapterForDuplicatesHandling ?? newCurrentChapter;

        const nextChapter =
            newMangaChapters &&
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                offset: DirectionOffset.NEXT,
                skipDupe: shouldSkipDupChapters,
                skipDupeChapter: newChapterForDuplicatesHandling,
            });
        const previousChapter =
            newMangaChapters &&
            newCurrentChapter &&
            Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                offset: DirectionOffset.PREVIOUS,
                skipDupe: shouldSkipDupChapters,
                skipDupeChapter: newChapterForDuplicatesHandling,
            });
        const newChapters = (() => {
            if (!newMangaChapters || !newChapterForDuplicatesHandling) {
                return [];
            }

            if (shouldSkipDupChapters) {
                return Chapters.removeDuplicates(newChapterForDuplicatesHandling, newMangaChapters);
            }

            return newMangaChapters;
        })();

        const hasInitialChapterChanged = newInitialChapter != null && newInitialChapter.id !== initialChapter?.id;

        setReaderStateChapters((prevState) => {
            const hasCurrentChapterChanged = newCurrentChapter?.id !== prevState.currentChapter?.id;
            return {
                ...prevState,
                mangaChapters: newMangaChapters ?? [],
                chapters: newChapters,
                initialChapter: newInitialChapter,
                chapterForDuplicatesHandling: newChapterForDuplicatesHandling,
                currentChapter: newCurrentChapter,
                nextChapter,
                previousChapter,
                isCurrentChapterReady: hasCurrentChapterChanged ? false : prevState.isCurrentChapterReady,
                visibleChapters: hasInitialChapterChanged
                    ? {
                          ...READER_STATE_CHAPTERS_DEFAULTS.visibleChapters,
                          lastLeadingChapterSourceOrder:
                              newInitialChapter?.sourceOrder ??
                              READER_STATE_CHAPTERS_DEFAULTS.visibleChapters.lastLeadingChapterSourceOrder,
                          lastTrailingChapterSourceOrder:
                              newInitialChapter?.sourceOrder ??
                              READER_STATE_CHAPTERS_DEFAULTS.visibleChapters.lastTrailingChapterSourceOrder,
                      }
                    : prevState.visibleChapters,
            };
        });
    }, [chaptersResponse.data?.chapters.nodes, chapterSourceOrder, shouldSkipDupChapters, initialChapter]);
};
