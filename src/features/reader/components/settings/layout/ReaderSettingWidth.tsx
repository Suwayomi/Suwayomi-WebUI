/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { IReaderSettings } from '@/features/reader/types/Reader.types.ts';
import { CheckboxInput } from '@/features/core/components/inputs/CheckboxInput.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { SliderInput } from '@/features/core/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS } from '@/features/reader/constants/ReaderSettings.constants.tsx';
import { isReaderWidthEditable } from '@/features/reader/utils/ReaderSettings.utils.tsx';
import { MultiValueButtonDefaultableProps } from '@/features/core/Core.types.ts';
import { ResetButton } from '@/features/core/components/buttons/ResetButton.tsx';

export const ReaderSettingWidth = ({
    readerWidth,
    pageScaleMode,
    isDefaultable,
    onDefault,
    updateSetting,
    setTransparent,
}: Pick<IReaderSettings, 'readerWidth' | 'pageScaleMode'> &
    Pick<MultiValueButtonDefaultableProps<IReaderSettings['readerWidth']['value']>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: (...args: OmitFirst<Parameters<typeof ReaderService.updateSetting>>) => void;
        setTransparent?: (transparent: boolean) => void;
    }) => {
    const { t } = useTranslation();

    if (!isReaderWidthEditable(pageScaleMode)) {
        return null;
    }

    return (
        <Stack>
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <CheckboxInput
                    label={t('reader.settings.label.limit_reader_width')}
                    checked={readerWidth.enabled}
                    onChange={(_, checked) => updateSetting('readerWidth', { ...readerWidth, enabled: checked }, true)}
                />
                {isDefaultable && <ResetButton onClick={onDefault} variant="outlined" />}
            </Stack>
            {readerWidth.enabled && (
                <SliderInput
                    label={t('reader.settings.label.reader_width')}
                    value={t('global.value', { value: readerWidth.value, unit: '%' })}
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.readerWidth.value,
                            value: readerWidth.value,
                            step: 1,
                            min: 10,
                            max: 100,
                            onChange: (_, value) => {
                                setTransparent?.(true);
                                updateSetting('readerWidth', { ...readerWidth, value: value as number }, false);
                            },
                            onChangeCommitted: (_, value) => {
                                setTransparent?.(false);
                                updateSetting('readerWidth', { ...readerWidth, value: value as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
