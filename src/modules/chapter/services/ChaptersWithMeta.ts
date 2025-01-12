/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterDownloadStatus,
    ChapterReadInfo,
    Chapters,
} from '@/modules/chapter/services/Chapters.ts';
import { DownloadState } from '@/lib/graphql/generated/graphql.ts';

export type ChapterWithMetaType<
    Chapter extends ChapterDownloadInfo & ChapterReadInfo & ChapterBookmarkInfo = ChapterDownloadInfo &
        ChapterReadInfo &
        ChapterBookmarkInfo,
> = {
    chapter: Chapter;
    downloadChapter: ChapterDownloadStatus | undefined | null;
};

export class ChaptersWithMeta {
    static getChapters<ChaptersWithMeta extends ChapterWithMetaType>(
        chapters: ChaptersWithMeta[],
    ): ChaptersWithMeta['chapter'][] {
        return chapters.map(({ chapter }) => chapter);
    }

    static getIds(chapters: ChapterWithMetaType[]): number[] {
        return Chapters.getIds(ChaptersWithMeta.getChapters(chapters));
    }

    static getDownloaded<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => Chapters.isDownloaded(chapter));
    }

    static getDeletable<Chapter extends ChapterWithMetaType>(
        chapters: Chapter[],
        canDeleteBookmarked?: boolean,
    ): Chapter[] {
        return chapters.filter(({ chapter }) => Chapters.isDeletable(chapter, canDeleteBookmarked));
    }

    static getNonDownloaded<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => !Chapters.isDownloaded(chapter));
    }

    static isDownloadable<Chapter extends ChapterWithMetaType>({ chapter, downloadChapter }: Chapter): boolean {
        return !Chapters.isDownloaded(chapter) && (!downloadChapter || downloadChapter?.state === DownloadState.Error);
    }

    static getDownloadable<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(this.isDownloadable);
    }

    static getBookmarked<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => Chapters.isBookmarked(chapter));
    }

    static getNonBookmarked<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => !Chapters.isBookmarked(chapter));
    }

    static getRead<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => Chapters.isRead(chapter));
    }

    static getNonRead<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter }) => !Chapters.isRead(chapter));
    }
}
