/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import { IReaderSettings, ReadingDirection } from '@/modules/reader-deprecated/Reader.types.ts';
import {
    READING_DIRECTION_VALUES,
    READING_MODE_VALUE_TO_DISPLAY_DATA,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderNavBarDesktopReadingDirection = ({
    readingDirection,
    setReadingDirection,
}: Pick<IReaderSettings, 'readingDirection'> & {
    setReadingDirection: (readingDirection: ReadingDirection) => void;
}) => (
    <ValueRotationButton
        value={readingDirection}
        values={READING_DIRECTION_VALUES}
        setValue={setReadingDirection}
        valueToDisplayData={READING_MODE_VALUE_TO_DISPLAY_DATA}
    />
);
