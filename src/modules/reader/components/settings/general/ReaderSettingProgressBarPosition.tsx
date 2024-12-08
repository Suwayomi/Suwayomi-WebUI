/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { IReaderSettings, ProgressBarPosition, ReaderOverlayMode } from '@/modules/reader/types/Reader.types.ts';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';
import { ButtonSelectInput } from '@/modules/core/components/inputs/ButtonSelectInput.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ProgressBarPosition> = {
    [ProgressBarPosition.BOTTOM]: {
        title: 'global.label.bottom',
        icon: <ArrowBackIosNewIcon sx={{ transform: 'rotate(90deg)' }} />,
    },
    [ProgressBarPosition.LEFT]: {
        title: 'global.label.left',
        icon: <ArrowForwardIosIcon />,
    },
    [ProgressBarPosition.RIGHT]: {
        title: 'global.label.right',
        icon: <ArrowBackIosNewIcon />,
    },
};

const PROGRESS_BAR_POSITION_VALUES = Object.values(ProgressBarPosition).filter((value) => typeof value === 'number');

export const ReaderSettingProgressBarPosition = ({
    overlayMode,
    progressBarPosition,
    setProgressBarPosition,
}: Pick<IReaderSettings, 'progressBarPosition' | 'overlayMode'> & {
    setProgressBarPosition: (position: ProgressBarPosition) => void;
}) => {
    const { t } = useTranslation();

    if (overlayMode !== ReaderOverlayMode.DESKTOP) {
        return null;
    }

    return (
        <ButtonSelectInput
            label={t('reader.settings.progress_bar.position')}
            value={progressBarPosition}
            values={PROGRESS_BAR_POSITION_VALUES}
            setValue={setProgressBarPosition}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
