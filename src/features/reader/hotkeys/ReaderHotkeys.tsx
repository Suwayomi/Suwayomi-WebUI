/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useHotkeysContext } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import { HOTKEY_SCOPES } from '@/features/hotkeys/Hotkeys.constants.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import type { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { ReaderHotkey } from '@/features/reader/Reader.types.ts';
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
import {
    getReaderAutoScrollStore,
    getReaderOverlayStore,
    getReaderSettingsStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { useHotkeys } from '@/lib/react-hotkeys-hook/useHotkeys.ts';

const useReaderHotkeys = (...args: Parameters<typeof useHotkeys>): ReturnType<typeof useHotkeys> => {
    const [keys, callback, options, dependencies] = args;
    return useHotkeys(keys, callback, { ...options, ...HOTKEY_SCOPES.reader }, dependencies);
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
    const readerThemeDirection = ReaderService.useGetThemeDirection();
    const { enableScope, disableScope } = useHotkeysContext();
    const hotkeys = useReaderSettingsStore('hotkeys');
    const exitReader = ReaderService.useExit();

    useReaderHotkeys(hotkeys[ReaderHotkey.PREVIOUS_PAGE], () => ReaderControls.openPage('previous'));
    useReaderHotkeys(hotkeys[ReaderHotkey.NEXT_PAGE], () => ReaderControls.openPage('next'));
    useReaderHotkeys(hotkeys[ReaderHotkey.SCROLL_BACKWARD], () => {
        const autoScroll = getReaderAutoScrollStore();
        const { readingMode, readingDirection, scrollAmount } = getReaderSettingsStore();

        if (autoScroll.isActive) {
            autoScroll.setDirection(ScrollOffset.BACKWARD);
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
            scrollElementRef.current,
            scrollAmount,
        );
    });
    useReaderHotkeys(hotkeys[ReaderHotkey.SCROLL_FORWARD], () => {
        const autoScroll = getReaderAutoScrollStore();
        const { readingMode, readingDirection, scrollAmount } = getReaderSettingsStore();

        if (autoScroll.isActive) {
            autoScroll.setDirection(ScrollOffset.FORWARD);
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
            scrollElementRef.current,
            scrollAmount,
        );
    });
    useReaderHotkeys(
        hotkeys[ReaderHotkey.PREVIOUS_CHAPTER],
        () => ReaderControls.openChapter(getOptionForDirection('previous', 'next', readerThemeDirection)),
        [readerThemeDirection],
    );
    useReaderHotkeys(
        hotkeys[ReaderHotkey.NEXT_CHAPTER],
        () => ReaderControls.openChapter(getOptionForDirection('next', 'previous', readerThemeDirection)),
        [readerThemeDirection],
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.TOGGLE_MENU], () =>
        getReaderOverlayStore().setIsVisible(!getReaderOverlayStore().isVisible),
    );
    useReaderHotkeys(
        hotkeys[ReaderHotkey.CYCLE_SCALE_TYPE],
        () => {
            updateSettingCycleThrough(
                'pageScaleMode',
                getReaderSettingsStore().pageScaleMode.value,
                READER_PAGE_SCALE_MODE_VALUES,
                getReaderSettingsStore().pageScaleMode.isDefault,
                true,
            );
        },
        [],
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.STRETCH_IMAGE], () =>
        ReaderService.updateSetting('shouldStretchPage', !getReaderSettingsStore().shouldStretchPage.value),
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.OFFSET_SPREAD_PAGES], () =>
        ReaderService.setOffsetDoubleSpreads(!getReaderSettingsStore().shouldOffsetDoubleSpreads.value),
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.CYCLE_READING_MODE], () => {
        updateSettingCycleThrough(
            'readingMode',
            getReaderSettingsStore().readingMode.value,
            READING_MODE_VALUES,
            getReaderSettingsStore().readingMode.isDefault,
            true,
        );
    });
    useReaderHotkeys(hotkeys[ReaderHotkey.CYCLE_READING_DIRECTION], () => {
        updateSettingCycleThrough(
            'readingDirection',
            getReaderSettingsStore().readingDirection.value,
            READING_DIRECTION_VALUES,
            getReaderSettingsStore().readingDirection.isDefault,
            true,
        );
    });
    useReaderHotkeys(hotkeys[ReaderHotkey.TOGGLE_AUTO_SCROLL], () => getReaderAutoScrollStore().toggleActive(), {});
    useReaderHotkeys(hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_DECREASE], () =>
        ReaderService.updateSetting('autoScroll', {
            ...getReaderSettingsStore().autoScroll,
            value: Math.min(AUTO_SCROLL_SPEED.max, getReaderSettingsStore().autoScroll.value + AUTO_SCROLL_SPEED.step),
        }),
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_INCREASE], () =>
        ReaderService.updateSetting('autoScroll', {
            ...getReaderSettingsStore().autoScroll,
            value: Math.max(AUTO_SCROLL_SPEED.min, getReaderSettingsStore().autoScroll.value - AUTO_SCROLL_SPEED.step),
        }),
    );
    useReaderHotkeys(hotkeys[ReaderHotkey.EXIT_READER], exitReader, [exitReader]);

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
