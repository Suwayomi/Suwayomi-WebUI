/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { IReaderSettings, IReaderSettingsWithDefaultFlag, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { SliderInput } from '@/modules/core/components/inputs/SliderInput.tsx';
import {
    DEFAULT_READER_SETTINGS,
    SWIPE_PREVIEW_THRESHOLD,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';

export const ReaderSettingSwipePreviewThreshold = ({
    swipePreviewThreshold,
    readingMode,
    isDefaultable,
    onDefault,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'swipePreviewThreshold' | 'readingMode'> &
    Pick<MultiValueButtonDefaultableProps<IReaderSettings['swipePreviewThreshold']>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: (threshold: number, commit: boolean) => void;
    }) => {
    const { t } = useTranslation();

    // 只在单页阅读模式下显示此设置
    const isChangeable = readingMode.value === ReadingMode.SINGLE_PAGE;
    if (!isChangeable) {
        return null;
    }

    return (
        <SliderInput
            label={t('reader.settings.label.swipe_preview_threshold')}
            value={t('global.value', { value: swipePreviewThreshold.value, unit: '%' })}
            onDefault={isDefaultable ? onDefault : undefined}
            slotProps={{
                slider: {
                    defaultValue: DEFAULT_READER_SETTINGS.swipePreviewThreshold,
                    value: swipePreviewThreshold.value,
                    step: SWIPE_PREVIEW_THRESHOLD.step,
                    min: SWIPE_PREVIEW_THRESHOLD.min,
                    max: SWIPE_PREVIEW_THRESHOLD.max,
                    onChange: (_, value) => {
                        updateSetting(value as number, false);
                    },
                    onChangeCommitted: (_, value) => {
                        updateSetting(value as number, true);
                    },
                },
            }}
        />
    );
};
