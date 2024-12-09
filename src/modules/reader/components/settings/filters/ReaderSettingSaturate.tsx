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

export const ReaderSettingSaturate = ({
    saturate,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'saturate'> & {
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
                label={t('reader.settings.custom_filter.saturate')}
                checked={saturate.enabled}
                onChange={(_, checked) => updateSetting('saturate', { ...saturate, enabled: checked }, true)}
            />
            {saturate.enabled && (
                <SliderInput
                    label={t('reader.settings.custom_filter.saturate')}
                    value={saturate.value}
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.customFilter.saturate.value,
                            value: saturate.value,
                            step: 1,
                            min: 0,
                            max: 200,
                            onChange: (_, value) => {
                                updateSetting('saturate', { ...saturate, value: value as number }, false);
                            },
                            onChangeCommitted: (_, value) => {
                                updateSetting('saturate', { ...saturate, value: value as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
