/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IReaderSettings, IReaderSettingsWithDefaultFlag } from '@/modules/reader/types/Reader.types.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { READING_MODE_VALUE_TO_DISPLAY_DATA } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { TranslationKey } from '@/Base.types.ts';
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';

const HIDE_PREVIEW_TIMEOUT = 5000;

export const useReaderShowSettingPreviewOnChange = (
    isLoading: boolean,
    error: any,
    areSettingsSet: boolean,
    readingMode: IReaderSettingsWithDefaultFlag['readingMode'],
    tapZoneLayout: IReaderSettingsWithDefaultFlag['tapZoneLayout'],
    tapZoneInvertMode: IReaderSettingsWithDefaultFlag['tapZoneInvertMode'],
    shouldShowReadingModePreview: IReaderSettings['shouldShowReadingModePreview'],
    shouldShowTapZoneLayoutPreview: IReaderSettings['shouldShowTapZoneLayoutPreview'],
    setShowPreview: TReaderTapZoneContext['setShowPreview'],
) => {
    const { t } = useTranslation();

    // show setting previews on change or when open reader
    const previousReadingMode = useRef<IReaderSettingsWithDefaultFlag['readingMode']>();
    const previousTapZoneLayout = useRef<IReaderSettingsWithDefaultFlag['tapZoneLayout']>();
    const previousTapZoneInvertMode = useRef<IReaderSettingsWithDefaultFlag['tapZoneInvertMode']>();
    const isInitialPreview = useRef(true);

    useEffect(() => {
        if (isLoading || error || !areSettingsSet) {
            return;
        }

        const didReadingModeChange = JSON.stringify(readingMode) !== JSON.stringify(previousReadingMode.current);
        const showReadingModePreview = shouldShowReadingModePreview && didReadingModeChange;
        if (showReadingModePreview) {
            makeToast(t(READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode.value].title as TranslationKey), {
                autoHideDuration: HIDE_PREVIEW_TIMEOUT,
            });
        }
        previousReadingMode.current = readingMode;

        const didTapZoneLayoutChange =
            JSON.stringify(tapZoneLayout) !== JSON.stringify(previousTapZoneLayout.current) ||
            JSON.stringify(tapZoneInvertMode) !== JSON.stringify(previousTapZoneInvertMode.current);
        const showTapZoneLayoutPreview = shouldShowTapZoneLayoutPreview && didTapZoneLayoutChange;
        if (showTapZoneLayoutPreview) {
            setShowPreview(true);
            if (isInitialPreview.current) {
                setTimeout(() => setShowPreview(false), HIDE_PREVIEW_TIMEOUT);
            }
        }
        previousTapZoneLayout.current = tapZoneLayout;
        previousTapZoneInvertMode.current = tapZoneInvertMode;

        isInitialPreview.current = false;
    }, [
        isLoading,
        error,
        areSettingsSet,
        readingMode.value,
        readingMode.isDefault,
        tapZoneLayout.value,
        tapZoneLayout.isDefault,
        tapZoneInvertMode.value,
        tapZoneInvertMode.isDefault,
    ]);
};
