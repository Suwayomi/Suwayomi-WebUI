/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentType, MemoExoticComponent } from 'react';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ProgressBarPosition,
    ProgressBarPositionAutoVertical,
    ReaderPagerProps,
    ReaderPageScaleMode,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { MangaGenreInfo, MangaSourceNameInfo } from '@/modules/manga/Manga.types.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { ReaderPagedPager } from '@/modules/reader/components/viewer/pager/ReaderPagedPager.tsx';
import { ReaderDoublePagedPager } from '@/modules/reader/components/viewer/pager/ReaderDoublePagedPager.tsx';
import { ReaderVerticalPager } from '@/modules/reader/components/viewer/pager/ReaderVerticalPager.tsx';
import { ReaderHorizontalPager } from '@/modules/reader/components/viewer/pager/ReaderHorizontalPager.tsx';

export const isOffsetDoubleSpreadPagesEditable = (readingMode: IReaderSettings['readingMode']): boolean =>
    readingMode === ReadingMode.DOUBLE_PAGE;

export const isReaderWidthEditable = (pageScaleMode: IReaderSettings['pageScaleMode']): boolean =>
    [ReaderPageScaleMode.WIDTH, ReaderPageScaleMode.SCREEN].includes(pageScaleMode);

export const shouldApplyReaderWidth = (
    readerWidth: IReaderSettings['readerWidth'] | undefined,
    pageScaleMode: IReaderSettings['pageScaleMode'],
): boolean => !!readerWidth?.enabled && isReaderWidthEditable(pageScaleMode);

export const getSetReaderWidth = (
    readerWidth: IReaderSettings['readerWidth'] | undefined,
    pageScaleMode: IReaderSettings['pageScaleMode'],
): number | undefined => {
    if (!shouldApplyReaderWidth(readerWidth, pageScaleMode)) {
        return undefined;
    }

    return readerWidth?.value;
};

export const isContinuousReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.CONTINUOUS_HORIZONTAL, ReadingMode.WEBTOON].includes(readingMode);

export const isContinuousVerticalReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.WEBTOON].includes(readingMode);

export const isAutoWebtoonMode = (
    manga: MangaGenreInfo & MangaSourceNameInfo,
    shouldUseAutoWebtoonMode: IReaderSettings['shouldUseAutoWebtoonMode'],
    readingMode: IReaderSettingsWithDefaultFlag['readingMode'],
): boolean => shouldUseAutoWebtoonMode && readingMode.isDefault && Mangas.isLongStripType(manga);

export const getPagerForReadingMode = (
    readingMode: ReadingMode,
): MemoExoticComponent<ComponentType<ReaderPagerProps>> => {
    switch (readingMode) {
        case ReadingMode.SINGLE_PAGE:
            return ReaderPagedPager;
        case ReadingMode.DOUBLE_PAGE:
            return ReaderDoublePagedPager;
        case ReadingMode.CONTINUOUS_VERTICAL:
        case ReadingMode.WEBTOON:
            return ReaderVerticalPager;
        case ReadingMode.CONTINUOUS_HORIZONTAL:
            return ReaderHorizontalPager;
        default:
            throw new Error(`Unexpected "ReadingMode" (${readingMode})`);
    }
};

export const getProgressBarPosition = (
    progressBarPosition: ProgressBarPosition,
    progressBarPositionAutoVertical: keyof typeof ProgressBarPositionAutoVertical,
    offsetY: number = 0,
    offsetX: number = 0,
): Exclude<ProgressBarPosition, ProgressBarPosition.AUTO> => {
    if (progressBarPosition !== ProgressBarPosition.AUTO) {
        return progressBarPosition;
    }

    const isVerticalSpaceLarger = window.innerHeight - offsetY > window.innerWidth - offsetX;

    if (isVerticalSpaceLarger) {
        return progressBarPositionAutoVertical;
    }

    return ProgressBarPosition.BOTTOM;
};
