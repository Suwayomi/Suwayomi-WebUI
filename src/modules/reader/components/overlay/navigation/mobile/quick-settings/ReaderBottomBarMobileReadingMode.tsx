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
import { IReaderSettings, ReadingMode } from '@/modules/reader-deprecated/Reader.types.ts';
import { SinglePageIcon } from '@/assets/icons/svg/SinglePageIcon.tsx';
import { DoublePageIcon } from '@/assets/icons/svg/DoublePageIcon.tsx';
import { ContinuousVerticalPageIcon } from '@/assets/icons/svg/ContinuousVerticalPageIcon.tsx';
import { ContinuousHorizontalPageIcon } from '@/assets/icons/svg/ContinuousHorizontalPageIcon.tsx';
import { ButtonSelect } from '@/modules/core/components/buttons/ButtonSelect.tsx';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReadingMode> = {
    [ReadingMode.SINGLE_PAGE]: {
        title: 'reader.settings.reader_type.label.single_page',
        icon: <SinglePageIcon />,
    },
    [ReadingMode.DOUBLE_PAGE]: {
        title: 'reader.settings.reader_type.label.double_page',
        icon: <DoublePageIcon />,
    },
    [ReadingMode.CONTINUOUS_VERTICAL]: {
        title: 'reader.settings.reader_type.label.continuous_horizontal',
        icon: <ContinuousVerticalPageIcon />,
    },
    [ReadingMode.CONTINUOUS_HORIZONTAL]: {
        title: 'reader.settings.reader_type.label.continuous_vertical',
        icon: <ContinuousHorizontalPageIcon />,
    },
};

const READING_MODE_VALUES = Object.values(ReadingMode).filter((value) => typeof value === 'number');

export const ReaderBottomBarMobileReadingMode = ({
    readingMode,
    setReadingMode,
}: Pick<IReaderSettings, 'readingMode'> & {
    setReadingMode: (mode: ReadingMode) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack>
            <Typography>{t('reader.settings.label.reading_mode')}</Typography>
            <ButtonSelect
                value={readingMode}
                values={READING_MODE_VALUES}
                setValue={setReadingMode}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
        </Stack>
    );
};
