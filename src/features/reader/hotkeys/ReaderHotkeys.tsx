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
import { getReaderStore, useReaderStoreShallow } from '@/features/reader/stores/ReaderStore.ts';

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
    const { hotkeys } = useReaderStoreShallow((state) => ({
        hotkeys: state.settings.hotkeys,
    }));
    const exitReader = ReaderService.useExit();

    const openPage = ReaderControls.useOpenPage();

    useHotkeys(hotkeys[ReaderHotkey.PREVIOUS_PAGE], () => openPage('previous'), [openPage]);
    useHotkeys(hotkeys[ReaderHotkey.NEXT_PAGE], () => openPage('next'), [openPage]);
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_BACKWARD],
        () => {
            const {
                autoScroll,
                settings: { readingMode, readingDirection, scrollAmount },
            } = getReaderStore();

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
                themeDirection,
                scrollElementRef.current,
                getReaderStore().tapZone.setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [themeDirection],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_FORWARD],
        () => {
            const {
                autoScroll,
                settings: { readingMode, readingDirection, scrollAmount },
            } = getReaderStore();

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
                themeDirection,
                scrollElementRef.current,
                getReaderStore().tapZone.setShowPreview,
                scrollAmount,
            );
        },
        { preventDefault: true },
        [themeDirection],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.PREVIOUS_CHAPTER],
        () => ReaderControls.openChapter(getOptionForDirection('previous', 'next', readerThemeDirection)),
        [readerThemeDirection],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.NEXT_CHAPTER],
        () => ReaderControls.openChapter(getOptionForDirection('next', 'previous', readerThemeDirection)),
        [readerThemeDirection],
    );
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_MENU], () =>
        getReaderStore().overlay.setIsVisible(!getReaderStore().overlay.isVisible),
    );
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_SCALE_TYPE],
        () => {
            updateSettingCycleThrough(
                'pageScaleMode',
                getReaderStore().settings.pageScaleMode.value,
                READER_PAGE_SCALE_MODE_VALUES,
                getReaderStore().settings.pageScaleMode.isDefault,
                true,
            );
        },
        [],
    );
    useHotkeys(hotkeys[ReaderHotkey.STRETCH_IMAGE], () =>
        ReaderService.updateSetting('shouldStretchPage', !getReaderStore().settings.shouldStretchPage.value),
    );
    useHotkeys(hotkeys[ReaderHotkey.OFFSET_SPREAD_PAGES], () =>
        ReaderService.updateSetting(
            'shouldOffsetDoubleSpreads',
            !getReaderStore().settings.shouldOffsetDoubleSpreads.value,
        ),
    );
    useHotkeys(hotkeys[ReaderHotkey.CYCLE_READING_MODE], () => {
        updateSettingCycleThrough(
            'readingMode',
            getReaderStore().settings.readingMode.value,
            READING_MODE_VALUES,
            getReaderStore().settings.readingMode.isDefault,
            true,
        );
    });
    useHotkeys(hotkeys[ReaderHotkey.CYCLE_READING_DIRECTION], () => {
        updateSettingCycleThrough(
            'readingDirection',
            getReaderStore().settings.readingDirection.value,
            READING_DIRECTION_VALUES,
            getReaderStore().settings.readingDirection.isDefault,
            true,
        );
    });
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_AUTO_SCROLL], () => getReaderStore().autoScroll.toggleActive(), {
        preventDefault: true,
    });
    useHotkeys(hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_DECREASE], () =>
        ReaderService.updateSetting('autoScroll', {
            ...getReaderStore().settings.autoScroll,
            value: Math.min(AUTO_SCROLL_SPEED.max, getReaderStore().settings.autoScroll.value + AUTO_SCROLL_SPEED.step),
        }),
    );
    useHotkeys(hotkeys[ReaderHotkey.AUTO_SCROLL_SPEED_INCREASE], () =>
        ReaderService.updateSetting('autoScroll', {
            ...getReaderStore().settings.autoScroll,
            value: Math.max(AUTO_SCROLL_SPEED.min, getReaderStore().settings.autoScroll.value - AUTO_SCROLL_SPEED.step),
        }),
    );
    useHotkeys(hotkeys[ReaderHotkey.EXIT_READER], exitReader, [exitReader]);

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
