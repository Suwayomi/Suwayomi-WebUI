/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { ValueRotationButton } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ValueRotationButton.tsx';

enum ReadingDirection {
    LTR,
    RTL,
}

export const ReaderNavBarDesktopReadingDirection = () => {
    const [readingDirection, setReadingDirection] = useState<ReadingDirection>(ReadingDirection.LTR);

    return (
        <ValueRotationButton
            value={readingDirection}
            values={Object.values(ReadingDirection).filter((value) => typeof value === 'number')}
            setValue={setReadingDirection}
            valueToDisplayData={{
                [ReadingDirection.LTR]: {
                    title: 'reader.settings.reading_direction.rtl',
                    icon: <ArrowCircleLeftIcon />,
                },
                [ReadingDirection.RTL]: {
                    title: 'reader.settings.reading_direction.ltr',
                    icon: <ArrowCircleRightIcon />,
                },
            }}
        />
    );
};
