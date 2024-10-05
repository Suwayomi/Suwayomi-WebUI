/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { NullAndUndefined } from '@/Base.types.ts';

export type ChapterSortMode = 'fetchedAt' | 'source' | 'chapterNumber' | 'uploadedAt';

export interface ChapterListOptions {
    active: boolean;
    unread: NullAndUndefined<boolean>;
    downloaded: NullAndUndefined<boolean>;
    bookmarked: NullAndUndefined<boolean>;
    reverse: boolean;
    sortBy: ChapterSortMode;
    showChapterNumber: boolean;
}

export type ChapterOptionsReducerAction =
    | { type: 'filter'; filterType: string; filterValue: NullAndUndefined<boolean> }
    | { type: 'sortBy'; sortBy: ChapterSortMode }
    | { type: 'sortReverse' }
    | { type: 'showChapterNumber' };
