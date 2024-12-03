/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ExpandIcon from '@mui/icons-material/Expand';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import { TooltipProps } from '@mui/material/Tooltip';
import { Direction } from '@mui/material/styles';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';
import {
    IReaderSettings,
    IReaderSettingsGlobal,
    ProgressBarPosition,
    ProgressBarType,
    ReaderBackgroundColor,
    ReaderExitMode,
    ReaderHotkey,
    ReaderOverlayMode,
    ReaderPageScaleMode,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { SinglePageIcon } from '@/assets/icons/svg/SinglePageIcon.tsx';
import { DoublePageIcon } from '@/assets/icons/svg/DoublePageIcon.tsx';
import { ContinuousVerticalPageIcon } from '@/assets/icons/svg/ContinuousVerticalPageIcon.tsx';
import { ContinuousHorizontalPageIcon } from '@/assets/icons/svg/ContinuousHorizontalPageIcon.tsx';
import { TranslationKey } from '@/Base.types.ts';
import { TapZoneLayouts } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const DEFAULT_READER_PROFILE = 'default';

export const READING_DIRECTION_TO_THEME_DIRECTION: Record<ReadingDirection, Direction> = {
    [ReadingDirection.LTR]: 'ltr',
    [ReadingDirection.RTL]: 'rtl',
};

const GLOBAL_READER_SETTING_OBJECT: Record<keyof IReaderSettingsGlobal, undefined> = {
    overlayMode: undefined,
    exitMode: undefined,
    customFilter: undefined,
    shouldSkipDupChapters: undefined,
    progressBarType: undefined,
    progressBarSize: undefined,
    progressBarPosition: undefined,
    shouldShowPageNumber: undefined,
    isStaticNav: undefined,
    backgroundColor: undefined,
    profiles: undefined,
    readingModesDefaultProfile: undefined,
    hotkeys: undefined,
    imagePreLoadAmount: undefined,
};

export const GLOBAL_READER_SETTING_KEYS = Object.keys(GLOBAL_READER_SETTING_OBJECT);

export const DEFAULT_READER_SETTINGS: IReaderSettings = {
    readerWidth: { value: 50, enabled: false },
    overlayMode: ReaderOverlayMode.AUTO,
    tapZoneLayout: TapZoneLayouts.RIGHT_LEFT,
    tapZoneInvertMode: { vertical: false, horizontal: false },
    progressBarType: ProgressBarType.STANDARD,
    progressBarSize: 4,
    progressBarPosition: ProgressBarPosition.BOTTOM,
    pageScaleMode: ReaderPageScaleMode.ORIGINAL,
    shouldStretchPage: false,
    shouldOffsetDoubleSpreads: false,
    shouldSkipDupChapters: true,
    shouldShowPageNumber: true,
    isStaticNav: false,
    readingDirection: ReadingDirection.LTR,
    readingMode: ReadingMode.SINGLE_PAGE,
    exitMode: ReaderExitMode.PREVIOUS,
    backgroundColor: ReaderBackgroundColor.THEME,
    customFilter: {
        brightness: {
            value: 100,
            enabled: false,
        },
        contrast: {
            value: 100,
            enabled: false,
        },
        saturate: {
            value: 100,
            enabled: false,
        },
        hue: {
            value: 0,
            enabled: false,
        },
        rgba: {
            value: {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 0,
            },
            enabled: false,
        },
        sepia: false,
        grayscale: false,
        invert: false,
    },
    pageGap: 5,
    profiles: [DEFAULT_READER_PROFILE],
    readingModesDefaultProfile: {
        [ReadingMode.SINGLE_PAGE]: DEFAULT_READER_PROFILE,
        [ReadingMode.DOUBLE_PAGE]: DEFAULT_READER_PROFILE,
        [ReadingMode.CONTINUOUS_VERTICAL]: DEFAULT_READER_PROFILE,
        [ReadingMode.CONTINUOUS_HORIZONTAL]: DEFAULT_READER_PROFILE,
    },
    defaultProfile: DEFAULT_READER_PROFILE,
    hotkeys: {
        [ReaderHotkey.PREVIOUS_PAGE]: ['arrowleft', 'a'],
        [ReaderHotkey.NEXT_PAGE]: ['arrowright', 'd'],
        [ReaderHotkey.SCROLL_BACKWARD]: ['arrowup', 'w'],
        [ReaderHotkey.SCROLL_FORWARD]: ['arrowdown', 's'],
        [ReaderHotkey.PREVIOUS_CHAPTER]: ['comma'],
        [ReaderHotkey.NEXT_CHAPTER]: ['period'],
        [ReaderHotkey.TOGGLE_MENU]: ['m'],
        [ReaderHotkey.CYCLE_SCALE_TYPE]: ['i'],
        [ReaderHotkey.STRETCH_IMAGE]: ['f'],
        [ReaderHotkey.OFFSET_SPREAD_PAGES]: ['o'],
    },
    imagePreLoadAmount: 5,
};

export const READER_PROGRESS_BAR_POSITION_TO_PLACEMENT: Record<ProgressBarPosition, TooltipProps['placement']> = {
    [ProgressBarPosition.BOTTOM]: 'top',
    [ProgressBarPosition.LEFT]: 'right',
    [ProgressBarPosition.RIGHT]: 'left',
};

export const READING_DIRECTION_VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReadingDirection> = {
    [ReadingDirection.LTR]: {
        title: 'reader.settings.reading_direction.ltr',
        icon: <ArrowCircleRightIcon />,
    },
    [ReadingDirection.RTL]: {
        title: 'reader.settings.reading_direction.rtl',
        icon: <ArrowCircleLeftIcon />,
    },
};

export const READING_DIRECTION_VALUES = Object.values(ReadingDirection).filter((value) => typeof value === 'number');

export const PAGE_SCALE_VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderPageScaleMode> = {
    [ReaderPageScaleMode.WIDTH]: {
        title: 'reader.settings.page_scale.width',
        icon: <ExpandIcon sx={{ transform: 'rotate(90deg)' }} />,
    },
    [ReaderPageScaleMode.HEIGHT]: {
        title: 'reader.settings.page_scale.height',
        icon: <ExpandIcon />,
    },
    [ReaderPageScaleMode.SCREEN]: {
        title: 'reader.settings.page_scale.screen',
        icon: <ZoomOutMapIcon />,
    },
    [ReaderPageScaleMode.ORIGINAL]: {
        title: 'reader.settings.page_scale.original',
        icon: <CropOriginalIcon />,
    },
};

export const READER_PAGE_SCALE_MODE_VALUES = Object.values(ReaderPageScaleMode).filter(
    (value) => typeof value === 'number',
);

export const READER_PAGE_SCALE_MODE_TO_SCALING_ALLOWED: Record<ReaderPageScaleMode, boolean> = {
    [ReaderPageScaleMode.WIDTH]: true,
    [ReaderPageScaleMode.HEIGHT]: true,
    [ReaderPageScaleMode.SCREEN]: true,
    [ReaderPageScaleMode.ORIGINAL]: false,
};

export const READING_MODE_VALUE_TO_DISPLAY_DATA = {
    [ReadingMode.SINGLE_PAGE]: {
        title: 'reader.settings.reader_type.label.single_page',
        icon: <SinglePageIcon />,
    },
    [ReadingMode.DOUBLE_PAGE]: {
        title: 'reader.settings.reader_type.label.double_page',
        icon: <DoublePageIcon />,
    },
    [ReadingMode.CONTINUOUS_VERTICAL]: {
        title: 'reader.settings.reader_type.label.continuous_vertical',
        icon: <ContinuousVerticalPageIcon />,
    },
    [ReadingMode.CONTINUOUS_HORIZONTAL]: {
        title: 'reader.settings.reader_type.label.continuous_horizontal',
        icon: <ContinuousHorizontalPageIcon />,
    },
} satisfies ValueToDisplayData<ReadingMode>;

export const READING_MODE_VALUES = Object.values(ReadingMode).filter((value) => typeof value === 'number');

export enum ReaderSettingTab {
    LAYOUT,
    GENERAL,
    FILTER,
    BEHAVIOUR,
    HOTKEYS,
}

export const READER_SETTING_TABS: Record<
    ReaderSettingTab,
    {
        id: ReaderSettingTab;
        label: TranslationKey;
        supportsTouchDevices: boolean;
    }
> = {
    [ReaderSettingTab.LAYOUT]: {
        id: ReaderSettingTab.LAYOUT,
        label: 'reader.settings.label.layout',
        supportsTouchDevices: true,
    },
    [ReaderSettingTab.GENERAL]: {
        id: ReaderSettingTab.GENERAL,
        label: 'global.label.general',
        supportsTouchDevices: true,
    },
    [ReaderSettingTab.FILTER]: {
        id: ReaderSettingTab.FILTER,
        label: 'reader.settings.custom_filter.title',
        supportsTouchDevices: true,
    },
    [ReaderSettingTab.BEHAVIOUR]: {
        id: ReaderSettingTab.BEHAVIOUR,
        label: 'reader.settings.label.behaviour',
        supportsTouchDevices: true,
    },
    [ReaderSettingTab.HOTKEYS]: {
        id: ReaderSettingTab.HOTKEYS,
        label: 'hotkeys.title_other',
        supportsTouchDevices: false,
    },
};

/**
 * percentage values
 */
export enum ReaderScrollAmount {
    SMALL = 25,
    LARGE = 95,
}

export const READER_HOTKEYS = Object.values(ReaderHotkey).filter(
    (hotkey) => typeof hotkey === 'number',
) as ReaderHotkey[];

export const READER_BACKGROUND_TO_COLOR: Record<ReaderBackgroundColor, string> = {
    [ReaderBackgroundColor.THEME]: 'background.default',
    [ReaderBackgroundColor.BLACK]: 'black',
    [ReaderBackgroundColor.GRAY]: 'gray',
    [ReaderBackgroundColor.WHITE]: 'white',
};
