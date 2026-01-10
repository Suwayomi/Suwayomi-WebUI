/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { TapZoneLayouts } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';
import { MultiValueButtonDefaultableProps, ValueToDisplayData } from '@/base/Base.types.ts';
import { IReaderSettingsWithDefaultFlag, ReadingDirection } from '@/features/reader/Reader.types.ts';
import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<TapZoneLayouts> = {
    [TapZoneLayouts.EDGE]: {
        title: msg`Edge`,
        icon: null,
    },
    [TapZoneLayouts.KINDLE]: {
        title: msg`Kindle`,
        icon: null,
    },
    [TapZoneLayouts.L_SHAPE]: {
        title: msg`L-Shape`,
        icon: null,
    },
    [TapZoneLayouts.RIGHT_LEFT]: {
        title: msg`Right and left`,
        icon: null,
    },
    [TapZoneLayouts.DISABLED]: {
        title: msg`Disabled`,
        icon: null,
    },
};

const READER_TAP_ZONE_LAYOUT_VALUES = Object.values(TapZoneLayouts).filter((value) => typeof value === 'number');

export const ReaderSettingTapZoneLayout = ({
    tapZoneLayout,
    setTapZoneLayout,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'tapZoneLayout'> &
    Pick<MultiValueButtonDefaultableProps<ReadingDirection>, 'isDefaultable' | 'onDefault'> & {
        setTapZoneLayout: (layout: TapZoneLayouts) => void;
    }) => {
    const { t } = useLingui();

    return (
        <ButtonSelectInput
            {...buttonSelectInputProps}
            label={t`Tap zones`}
            value={tapZoneLayout.isDefault ? undefined : tapZoneLayout.value}
            defaultValue={tapZoneLayout.isDefault ? tapZoneLayout.value : undefined}
            values={READER_TAP_ZONE_LAYOUT_VALUES}
            setValue={setTapZoneLayout}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
