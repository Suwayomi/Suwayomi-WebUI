/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TapZoneInvertMode, TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';

export enum ProgressBarType {
    HIDDEN,
    STANDARD,
}

export enum ProgressBarPosition {
    BOTTOM,
    LEFT,
    RIGHT,
}

export enum ReadingDirection {
    LTR,
    RTL,
}

export enum ReadingMode {
    SINGLE_PAGE,
    DOUBLE_PAGE,
    CONTINUOUS_VERTICAL,
    CONTINUOUS_HORIZONTAL,
}

export interface ReaderStateChapters {
    chapters: TChapterReader[];
    currentChapter?: TChapterReader | null;
    nextChapter?: TChapterReader;
    previousChapter?: TChapterReader;
    setReaderStateChapters: React.Dispatch<React.SetStateAction<Omit<ReaderStateChapters, 'setReaderStateChapters'>>>;
}

export interface IReaderSettings {
    staticNav: boolean;
    showPageNumber: boolean;
    loadNextOnEnding: boolean;
    skipDupChapters: boolean;
    fitPageToWindow: boolean;
    scalePage: boolean;
    offsetFirstPage: boolean;
    readerWidth: number;
    tapZoneLayout: TapZoneLayouts;
    tapZoneInvertMode: TapZoneInvertMode;
    progressBarType: ProgressBarType;
    progressBarSize: number;
    progressBarPosition: ProgressBarPosition;
    readingDirection: ReadingDirection;
    readingMode: ReadingMode;
}
