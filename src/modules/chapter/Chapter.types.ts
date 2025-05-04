/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { NullAndUndefined } from '@/Base.types.ts';
import {
    ChapterReaderFieldsFragment,
    ChapterType,
    DownloadStatusFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';

export type ChapterSortMode = 'fetchedAt' | 'source' | 'chapterNumber' | 'uploadedAt';

export interface ChapterListOptions {
    unread: NullAndUndefined<boolean>;
    downloaded: NullAndUndefined<boolean>;
    bookmarked: NullAndUndefined<boolean>;
    reverse: boolean;
    sortBy: ChapterSortMode;
    showChapterNumber: boolean;
}

export type TChapterReader = ChapterReaderFieldsFragment;

export type ChapterAction = 'download' | 'delete' | 'bookmark' | 'unbookmark' | 'mark_as_read' | 'mark_as_unread';

export type ChapterDownloadStatus = DownloadStatusFieldsFragment['queue'][number];

export type ChapterIdInfo = Pick<ChapterType, 'id'>;

export type ChapterMangaInfo = Pick<ChapterType, 'mangaId'>;

export type ChapterDownloadInfo = ChapterIdInfo & Pick<ChapterType, 'isDownloaded'>;

export type ChapterBookmarkInfo = ChapterIdInfo & Pick<ChapterType, 'isBookmarked'>;

export type ChapterReadInfo = ChapterIdInfo & Pick<ChapterType, 'isRead'>;

export type ChapterNumberInfo = ChapterIdInfo & Pick<ChapterType, 'chapterNumber'>;

export type ChapterSourceOrderInfo = ChapterIdInfo & Pick<ChapterType, 'sourceOrder'>;

export type ChapterScanlatorInfo = ChapterIdInfo & Pick<ChapterType, 'scanlator'>;

export type ChapterRealUrlInfo = Pick<ChapterType, 'realUrl'>;
