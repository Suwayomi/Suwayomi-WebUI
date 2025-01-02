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
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import {
    IReaderSettings,
    ProgressBarPosition,
    ProgressBarPositionAutoVertical,
} from '@/modules/reader/types/Reader.types.ts';
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

const VALUE_TO_DISPLAY_DATA_AUTO_VERTICAL: ValueToDisplayData<ProgressBarPositionAutoVertical> = {
    ...VALUE_TO_DISPLAY_DATA,
    [ProgressBarPositionAutoVertical.OFF]: {
        title: 'global.label.disabled',
        icon: <NotInterestedIcon />,
    },
};

const PROGRESS_BAR_AUTO_VERTICAL_POSITION_VALUES = Object.values(ProgressBarPositionAutoVertical).filter(
    (value) => typeof value === 'number',
);

export const ReaderSettingProgressBarPosition = ({
    progressBarPosition,
    progressBarPositionAutoVertical,
    updateSetting,
}: Pick<IReaderSettings, 'progressBarPosition' | 'progressBarPositionAutoVertical'> & {
    updateSetting: <
        Position extends keyof Pick<IReaderSettings, 'progressBarPosition' | 'progressBarPositionAutoVertical'>,
    >(
        filter: Position,
        value: IReaderSettings[Position],
    ) => void;
}) => {
    const { t } = useTranslation();

    const supportsAutoVerticalPosition = progressBarPosition === ProgressBarPosition.BOTTOM;

    return (
        <>
            <ButtonSelectInput
                label={t('reader.settings.progress_bar.position')}
                value={progressBarPosition}
                values={PROGRESS_BAR_POSITION_VALUES}
                setValue={(position) => updateSetting('progressBarPosition', position)}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
            {supportsAutoVerticalPosition && (
                <ButtonSelectInput
                    label={t('reader.settings.progress_bar.auto_vertical_position.title')}
                    description={t('reader.settings.progress_bar.auto_vertical_position.description')}
                    value={progressBarPositionAutoVertical}
                    values={PROGRESS_BAR_AUTO_VERTICAL_POSITION_VALUES}
                    setValue={(position) => updateSetting('progressBarPositionAutoVertical', position)}
                    valueToDisplayData={VALUE_TO_DISPLAY_DATA_AUTO_VERTICAL}
                />
            )}
        </>
    );
};
