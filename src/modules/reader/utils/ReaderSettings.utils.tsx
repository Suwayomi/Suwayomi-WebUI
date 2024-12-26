/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderPageScaleMode,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { MangaGenreInfo, MangaSourceNameInfo } from '@/modules/manga/Manga.types.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';

export const isOffsetDoubleSpreadPagesEditable = (readingMode: IReaderSettings['readingMode']): boolean =>
    readingMode === ReadingMode.DOUBLE_PAGE;

export const isReaderWidthEditable = (pageScaleMode: IReaderSettings['pageScaleMode']): boolean =>
    [ReaderPageScaleMode.WIDTH, ReaderPageScaleMode.SCREEN].includes(pageScaleMode);

export const isContinuousReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.CONTINUOUS_HORIZONTAL, ReadingMode.WEBTOON].includes(readingMode);

export const isContinuousVerticalReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.WEBTOON].includes(readingMode);

export const isAutoWebtoonMode = (
    manga: MangaGenreInfo & MangaSourceNameInfo,
    shouldUseAutoWebtoonMode: IReaderSettings['shouldUseAutoWebtoonMode'],
    readingMode: IReaderSettingsWithDefaultFlag['readingMode'],
): boolean => shouldUseAutoWebtoonMode && readingMode.isDefault && Mangas.isLongStripType(manga);
