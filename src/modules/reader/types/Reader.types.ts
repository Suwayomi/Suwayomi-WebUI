/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TapZoneInvertMode, TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';

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

export enum ReaderPageScaleMode {
    WIDTH,
    HEIGHT,
    SCREEN,
    ORIGINAL,
}

export enum ReaderOverlayMode {
    AUTO,
    DESKTOP,
    MOBILE,
}

export enum ReaderExitMode {
    PREVIOUS,
    MANGA,
}

export enum ReaderBackgroundColor {
    THEME,
    BLACK,
    GRAY,
    WHITE,
}

export interface ReaderFilterRGBA {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface ReaderCustomFilter {
    brightness: {
        /**
         * percentage
         */
        value: number;
        enabled: boolean;
    };
    contrast: {
        /**
         * percentage
         */
        value: number;
        enabled: boolean;
    };
    saturate: {
        /**
         * percentage
         */
        value: number;
        enabled: boolean;
    };
    hue: {
        /**
         * degree
         */
        value: number;
        enabled: boolean;
    };
    rgba: {
        value: ReaderFilterRGBA;
        enabled: boolean;
    };
    sepia: boolean;
    grayscale: boolean;
    invert: boolean;
}

export interface IReaderSettingsGlobal {
    overlayMode: ReaderOverlayMode;
    exitMode: ReaderExitMode;
    customFilter: ReaderCustomFilter;
    shouldSkipDupChapters: boolean;
    progressBarType: ProgressBarType;
    /**
     * pixel
     */
    progressBarSize: number;
    progressBarPosition: ProgressBarPosition;
    shouldShowPageNumber: boolean;
    isStaticNav: boolean;
    backgroundColor: ReaderBackgroundColor;
    profiles: string[];
    readingModesDefaultProfile: Record<ReadingMode, string>;
}

export interface IReaderSettingsManga {
    tapZoneLayout: TapZoneLayouts;
    tapZoneInvertMode: TapZoneInvertMode;
    pageScaleMode: ReaderPageScaleMode;
    shouldStretchPage: boolean;
    shouldOffsetDoubleSpreads: boolean;
    readingDirection: ReadingDirection;
    readingMode: ReadingMode;
    /**
     * pixel
     */
    pageGap: number;
    readerWidth: {
        /**
         * percentage
         */
        value: number;
        enabled: boolean;
    };
    defaultProfile: string;
}

export interface IReaderSettings extends IReaderSettingsGlobal, IReaderSettingsManga {}

export interface IReaderSettingsWithDefaultFlag
    extends IReaderSettingsGlobal,
        TransformRecordToWithDefaultFlag<IReaderSettingsManga> {}

export interface ReaderStateChapters {
    chapters: TChapterReader[];
    currentChapter?: TChapterReader | null;
    nextChapter?: TChapterReader;
    previousChapter?: TChapterReader;
    setReaderStateChapters: React.Dispatch<React.SetStateAction<Omit<ReaderStateChapters, 'setReaderStateChapters'>>>;
}

interface ReaderSettingsTypeBaseProps {
    settings: IReaderSettingsWithDefaultFlag;
    updateSetting: (
        ...args: OmitFirst<Parameters<typeof ReaderService.updateSetting>>
    ) => ReturnType<typeof ReaderService.updateSetting>;
}

export interface ReaderSettingsDefaultableProps {
    isDefaultable: boolean;
    onDefault: (setting: keyof IReaderSettings) => void;
}

interface ReaderSettingsTypeDefaultableProps extends ReaderSettingsTypeBaseProps, ReaderSettingsDefaultableProps {
    isDefaultable: true;
}

interface ReaderSettingsTypeNonDefaultableProps extends ReaderSettingsTypeBaseProps {}

export type ReaderSettingsTypeProps =
    | ReaderSettingsTypeDefaultableProps
    | (PropertiesNever<Omit<ReaderSettingsTypeDefaultableProps, keyof ReaderSettingsTypeBaseProps>> &
          ReaderSettingsTypeNonDefaultableProps);
