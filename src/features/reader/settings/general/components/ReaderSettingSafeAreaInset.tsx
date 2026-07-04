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
import type { IReaderSettingsWithDefaultFlag, SafeAreaInset } from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS } from '@/features/reader/settings/ReaderSettings.constants.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<keyof SafeAreaInset> = {
    top: {
        title: msg`Top`,
        icon: null,
    },
    right: {
        title: msg`Right`,
        icon: null,
    },
    bottom: {
        title: msg`Bottom`,
        icon: null,
    },
    left: {
        title: msg`Left`,
        icon: null,
    },
};

const READER_SAFE_AREA_INSET_VALUES = Object.keys(DEFAULT_READER_SETTINGS.safeAreaInset) as (keyof SafeAreaInset)[];

export const ReaderSettingSafeAreaInset = ({
    safeAreaInset,
    updateSetting,
}: Pick<IReaderSettingsWithDefaultFlag, 'safeAreaInset'> & {
    updateSetting: (safeAreaInset: SafeAreaInset) => void;
}) => {
    const { t } = useLingui();

    return (
        <ButtonSelectInput
            label={t`Apply safe area padding`}
            description={t`Prevents content from overlapping device cutouts and screen edges`}
            value={Object.entries(safeAreaInset)
                .filter(([, enabled]) => enabled)
                .map(([key]) => key as keyof SafeAreaInset)}
            values={READER_SAFE_AREA_INSET_VALUES}
            setValue={(values) =>
                updateSetting(
                    Object.fromEntries(
                        READER_SAFE_AREA_INSET_VALUES.map((key) => [key, values.includes(key)]),
                    ) as unknown as SafeAreaInset,
                )
            }
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
