/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useHotkeys as useHotKeysHook, useHotkeysContext } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { HOTKEY_SCOPES } from '@/features/hotkeys/Hotkeys.constants.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { IReaderSettings, ReaderHotkey } from '@/features/reader/Reader.types.ts';
import { useReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlayContext.tsx';
import { getNextRotationValue } from '@/base/utils/ValueRotationButton.utils.ts';
import {
    AUTO_SCROLL_SPEED,
    CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION,
    READER_PAGE_SCALE_MODE_VALUES,
    READING_DIRECTION_VALUES,
    READING_MODE_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { useReaderStateMangaContext } from '@/features/reader/contexts/state/ReaderStateMangaContext.tsx';
import { HotkeyScope } from '@/features/hotkeys/Hotkeys.types.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ScrollOffset } from '@/base/Base.types.ts';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';
import { useReaderAutoScrollContext } from '@/features/reader/auto-scroll/ReaderAutoScrollContext.tsx';
import { useReaderTapZoneContext } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';

const useHotkeys = (...args: Parameters<typeof useHotKeysHook>): ReturnType<typeof useHotKeysHook> => {
    const [keys, callback, options, dependencies] = args;
    return useHotKeysHook(keys, callback, { ...options, ...HOTKEY_SCOPES.reader }, dependencies);
};

const updateSettingCycleThrough = <Setting extends keyof IReaderSettings>(
    updateSetting: ReturnType<typeof ReaderService.useCreateUpdateSetting>,
    deleteSetting: ReturnType<typeof ReaderService.useCreateDeleteSetting>,
    setting: Setting,
    value: IReaderSettings[Setting],
    values: IReaderSettings[Setting][],
    isDefault: boolean,
    isDefaultable: boolean,
) => {
    if (isDefault) {
        updateSetting(setting, values[0]);
        return;
    }

    const nextValue = getNextRotationValue(values.indexOf(value), values, isDefaultable);

    const isDefaultNextValue = nextValue === undefined;
    if (isDefaultNextValue) {
        deleteSetting(setting);
        return;
    }

    updateSetting(setting, nextValue);
};

export const ReaderHotkeys = ({
    scrollElementRef,
}: {
    scrollElementRef: React.MutableRefObject<HTMLElement | null>;
}) => {
    const { direction: themeDirection } = useTheme();
    const readerThemeDirection = ReaderService.useGetThemeDirection();
    const { enableScope, disableScope } = useHotkeysContext();
    const { manga } = useReaderStateMangaContext();
    const { isVisible, setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
    const {
        hotkeys,
        pageScaleMode,
        shouldStretchPage,
        shouldOffsetDoubleSpreads,
        readingMode,
        readingDirection,
        autoScroll,
        scrollAmount,
    } = ReaderService.useSettings();
    const automaticScrolling = useReaderAutoScrollContext();
    const { setShowPreview } = useReaderTapZoneContext();
    const exitReader = ReaderService.useExit();

    const openChapter = ReaderControls.useOpenChapter();
    const openPage = ReaderControls.useOpenPage();

    const updateSetting = ReaderService.useCreateUpdateSetting(manga ?? FALLBACK_MANGA);
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? FALLBACK_MANGA);

    useHotkeys(hotkeys[ReaderHotkey.PREVIOUS_PAGE], () => openPage('previous'), [openPage]);
    useHotkeys(hotkeys[ReaderHotkey.NEXT_PAGE], () => openPage('next'), [openPage]);
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_BACKWARD],
        () => {
            if (automaticScrolling.isActive) {
                automaticScrolling.setDirection(ScrollOffset.BACKWARD);
                return;
            }

            if (!scrollElementRef.current) {
                return;
            }

            ReaderControls.scroll(
                ScrollOffset.BACKWARD,
                CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode.value],
                readingMode.value,
                readingDirection.value,
                themeDirection,
                scrollElementRef.current,
                openChapter,
                setIsOverlayVisible,
                setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [
            readingMode.value,
            readingDirection.value,
            themeDirection,
            openChapter,
            scrollAmount,
            automaticScrolling.isActive,
        ],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_FORWARD],
        () => {
            if (automaticScrolling.isActive) {
                automaticScrolling.setDirection(ScrollOffset.FORWARD);
                return;
            }

            if (!scrollElementRef.current) {
                return;
            }

            ReaderControls.scroll(
                ScrollOffset.FORWARD,
                CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode.value],
                readingMode.value,
                readingDirection.value,
                themeDirection,
                scrollElementRef.current,
                openChapter,
                setIsOverlayVisible,
                setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [
            readingMode.value,
            readingDirection.value,
            themeDirection,
            openChapter,
            scrollAmount,
            automaticScrolling.isActive,
        ],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.PREVIOUS_CHAPTER],
        () => openChapter(getOptionForDirection('previous', 'next', readerThemeDirection)),
        [openChapter, readerThemeDirection],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.NEXT_CHAPTER],
        () => openChapter(getOptionForDirection('next', 'previous', readerThemeDirection)),
        [openChapter, readerThemeDirection],
    );
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_MENU], () => setIsOverlayVisible(!isVisible), [isVisible]);
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_SCALE_TYPE],
        () => {
            updateSettingCycleThrough(
                updateSetting,
                deleteSetting,
                'pageScaleMode',
                pageScaleMode.value,
                READER_PAGE_SCALE_MODE_VALUES,
                pageScaleMode.isDefault,
                true,
            );
        },
        [updateSetting, deleteSetting, pageScaleMode.value, pageScaleMode.isDefault],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.STRETCH_IMAGE],
        () => updateSetting('shouldStretchPage', !shouldStretchPage.value),
        [updateSetting, shouldStretchPage.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.OFFSET_SPREAD_PAGES],
        () => updateSetting('shouldOffsetDoubleSpreads', !shouldOffsetDoubleSpreads.value),
        [updateSetting, shouldOffsetDoubleSpreads.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_READING_MODE],
        () => {
            updateSettingCycleThrough(
                updateSetting,
                deleteSetting,
                'readingMode',
                readingMode.value,
                READING_MODE_VALUES,
                readingMode.isDefault,
                true,
            );
        },
        [updateSetting, deleteSetting, readingMode.value, readingMode.isDefault],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_READING_DIRECTION],
        () => {
            updateSettingCycleThrough(
                updateSetting,
                deleteSetting,
                'readingDirection',
                readingDirection.value,
                READING_DIRECTION_VALUES,
                readingDirection.isDefault,
                true,
            );
        },
        [updateSetting, deleteSetting, readingDirection.value, readingDirection.isDefault],
    );
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_AUTO_SCROLL], automaticScrolling.toggleActive, { preventDefault: true }, [
        automaticScrolling.toggleActive,
    ]);
    useHotkeys(
        hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_DECREASE],
        () =>
            updateSetting('autoScroll', {
                ...autoScroll,
                value: Math.min(AUTO_SCROLL_SPEED.max, autoScroll.value + AUTO_SCROLL_SPEED.step),
            }),
        [updateSetting, autoScroll.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_INCREASE],
        () =>
            updateSetting('autoScroll', {
                ...autoScroll,
                value: Math.max(AUTO_SCROLL_SPEED.min, autoScroll.value - AUTO_SCROLL_SPEED.step),
            }),
        [updateSetting, autoScroll.value],
    );
    useHotkeys(hotkeys[ReaderHotkey.EXIT_READER], exitReader, [exitReader]);

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
