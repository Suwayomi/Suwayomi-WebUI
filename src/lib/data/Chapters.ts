/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TChapter } from '@/typings.ts';

type ChapterDownloadInfo = Pick<TChapter, 'isDownloaded'>;
type ChapterBookmarkInfo = Pick<TChapter, 'isBookmarked'>;

export class Chapters {
    static getIds(chapters: { id: number }[]): number[] {
        return chapters.map((chapter) => chapter.id);
    }

    static isDeletable({ isDownloaded }: ChapterDownloadInfo): boolean {
        return isDownloaded;
    }

    static isAutoDeletable(
        { isBookmarked, ...chapter }: ChapterDownloadInfo & ChapterBookmarkInfo,
        canDeleteBookmarked: boolean = false,
    ): boolean {
        return Chapters.isDeletable(chapter) && (!isBookmarked || canDeleteBookmarked);
    }

    static getAutoDeletable<Chapters extends ChapterDownloadInfo & ChapterBookmarkInfo>(
        chapters: Chapters[],
        canDeleteBookmarked?: boolean,
    ): Chapters[] {
        return chapters.filter((chapter) => Chapters.isAutoDeletable(chapter, canDeleteBookmarked));
    }
}
