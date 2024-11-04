/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';
import { SliderInput } from '@/modules/core/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderSettingHue = ({
    hue,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'hue'> & {
    updateSetting: <Filter extends keyof IReaderSettings['customFilter']>(
        filter: Filter,
        value: IReaderSettings['customFilter'][Filter],
        commit: boolean,
    ) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack>
            <CheckboxInput
                label={t('reader.settings.custom_filter.hue.title')}
                checked={hue.enabled}
                onChange={(_, checked) => updateSetting('hue', { ...hue, enabled: checked }, true)}
            />
            {hue.enabled && (
                <SliderInput
                    label={t('reader.settings.custom_filter.hue.value')}
                    value={hue.value}
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.customFilter.hue.value,
                            value: hue.value,
                            step: 1,
                            min: 0,
                            max: 200,
                            onChange: (_, newValue) => {
                                updateSetting('hue', { ...hue, value: newValue as number }, false);
                            },
                            onChangeCommitted: (_, newValue) => {
                                updateSetting('hue', { ...hue, value: newValue as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
