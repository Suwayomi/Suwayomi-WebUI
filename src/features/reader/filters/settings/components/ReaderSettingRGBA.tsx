/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import {
    CUSTOM_FILTER,
    DEFAULT_READER_SETTINGS,
    READER_BLEND_MODE_VALUE_TO_DISPLAY_DATA,
    READER_BLEND_MODE_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';

import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';

type RGBAType = Exclude<keyof IReaderSettings['customFilter']['rgba']['value'], 'blendMode'>;

const RGBA_TYPE_TO_TRANSLATION: Record<RGBAType, MessageDescriptor> = {
    red: msg`Red`,
    green: msg`Green`,
    blue: msg`Blue`,
    alpha: msg`Alpha`,
};

export const ReaderSettingRGBA = ({
    rgba,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'rgba'> & {
    updateSetting: <Filter extends keyof IReaderSettings['customFilter']>(
        filter: Filter,
        value: IReaderSettings['customFilter'][Filter],
        commit: boolean,
    ) => void;
}) => {
    const { t } = useLingui();

    return (
        <Stack>
            <CheckboxInput
                label={t`Custom color filters`}
                checked={rgba.enabled}
                onChange={(_, checked) => updateSetting('rgba', { ...rgba, enabled: checked }, true)}
            />
            {rgba.enabled && (
                <Stack sx={{ gap: 1 }}>
                    {Object.entries(rgba.value).map(([key, value]) => {
                        if (key === 'blendMode') {
                            return null;
                        }

                        return (
                            <SliderInput
                                key={key}
                                label={t(RGBA_TYPE_TO_TRANSLATION[key as RGBAType])}
                                value={value}
                                onDefault={() =>
                                    updateSetting(
                                        'rgba',
                                        {
                                            ...rgba,
                                            value: {
                                                ...rgba.value,
                                                [key]: DEFAULT_READER_SETTINGS.customFilter.rgba.value[key as RGBAType],
                                            },
                                        },
                                        true,
                                    )
                                }
                                slotProps={{
                                    slider: {
                                        value,
                                        defaultValue: DEFAULT_READER_SETTINGS.customFilter.rgba.value[key as RGBAType],
                                        step: CUSTOM_FILTER.rgba[key as RGBAType].step,
                                        min: CUSTOM_FILTER.rgba[key as RGBAType].min,
                                        max: CUSTOM_FILTER.rgba[key as RGBAType].max,
                                        onChange: (_, newValue) => {
                                            updateSetting(
                                                'rgba',
                                                { ...rgba, value: { ...rgba.value, [key]: newValue } },
                                                false,
                                            );
                                        },
                                        onChangeCommitted: (_, newValue) => {
                                            updateSetting(
                                                'rgba',
                                                { ...rgba, value: { ...rgba.value, [key]: newValue } },
                                                true,
                                            );
                                        },
                                    },
                                }}
                            />
                        );
                    })}
                    <ButtonSelectInput
                        label={t`Color filter blend mode`}
                        value={rgba.value.blendMode}
                        values={READER_BLEND_MODE_VALUES}
                        setValue={(value) =>
                            updateSetting(
                                'rgba',
                                {
                                    ...rgba,
                                    value: { ...rgba.value, blendMode: value },
                                },
                                true,
                            )
                        }
                        valueToDisplayData={READER_BLEND_MODE_VALUE_TO_DISPLAY_DATA}
                    />
                </Stack>
            )}
        </Stack>
    );
};
