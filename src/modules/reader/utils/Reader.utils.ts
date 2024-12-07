/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReaderResumeMode } from '@/modules/reader/types/Reader.types.ts';
import { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { ChapterIdInfo, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { CHAPTER_READER_FIELDS } from '@/lib/graphql/fragments/ChapterFragments.ts';

export const getInitialReaderPageIndex = (
    resumeMode: ReaderResumeMode,
    lastReadPageIndex: number,
    lastPageIndex: number,
): number => {
    if (resumeMode === ReaderResumeMode.START) {
        return 0;
    }

    if (resumeMode === ReaderResumeMode.END) {
        return lastPageIndex;
    }

    return Math.max(0, Math.min(lastPageIndex, lastReadPageIndex));
};

export const getReaderChapterFromCache = (id: ChapterIdInfo['id']): TChapterReader | null =>
    Chapters.getFromCache<TChapterReader>(id, CHAPTER_READER_FIELDS, 'CHAPTER_READER_FIELDS')!;

export const getChapterIdsToDeleteForChapterUpdate = (
    chapter: TChapterReader,
    chapters: TChapterReader[],
    previousChapters: TChapterReader[],
    patch: UpdateChapterPatchInput,
    deleteChaptersWhileReading: number,
    deleteChaptersWithBookmark: boolean,
    shouldSkipDupChapters: boolean,
): TChapterReader['id'][] => {
    const isAutoDeletionEnabled = !!patch.isRead && !!deleteChaptersWhileReading;
    if (!isAutoDeletionEnabled) {
        return [];
    }

    const chapterToDelete = [chapter, ...previousChapters][deleteChaptersWhileReading - 1];
    if (!chapterToDelete) {
        return [];
    }

    const chapterToDeleteUpToDateData = getReaderChapterFromCache(chapterToDelete.id);
    if (!chapterToDeleteUpToDateData) {
        return [];
    }

    const shouldDeleteChapter =
        chapterToDeleteUpToDateData.isRead &&
        Chapters.isDeletable(chapterToDeleteUpToDateData, deleteChaptersWithBookmark);
    if (!shouldDeleteChapter) {
        return [];
    }

    if (!shouldSkipDupChapters) {
        return Chapters.getIds([chapterToDelete]);
    }

    return Chapters.getIds(Chapters.addDuplicates([chapterToDelete], chapters));
};

export const getChapterIdsForDownloadAhead = (
    chapter: TChapterReader,
    nextChapter: TChapterReader | undefined,
    nextChapters: TChapterReader[],
    currentPageIndex: number,
    downloadAheadLimit: number,
): TChapterReader['id'][] => {
    const chapterUpToDateData = getReaderChapterFromCache(chapter.id);
    if (!chapterUpToDateData || !nextChapter) {
        return [];
    }

    const isDownloadAheadEnabled = !!downloadAheadLimit;
    const inDownloadRange = currentPageIndex / chapterUpToDateData.pageCount > 0.25;
    const shouldCheckDownloadAhead = isDownloadAheadEnabled && chapterUpToDateData.isDownloaded && inDownloadRange;
    if (!shouldCheckDownloadAhead) {
        return [];
    }

    const nextChapterUpToDateData = getReaderChapterFromCache(nextChapter.id);

    if (!nextChapterUpToDateData?.isDownloaded) {
        return [];
    }

    const unreadNextChaptersUpToDateData = Chapters.getNonRead(nextChapters)
        .map((unreadNextChapter) => getReaderChapterFromCache(unreadNextChapter.id))
        .filter((unreadNextChapterUpToDateData) => !!unreadNextChapterUpToDateData);

    return unreadNextChaptersUpToDateData
        .slice(-downloadAheadLimit)
        .filter((unreadNextChapter) => !unreadNextChapter.isDownloaded)
        .map((unreadUnDownloadedNextChapter) => unreadUnDownloadedNextChapter.id)
        .filter((id) => !Chapters.isDownloading(id));
};
