/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useHotkeys as useHotKeysHook, useHotkeysContext } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import { HOTKEY_SCOPES } from '@/modules/hotkeys/Hotkeys.constants.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderHotkey, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
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

const useHotkeys = (...args: Parameters<typeof useHotKeysHook>): ReturnType<typeof useHotKeysHook> => {
    const [keys, callback, options, dependencies] = args;
    return useHotKeysHook(keys, callback, { ...options, ...HOTKEY_SCOPES.reader }, dependencies);
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
    const { enableScope, disableScope } = useHotkeysContext();
    const { manga } = useReaderStateMangaContext();
    const { isVisible, setIsVisible } = useReaderOverlayContext();
    const { hotkeys, pageScaleMode, shouldStretchPage, shouldOffsetDoubleSpreads, readingMode, readingDirection } =
        ReaderService.useSettings();

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
                readingDirection.value,
                scrollElementRef.current,
                openChapter,
                ReaderScrollAmount.SMALL,
            ),
        { preventDefault: true },
        [readingMode.value, readingDirection.value, openChapter],
    );
    useHotkeys(
        hotkeys[ReaderHotkey.SCROLL_FORWARD],
        () =>
            scrollElementRef.current &&
            ReaderControls.scroll(
                ScrollOffset.FORWARD,
                CONTINUOUS_READING_MODE_TO_SCROLL_DIRECTION[readingMode.value],
                readingDirection.value,
                scrollElementRef.current,
                openChapter,
                ReaderScrollAmount.SMALL,
            ),
        { preventDefault: true },
        [readingMode.value, readingDirection.value, openChapter],
    );
    useHotkeys(hotkeys[ReaderHotkey.PREVIOUS_CHAPTER], () => openChapter('previous'), [openChapter]);
    useHotkeys(hotkeys[ReaderHotkey.NEXT_CHAPTER], () => openChapter('next'), [openChapter]);
    useHotkeys(hotkeys[ReaderHotkey.TOGGLE_MENU], () => setIsVisible(!isVisible), [isVisible]);
    useHotkeys(
        hotkeys[ReaderHotkey.CYCLE_SCALE_TYPE],
        () => {
            if (pageScaleMode.isDefault) {
                updateSetting('pageScaleMode', READER_PAGE_SCALE_MODE_VALUES[0]);
                return;
            }

            const nextValue = getNextRotationValue(
                READER_PAGE_SCALE_MODE_VALUES.indexOf(pageScaleMode.value),
                READER_PAGE_SCALE_MODE_VALUES,
                true,
            );

            if (nextValue === undefined) {
                deleteSetting('pageScaleMode');
                return;
            }

            updateSetting('pageScaleMode', nextValue);
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

    useEffect(() => {
        enableScope(HotkeyScope.READER);

        return () => disableScope(HotkeyScope.READER);
    }, []);

    return null;
};
