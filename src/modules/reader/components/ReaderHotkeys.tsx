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
import { HOTKEY_SCOPES } from '@/modules/hotkeys/Hotkeys.constants.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { IReaderSettings, ReaderHotkey, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { getNextRotationValue } from '@/modules/core/utils/ValueRotationButton.utils.ts';
import {
    READER_PAGE_SCALE_MODE_VALUES,
    ReaderScrollAmount,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { HotkeyScope } from '@/modules/hotkeys/Hotkeys.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { ScrollDirection, ScrollOffset } from '@/modules/core/Core.types.ts';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';

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

const DEFAULT_MANGA: MangaIdInfo = { id: -1 };

const CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION: Record<ReadingMode, ScrollDirection> = {
    [ReadingMode.SINGLE_PAGE]: ScrollDirection.Y,
    [ReadingMode.DOUBLE_PAGE]: ScrollDirection.Y,
    [ReadingMode.CONTINUOUS_VERTICAL]: ScrollDirection.Y,
    [ReadingMode.CONTINUOUS_HORIZONTAL]: ScrollDirection.X,
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
        defaultProfile,
        profiles,
    } = ReaderService.useSettings();

    const openChapter = ReaderControls.useOpenChapter();
    const openPage = ReaderControls.useOpenPage();

    const updateSetting = ReaderService.useCreateUpdateSetting(manga ?? DEFAULT_MANGA);
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? DEFAULT_MANGA);

    useHotkeys(hotkeys[ReaderHotkey.PREVIOUS_PAGE], () => openPage('previous'), [openPage]);
    useHotkeys(hotkeys[ReaderHotkey.NEXT_PAGE], () => openPage('next'), [openPage]);
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_BACKWARD],
        () =>
            scrollElementRef.current &&
            ReaderControls.scroll(
                ScrollOffset.BACKWARD,
                CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode.value],
                readingMode.value,
                readingDirection.value,
                themeDirection,
                scrollElementRef.current,
                openChapter,
                setIsOverlayVisible,
                ReaderScrollAmount.SMALL,
            ),
        { preventDefault: true },
        [readingMode.value, readingDirection.value, themeDirection, openChapter],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_FORWARD],
        () =>
            scrollElementRef.current &&
            ReaderControls.scroll(
                ScrollOffset.FORWARD,
                CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode.value],
                readingMode.value,
                readingDirection.value,
                themeDirection,
                scrollElementRef.current,
                openChapter,
                setIsOverlayVisible,
                ReaderScrollAmount.SMALL,
            ),
        { preventDefault: true },
        [readingMode.value, readingDirection.value, themeDirection, openChapter],
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
        [updateSetting, deleteSetting, pageScaleMode],
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
    useHotkeys(hotkeys[ReaderHotkey.CYCLE_PROFILES], () => {
        updateSettingCycleThrough(
            updateSetting,
            deleteSetting,
            'defaultProfile',
            defaultProfile.value,
            profiles,
            defaultProfile.isDefault,
            true,
        );
    });

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
