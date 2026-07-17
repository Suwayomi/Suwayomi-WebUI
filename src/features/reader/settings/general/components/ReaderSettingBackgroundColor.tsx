/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import type { ValueToDisplayData } from '@/base/Base.types.ts';
import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';
import type { IReaderSettingsWithDefaultFlag } from '@/features/reader/Reader.types.ts';
import { ReaderBackgroundColor } from '@/features/reader/Reader.types.ts';
import type { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderBackgroundColor> = {
    [ReaderBackgroundColor.THEME]: {
        title: msg`Theme`,
        icon: null,
    },
    [ReaderBackgroundColor.BLACK]: {
        title: msg`Black`,
        icon: null,
    },
    [ReaderBackgroundColor.GRAY]: {
        title: msg`Gray`,
        icon: null,
    },
    [ReaderBackgroundColor.WHITE]: {
        title: msg`White`,
        icon: null,
    },
    [ReaderBackgroundColor.AUTO]: {
        title: msg`Auto`,
        icon: null,
    },
};

const READER_BACKGROUND_COLOR_VALUES = Object.values(ReaderBackgroundColor).filter(
    (value) => typeof value === 'number',
);

export const ReaderSettingBackgroundColor = ({
    backgroundColor,
    useAutoBackgroundColorContinuousMode,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'backgroundColor' | 'useAutoBackgroundColorContinuousMode'> & {
    updateSetting: (...args: Parameters<typeof ReaderService.updateSetting>) => void;
}) => {
    const { t } = useLingui();

    return (
        <>
            <ButtonSelectInput
                label={t`Background color`}
                value={backgroundColor}
                values={READER_BACKGROUND_COLOR_VALUES}
                setValue={(value) => updateSetting('backgroundColor', value)}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
            {backgroundColor === ReaderBackgroundColor.AUTO && (
                <CheckboxInput
                    label={t`Enable auto background color in continuous reading mode`}
                    checked={useAutoBackgroundColorContinuousMode}
                    onChange={(_, checked) => updateSetting('useAutoBackgroundColorContinuousMode', checked)}
                />
            )}
        </>
    );
};
