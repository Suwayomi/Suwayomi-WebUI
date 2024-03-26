/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TChapter } from '@/typings.ts';
import { DownloadType } from '@/lib/graphql/generated/graphql.ts';
import { Chapters } from '@/lib/data/Chapters.ts';

export type ChapterWithMetaType = {
    chapter: TChapter;
    downloadChapter: DownloadType | undefined;
};

export class ChaptersWithMeta {
    static getChapters(chapters: ChapterWithMetaType[]): TChapter[] {
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

    static getDownloadable<Chapter extends ChapterWithMetaType>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(({ chapter, downloadChapter }) => !Chapters.isDownloaded(chapter) && !downloadChapter);
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
