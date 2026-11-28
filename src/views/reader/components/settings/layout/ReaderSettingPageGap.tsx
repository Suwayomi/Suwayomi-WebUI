/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import type { IReaderSettings, IReaderSettingsWithDefaultFlag } from '@/models/reader/Reader.types.ts';
import { ReadingMode } from '@/models/reader/Reader.types.ts';
import { SliderInput } from '@/views/base/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS, PAGE_GAP } from '@/models/reader/settings/ReaderSettings.constants.tsx';
import { isContinuousReadingMode } from '@/utils/reader/settings/ReaderSettings.utils.tsx';

import type { SelectButtonDefaultableProps } from '@/views/base/components/buttons/SelectButton.tsx';

export const ReaderSettingPageGap = ({
    pageGap,
    readingMode,
    isDefaultable,
    onDefault,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'pageGap' | 'readingMode'> &
    Pick<SelectButtonDefaultableProps<IReaderSettings['pageGap']>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: (gap: number, commit: boolean) => void;
    }) => {
    const { t } = useLingui();

    const isChangeable = readingMode.value !== ReadingMode.WEBTOON && isContinuousReadingMode(readingMode.value);
    if (!isChangeable) {
        return null;
    }

    return (
        <SliderInput
            label={t`Page gap`}
            value={`${pageGap.value}${t`px`}`}
            onDefault={isDefaultable ? onDefault : undefined}
            slotProps={{
                slider: {
                    defaultValue: DEFAULT_READER_SETTINGS.pageGap,
                    value: pageGap.value,
                    step: PAGE_GAP.step,
                    min: PAGE_GAP.min,
                    max: PAGE_GAP.max,
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
