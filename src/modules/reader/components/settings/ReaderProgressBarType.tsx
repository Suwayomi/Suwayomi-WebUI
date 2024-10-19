/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IReaderSettings, ProgressBarType } from '@/modules/reader-deprecated/Reader.types.ts';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';
import { ButtonSelect } from '@/modules/core/components/buttons/ButtonSelect.tsx';
import { HiddenProgressBarIcon } from '@/assets/icons/svg/HiddenProgressBarIcon.tsx';
import { StandardProgressBarIcon } from '@/assets/icons/svg/StandardProgressBarIcon.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ProgressBarType> = {
    [ProgressBarType.HIDDEN]: {
        title: 'global.label.hidden',
        icon: <HiddenProgressBarIcon />,
    },
    [ProgressBarType.STANDARD]: {
        title: 'global.label.standard',
        icon: <StandardProgressBarIcon />,
    },
};

const PROGRESS_BAR_TYPE_VALUES = Object.values(ProgressBarType).filter((value) => typeof value === 'number');

export const ReaderProgressBarType = ({
    progressBarType,
    setProgressBarType,
}: Pick<IReaderSettings, 'progressBarType'> & {
    setProgressBarType: (progressBarType: ProgressBarType) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack>
            <Typography>{t('reader.settings.label.reading_direction')}</Typography>
            <ButtonSelect
                value={progressBarType}
                values={PROGRESS_BAR_TYPE_VALUES}
                setValue={setProgressBarType}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
        </Stack>
    );
};
