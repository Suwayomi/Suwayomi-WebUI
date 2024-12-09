/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import { IReaderSettingsWithDefaultFlag, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import {
    READING_MODE_VALUE_TO_DISPLAY_DATA,
    READING_MODE_VALUES,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';

export const ReaderNavBarDesktopReadingMode = ({
    readingMode,
    setReadingMode,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'readingMode'> &
    Pick<MultiValueButtonDefaultableProps<ReadingMode>, 'isDefaultable' | 'onDefault'> & {
        setReadingMode: (mode: ReadingMode) => void;
    }) => {
    const { t } = useTranslation();

    return (
        <ValueRotationButton
            {...buttonSelectInputProps}
            tooltip={t('reader.settings.label.reading_mode')}
            value={readingMode.isDefault ? undefined : readingMode.value}
            values={READING_MODE_VALUES}
            setValue={setReadingMode}
            valueToDisplayData={READING_MODE_VALUE_TO_DISPLAY_DATA}
            defaultIcon={READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode.value].icon}
        />
    );
};
