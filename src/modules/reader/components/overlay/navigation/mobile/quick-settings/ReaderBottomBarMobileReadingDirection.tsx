/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { useTranslation } from 'react-i18next';
import { IReaderSettings, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';
import { ButtonSelectInput } from '@/modules/core/components/inputs/ButtonSelectInput.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReadingDirection> = {
    [ReadingDirection.LTR]: {
        title: 'reader.settings.reading_direction.ltr',
        icon: <ArrowCircleRightIcon />,
    },
    [ReadingDirection.RTL]: {
        title: 'reader.settings.reading_direction.rtl',
        icon: <ArrowCircleLeftIcon />,
    },
};

const READING_DIRECTION_VALUES = Object.values(ReadingDirection).filter((value) => typeof value === 'number');

export const ReaderBottomBarMobileReadingDirection = ({
    readingDirection,
    setReadingDirection,
}: Pick<IReaderSettings, 'readingDirection'> & {
    setReadingDirection: (readingDirection: ReadingDirection) => void;
}) => {
    const { t } = useTranslation();

    return (
        <ButtonSelectInput
            label={t('reader.settings.label.reading_direction')}
            value={readingDirection}
            values={READING_DIRECTION_VALUES}
            setValue={setReadingDirection}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
