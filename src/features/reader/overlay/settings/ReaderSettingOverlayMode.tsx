/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ComputerIcon from '@mui/icons-material/Computer';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { IReaderSettings, ReaderOverlayMode } from '@/features/reader/Reader.types.ts';
import { ValueToDisplayData } from '@/base/Base.types.ts';
import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderOverlayMode> = {
    [ReaderOverlayMode.AUTO]: {
        title: msg`Auto`,
        icon: <AutoModeIcon />,
    },
    [ReaderOverlayMode.DESKTOP]: {
        title: msg`Desktop`,
        icon: <ComputerIcon />,
    },
    [ReaderOverlayMode.MOBILE]: {
        title: msg`Mobile`,
        icon: <PhoneIphoneIcon />,
    },
};

const READING_MODE_VALUES = Object.values(ReaderOverlayMode).filter((value) => typeof value === 'number');

export const ReaderSettingOverlayMode = ({
    overlayMode,
    setOverlayMode,
}: Pick<IReaderSettings, 'overlayMode'> & {
    setOverlayMode: (mode: ReaderOverlayMode) => void;
}) => {
    const { t } = useLingui();

    return (
        <ButtonSelectInput
            label={t`Overlay mode`}
            value={overlayMode}
            values={READING_MODE_VALUES}
            setValue={setOverlayMode}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
