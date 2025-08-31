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
import { getNextRotationValue } from '@/base/utils/ValueRotationButton.utils.ts';
import {
    AUTO_SCROLL_SPEED,
    CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION,
    READER_PAGE_SCALE_MODE_VALUES,
    READING_DIRECTION_VALUES,
    READING_MODE_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { HotkeyScope } from '@/features/hotkeys/Hotkeys.types.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ScrollOffset } from '@/base/Base.types.ts';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { useReaderTapZoneContext } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';
import { getReaderStore } from '@/features/reader/ReaderStore.ts';

const useHotkeys = (...args: Parameters<typeof useHotKeysHook>): ReturnType<typeof useHotKeysHook> => {
    const [keys, callback, options, dependencies] = args;
    return useHotKeysHook(keys, callback, { ...options, ...HOTKEY_SCOPES.reader }, dependencies);
};

const updateSettingCycleThrough = <Setting extends keyof IReaderSettings>(
    setting: Setting,
    value: IReaderSettings[Setting],
    values: IReaderSettings[Setting][],
    isDefault: boolean,
    isDefaultable: boolean,
) => {
    if (isDefault) {
        ReaderService.updateSetting(setting, values[0]);
        return;
    }

    const nextValue = getNextRotationValue(values.indexOf(value), values, isDefaultable);

    const isDefaultNextValue = nextValue === undefined;
    if (isDefaultNextValue) {
        ReaderService.deleteSetting(setting);
        return;
    }

    ReaderService.updateSetting(setting, nextValue);
};

export const ReaderHotkeys = ({
    scrollElementRef,
}: {
    scrollElementRef: React.MutableRefObject<HTMLElement | null>;
}) => {
    const { direction: themeDirection } = useTheme();
    const readerThemeDirection = ReaderService.useGetThemeDirection();
    const { enableScope, disableScope } = useHotkeysContext();
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
    const { setShowPreview } = useReaderTapZoneContext();
    const exitReader = ReaderService.useExit();

    const openChapter = ReaderControls.useOpenChapter();
    const openPage = ReaderControls.useOpenPage();

    useHotkeys(hotkeys[ReaderHotkey.PREVIOUS_PAGE], () => openPage('previous'), [openPage]);
    useHotkeys(hotkeys[ReaderHotkey.NEXT_PAGE], () => openPage('next'), [openPage]);
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_BACKWARD],
        () => {
            const automaticScrolling = getReaderStore().autoScroll;

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
                setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [readingMode.value, readingDirection.value, themeDirection, openChapter, scrollAmount],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_FORWARD],
        () => {
            const automaticScrolling = getReaderStore().autoScroll;

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
                setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [readingMode.value, readingDirection.value, themeDirection, openChapter, scrollAmount],
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
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_MENU], () =>
        getReaderStore().overlay.setIsVisible(!getReaderStore().overlay.isVisible),
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_SCALE_TYPE],
        () => {
            updateSettingCycleThrough(
                'pageScaleMode',
                pageScaleMode.value,
                READER_PAGE_SCALE_MODE_VALUES,
                pageScaleMode.isDefault,
                true,
            );
        },
        [pageScaleMode.value, pageScaleMode.isDefault],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.STRETCH_IMAGE],
        () => ReaderService.updateSetting('shouldStretchPage', !shouldStretchPage.value),
        [shouldStretchPage.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.OFFSET_SPREAD_PAGES],
        () => ReaderService.updateSetting('shouldOffsetDoubleSpreads', !shouldOffsetDoubleSpreads.value),
        [shouldOffsetDoubleSpreads.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_READING_MODE],
        () => {
            updateSettingCycleThrough(
                'readingMode',
                readingMode.value,
                READING_MODE_VALUES,
                readingMode.isDefault,
                true,
            );
        },
        [readingMode.value, readingMode.isDefault],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_READING_DIRECTION],
        () => {
            updateSettingCycleThrough(
                'readingDirection',
                readingDirection.value,
                READING_DIRECTION_VALUES,
                readingDirection.isDefault,
                true,
            );
        },
        [readingDirection.value, readingDirection.isDefault],
    );
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_AUTO_SCROLL], () => getReaderStore().autoScroll.toggleActive(), {
        preventDefault: true,
    });
    useHotkeys(
        hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_DECREASE],
        () =>
            ReaderService.updateSetting('autoScroll', {
                ...autoScroll,
                value: Math.min(AUTO_SCROLL_SPEED.max, autoScroll.value + AUTO_SCROLL_SPEED.step),
            }),
        [autoScroll.value],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_INCREASE],
        () =>
            ReaderService.updateSetting('autoScroll', {
                ...autoScroll,
                value: Math.max(AUTO_SCROLL_SPEED.min, autoScroll.value - AUTO_SCROLL_SPEED.step),
            }),
        [autoScroll.value],
    );
    useHotkeys(hotkeys[ReaderHotkey.EXIT_READER], exitReader, [exitReader]);

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
