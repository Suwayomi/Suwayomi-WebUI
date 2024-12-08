/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import { IReaderSettingsWithDefaultFlag, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import {
    READING_DIRECTION_VALUES,
    READING_DIRECTION_VALUE_TO_DISPLAY_DATA,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';

export const ReaderNavBarDesktopReadingDirection = ({
    readingDirection,
    setReadingDirection,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'readingDirection'> &
    Pick<MultiValueButtonDefaultableProps<ReadingDirection>, 'isDefaultable' | 'onDefault'> & {
        setReadingDirection: (readingDirection: ReadingDirection) => void;
    }) => (
    <ValueRotationButton
        {...buttonSelectInputProps}
        value={readingDirection.isDefault ? undefined : readingDirection.value}
        values={READING_DIRECTION_VALUES}
        setValue={setReadingDirection}
        valueToDisplayData={READING_DIRECTION_VALUE_TO_DISPLAY_DATA}
        defaultIcon={READING_DIRECTION_VALUE_TO_DISPLAY_DATA[readingDirection.value].icon}
    />
);
