/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { IReaderSettingsWithDefaultFlag, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { SliderInput } from '@/modules/core/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderSettingPageGap = ({
    pageGap,
    readingMode,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'pageGap' | 'readingMode'> & {
    updateSetting: (gap: number, commit: boolean) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack>
            {[ReadingMode.CONTINUOUS_HORIZONTAL, ReadingMode.CONTINUOUS_VERTICAL].includes(readingMode.value) && (
                <SliderInput
                    label={t('reader.settings.label.page_gap')}
                    value={t('global.value', { value: pageGap.value, unit: t('global.unit.px') })}
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.readerWidth.value,
                            value: pageGap.value,
                            step: 1,
                            min: 0,
                            max: 20,
                            onChange: (_, value) => {
                                updateSetting(value as number, false);
                            },
                            onChangeCommitted: (_, value) => {
                                updateSetting(value as number, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
