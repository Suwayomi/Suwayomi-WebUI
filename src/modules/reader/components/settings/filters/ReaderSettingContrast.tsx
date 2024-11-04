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

export const ReaderSettingContrast = ({
    contrast,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'contrast'> & {
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
                label={t('reader.settings.custom_filter.contrast.title')}
                checked={contrast.enabled}
                onChange={(_, checked) => updateSetting('contrast', { ...contrast, enabled: checked }, true)}
            />
            {contrast.enabled && (
                <SliderInput
                    label={t('reader.settings.custom_filter.contrast.value')}
                    value={contrast.value}
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.customFilter.contrast.value,
                            value: contrast.value,
                            step: 1,
                            min: 5,
                            max: 200,
                            onChange: (_, newValue) => {
                                updateSetting('contrast', { ...contrast, value: newValue as number }, false);
                            },
                            onChangeCommitted: (_, newValue) => {
                                updateSetting('contrast', { ...contrast, value: newValue as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
