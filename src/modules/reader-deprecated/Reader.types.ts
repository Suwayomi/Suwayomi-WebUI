/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { GetChaptersReaderQuery, MangaReaderFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

export type ReaderType =
    | 'ContinuesVertical'
    | 'Webtoon'
    | 'SingleVertical'
    | 'SingleRTL'
    | 'SingleLTR'
    | 'DoubleVertical'
    | 'DoubleRTL'
    | 'DoubleLTR'
    | 'ContinuesHorizontalLTR'
    | 'ContinuesHorizontalRTL';

export enum ProgressBarType {
    HIDDEN,
    STANDARD,
}

export enum ProgressBarPosition {
    BOTTOM,
    LEFT,
    RIGHT,
}

export interface IReaderSettings {
    staticNav: boolean;
    showPageNumber: boolean;
    loadNextOnEnding: boolean;
    skipDupChapters: boolean;
    fitPageToWindow: boolean;
    scalePage: boolean;
    readerType: ReaderType;
    offsetFirstPage: boolean;
    readerWidth: number;
    tapZoneLayout: TapZoneLayouts;
    progressBarType: ProgressBarType;
    progressBarSize: number;
    progressBarPosition: ProgressBarPosition;
}

export type UndefinedReaderSettings = {
    [setting in keyof IReaderSettings]: IReaderSettings[setting] | undefined;
};

export interface IReaderPage {
    index: number;
    src: string;
}

export interface IReaderProps {
    pages: Array<IReaderPage>;
    pageCount: number;
    setCurPage: React.Dispatch<React.SetStateAction<number>>;
    curPage: number;
    initialPage: number;
    settings: IReaderSettings;
    manga: MangaReaderFieldsFragment;
    chapter: GetChaptersReaderQuery['chapters']['nodes'][number];
    nextChapter: () => void;
    prevChapter: () => void;
}
