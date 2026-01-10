/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { ValueToDisplayData } from '@/base/Base.types.ts';
import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';
import { IReaderSettingsWithDefaultFlag, ReaderBackgroundColor } from '@/features/reader/Reader.types.ts';

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
};

const READER_BACKGROUND_COLOR_VALUES = Object.values(ReaderBackgroundColor).filter(
    (value) => typeof value === 'number',
);

export const ReaderSettingBackgroundColor = ({
    backgroundColor,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'backgroundColor'> & {
    updateSetting: (color: ReaderBackgroundColor) => void;
}) => {
    const { t } = useLingui();

    return (
        <ButtonSelectInput
            label={t`Background color`}
            value={backgroundColor}
            values={READER_BACKGROUND_COLOR_VALUES}
            setValue={updateSetting}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
