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

export const useReaderSetChaptersState = (
    chaptersResponse: ReturnType<typeof requestManager.useGetMangaChapters<GetChaptersReaderQuery>>,
    chapterSourceOrder: number,
    initialChapter: ReaderStateChapters['initialChapter'],
    setReaderStateChapters: ReaderStateChapters['setReaderStateChapters'],
    shouldSkipDupChapters: IReaderSettings['shouldSkipDupChapters'],
) => {
    useEffect(() => {
        const newMangaChapters = chaptersResponse.data?.chapters.nodes;
        const newCurrentChapter = newMangaChapters
            ? (newMangaChapters[newMangaChapters.length - chapterSourceOrder] ?? null)
            : undefined;
        const newInitialChapter = initialChapter ?? newCurrentChapter;

        setReaderStateChapters({
            mangaChapters: newMangaChapters ?? [],
            chapters:
                newInitialChapter && newMangaChapters
                    ? Chapters.removeDuplicates(newInitialChapter, newMangaChapters)
                    : [],
            initialChapter: newInitialChapter,
            currentChapter: newCurrentChapter,
            nextChapter:
                newMangaChapters &&
                newCurrentChapter &&
                Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                    offset: DirectionOffset.NEXT,
                    skipDupe: shouldSkipDupChapters,
                    skipDupeChapter: newInitialChapter,
                }),
            previousChapter:
                newMangaChapters &&
                newCurrentChapter &&
                Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                    offset: DirectionOffset.PREVIOUS,
                    skipDupe: shouldSkipDupChapters,
                    skipDupeChapter: newInitialChapter,
                }),
        });
    }, [chaptersResponse.data?.chapters.nodes, chapterSourceOrder, shouldSkipDupChapters]);
};
