/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TranslationKey } from '@/Base.types.ts';
import { ChapterListOptions, ChapterSortMode } from '@/modules/chapter/Chapter.types.ts';

export const DEFAULT_CHAPTER_OPTIONS: ChapterListOptions = {
    active: false,
    unread: undefined,
    downloaded: undefined,
    bookmarked: undefined,
    reverse: true,
    sortBy: 'source',
    showChapterNumber: false,
};

export const CHAPTER_SORT_OPTIONS_TO_TRANSLATION_KEY: Record<ChapterSortMode, TranslationKey> = {
    source: 'global.sort.label.by_source',
    chapterNumber: 'global.sort.label.by_chapter_number',
    uploadedAt: 'global.sort.label.by_upload_date',
    fetchedAt: 'global.sort.label.by_fetch_date',
};
