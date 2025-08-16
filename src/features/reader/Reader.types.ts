/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject } from 'react';
import { TapZoneInvertMode, TapZoneLayouts } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';
import { TChapterReader } from '@/features/chapter/Chapter.types.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { TMangaReader } from '@/features/manga/Manga.types.ts';
import { useAutomaticScrolling } from '@/base/hooks/useAutomaticScrolling.ts';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { ScrollOffset } from '@/base/Base.types.ts';

export enum ProgressBarType {
    HIDDEN,
    STANDARD,
}

export enum ProgressBarPosition {
    AUTO,
    BOTTOM,
    LEFT,
    RIGHT,
}

type TProgressBarPositionAutoVertical = Exclude<
    ProgressBarPosition,
    ProgressBarPosition.BOTTOM | ProgressBarPosition.AUTO
>;
export const ProgressBarPositionAutoVertical = {
    [ProgressBarPosition.LEFT]: ProgressBarPosition.LEFT,
    [ProgressBarPosition.RIGHT]: ProgressBarPosition.RIGHT,
} satisfies Record<TProgressBarPositionAutoVertical, TProgressBarPositionAutoVertical>;

export enum ReadingDirection {
    LTR,
    RTL,
}

export enum ReadingMode {
    SINGLE_PAGE,
    DOUBLE_PAGE,
    CONTINUOUS_VERTICAL,
    CONTINUOUS_HORIZONTAL,
    WEBTOON,
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
    blendMode: ReaderBlendMode;
}

export enum ReaderBlendMode {
    DEFAULT = 'normal',
    MULTIPLY = 'multiply',
    SCREEN = 'screen',
    OVERLAY = 'overlay',
    DARKEN = 'darken',
    LIGHTEN = 'lighten',
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

/**
 * percentage values
 */
export enum ReaderScrollAmount {
    TINY = 10,
    SMALL = 25,
    MEDIUM = 75,
    LARGE = 95,
}

export interface IReaderSettingsGlobal {
    overlayMode: ReaderOverlayMode;
    exitMode: ReaderExitMode;
    customFilter: ReaderCustomFilter;
    shouldSkipDupChapters: boolean;
    shouldSkipFilteredChapters: boolean;
    progressBarType: ProgressBarType;
    /**
     * pixel
     */
    progressBarSize: number;
    progressBarPosition: ProgressBarPosition;
    progressBarPositionAutoVertical: TProgressBarPositionAutoVertical;
    shouldShowPageNumber: boolean;
    isStaticNav: boolean;
    backgroundColor: ReaderBackgroundColor;
    hotkeys: Record<ReaderHotkey, string[]>;
    imagePreLoadAmount: number;
    shouldUseAutoWebtoonMode: boolean;
    autoScroll: {
        /**
         * interval in seconds
         */
        value: number;
        smooth: boolean;
    };
    shouldShowReadingModePreview: boolean;
    shouldShowTapZoneLayoutPreview: boolean;
    shouldInformAboutMissingChapter: boolean;
    shouldInformAboutScanlatorChange: boolean;
    scrollAmount: ReaderScrollAmount;
    shouldUseInfiniteScroll: boolean;
    shouldShowTransitionPage: boolean;
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
}

export interface IReaderSettings extends IReaderSettingsGlobal, IReaderSettingsManga {}

export interface IReaderSettingsWithDefaultFlag
    extends IReaderSettingsGlobal,
        TransformRecordToWithDefaultFlag<IReaderSettingsManga> {}

export interface ReaderStateChapters {
    /**
     * All chapters of the manga with their state preserved from the initial reader load.
     *
     * The state needs to be preserved so that chapter state changes do not lead to chapters getting filtered out.
     * E.g., in case read chapters are filtered out. This would then lead to the removal of the current chapter
     * after the end of the chapter is reached.
     */
    mangaChapters?: TChapterReader[];
    /**
     * Actual chapters that have been filtered
     *
     * Optional filters:
     *  - Removed duplicate chapters
     *  - Manga chapter list filters
     */
    chapters: TChapterReader[];
    chapterForDuplicatesHandling?: TChapterReader | null;
    initialChapter?: TChapterReader | null;
    currentChapter?: TChapterReader | null;
    nextChapter?: TChapterReader;
    previousChapter?: TChapterReader;
    isCurrentChapterReady: boolean;
    /**
     * Based from the initial chapter index
     */
    visibleChapters: {
        leading: number;
        trailing: number;
        lastLeadingChapterSourceOrder: number;
        lastTrailingChapterSourceOrder: number;
        isLeadingChapterPreloadMode: boolean;
        isTrailingChapterPreloadMode: boolean;
        scrollIntoView: boolean;
        resumeMode?: ReaderResumeMode;
    };
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
    setTransparent?: (transparent: boolean) => void;
}

interface ReaderSettingsTypeDefaultableProps extends ReaderSettingsTypeBaseProps, ReaderSettingsDefaultableProps {
    isDefaultable: true;
}

interface ReaderSettingsTypeNonDefaultableProps extends ReaderSettingsTypeBaseProps {}

export type ReaderSettingsTypeProps =
    | ReaderSettingsTypeDefaultableProps
    | (PropertiesNever<Omit<ReaderSettingsTypeDefaultableProps, keyof ReaderSettingsTypeBaseProps>> &
          ReaderSettingsTypeNonDefaultableProps);

export enum ReaderHotkey {
    PREVIOUS_PAGE,
    NEXT_PAGE,
    SCROLL_BACKWARD,
    SCROLL_FORWARD,
    PREVIOUS_CHAPTER,
    NEXT_CHAPTER,
    TOGGLE_MENU,
    CYCLE_SCALE_TYPE,
    STRETCH_IMAGE,
    OFFSET_SPREAD_PAGES,
    CYCLE_READING_MODE,
    CYCLE_READING_DIRECTION,
    TOGGLE_AUTO_SCROLL,
    AUTO_SCROLL_SPEED_INCREASE,
    AUTO_SCROLL_SPEED_DECREASE,
    EXIT_READER,
}

export interface ReaderPagerProps
    extends Pick<
            ReaderStatePages,
            | 'currentPageIndex'
            | 'pages'
            | 'totalPages'
            | 'transitionPageMode'
            | 'pageLoadStates'
            | 'retryFailedPagesKeyPrefix'
        >,
        Pick<
            IReaderSettings,
            | 'readingMode'
            | 'imagePreLoadAmount'
            | 'readingDirection'
            | 'pageScaleMode'
            | 'pageGap'
            | 'customFilter'
            | 'shouldStretchPage'
            | 'readerWidth'
        >,
        Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'>,
        Pick<NavbarContextType, 'readerNavBarWidth'> {
    onLoad?: (pagesIndex: number, url: string, isPrimary?: boolean) => void;
    onError?: (pageIndex: number, url: string) => void;
    imageRefs: MutableRefObject<(HTMLElement | null)[]>;
    isCurrentChapter: boolean;
    isPreviousChapter: boolean;
    isNextChapter: boolean;
    isPreloadMode: boolean;
    resumeMode: ReaderResumeMode;
    handleAsInitialRender: boolean;
}

export enum PageInViewportType {
    X,
    Y,
}

export enum ReaderTransitionPageMode {
    NONE,
    PREVIOUS,
    NEXT,
    BOTH,
}

export enum ReaderResumeMode {
    START,
    END,
    LAST_READ,
}

export interface ReaderOpenChapterLocationState {
    resumeMode?: ReaderResumeMode;
    updateInitialChapter?: boolean;
}

export type TReaderScrollbarContext = {
    scrollbarXSize: number;
    setScrollbarXSize: (size: number) => void;
    scrollbarYSize: number;
    setScrollbarYSize: (size: number) => void;
};

export type TReaderStateMangaContext = {
    manga: TMangaReader | undefined;
    setManga: (manga: TMangaReader | undefined) => void;
};

export type TReaderStateSettingsContext = {
    settings: IReaderSettingsWithDefaultFlag;
    setSettings: (settings: IReaderSettingsWithDefaultFlag) => void;
};

export type TReaderAutoScrollContext = ReturnType<typeof useAutomaticScrolling> & {
    isActive: boolean;
    scrollRef?: MutableRefObject<HTMLElement | null> | (() => void);
    setScrollRef: (scrollRef?: MutableRefObject<HTMLElement | null>) => void;
    setDirection: (direction: ScrollOffset) => void;
};

export type ReaderPageSpreadState = { url: string; isSpread: boolean };
