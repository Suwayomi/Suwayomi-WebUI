/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { IReaderSettingsWithDefaultFlag } from '@/modules/reader/types/Reader.types.ts';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';
import { ReaderSettingExitMode } from '@/modules/reader/components/settings/behaviour/ReaderSettingExitMode.tsx';
import { isOffsetDoubleSpreadPagesEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { SliderInput } from '@/modules/core/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderBehaviourSettings = ({
    settings,
    updateSetting,
}: {
    settings: IReaderSettingsWithDefaultFlag;
    updateSetting: (
        ...args: OmitFirst<Parameters<typeof ReaderService.updateSetting>>
    ) => ReturnType<typeof ReaderService.updateSetting>;
}) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderSettingExitMode
                exitMode={settings.exitMode}
                setExitMode={(value) => updateSetting('exitMode', value)}
            />
            <CheckboxInput
                label={t('reader.settings.label.skip_dup_chapters')}
                checked={settings.shouldSkipDupChapters}
                onChange={(_, checked) => updateSetting('shouldSkipDupChapters', checked)}
            />
            {isOffsetDoubleSpreadPagesEditable(settings.readingMode.value) && (
                <CheckboxInput
                    label={t('reader.settings.label.offset_double_spread')}
                    checked={settings.shouldOffsetDoubleSpreads.value}
                    onChange={(_, checked) => updateSetting('shouldOffsetDoubleSpreads', checked)}
                />
            )}
            <SliderInput
                label={t('reader.settings.image_preload_amount')}
                value={settings.imagePreLoadAmount}
                onDefault={() => updateSetting('imagePreLoadAmount', DEFAULT_READER_SETTINGS.imagePreLoadAmount, true)}
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.imagePreLoadAmount,
                        value: settings.imagePreLoadAmount,
                        step: 1,
                        min: 1,
                        max: 20,
                        onChange: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, false);
                        },
                        onChangeCommitted: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, true);
                        },
                    },
                }}
            />
        </Stack>
    );
};
