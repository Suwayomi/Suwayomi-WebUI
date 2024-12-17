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

export const ReaderSettingBrightness = ({
    brightness,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'brightness'> & {
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
                label={t('reader.settings.custom_filter.brightness')}
                checked={brightness.enabled}
                onChange={(_, checked) => updateSetting('brightness', { ...brightness, enabled: checked }, true)}
            />
            {brightness.enabled && (
                <SliderInput
                    label={t('reader.settings.custom_filter.brightness')}
                    value={brightness.value}
                    onDefault={() =>
                        updateSetting(
                            'brightness',
                            { ...brightness, value: DEFAULT_READER_SETTINGS.customFilter.brightness.value },
                            true,
                        )
                    }
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.customFilter.brightness.value,
                            value: brightness.value,
                            step: 1,
                            min: 5,
                            max: 200,
                            onChange: (_, value) => {
                                updateSetting('brightness', { ...brightness, value: value as number }, false);
                            },
                            onChangeCommitted: (_, value) => {
                                updateSetting('brightness', { ...brightness, value: value as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
