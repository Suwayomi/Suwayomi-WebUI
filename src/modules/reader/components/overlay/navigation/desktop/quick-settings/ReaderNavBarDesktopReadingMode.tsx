/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { SinglePageIcon } from '@/assets/icons/svg/SinglePageIcon.tsx';
import { DoublePageIcon } from '@/assets/icons/svg/DoublePageIcon.tsx';
import { ContinuousVerticalPageIcon } from '@/assets/icons/svg/ContinuousVerticalPageIcon.tsx';
import { ContinuousHorizontalPageIcon } from '@/assets/icons/svg/ContinuousHorizontalPageIcon.tsx';
import { ValueRotationButton } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ValueRotationButton.tsx';

enum ReadingMode {
    SINGLE_PAGE,
    DOUBLE_PAGE,
    CONTINUOUS_VERTICAL,
    CONTINUOUS_HORIZONTAL,
}

export const ReaderNavBarDesktopReadingMode = () => {
    const [readingMode, setReadingMode] = useState<ReadingMode>(ReadingMode.SINGLE_PAGE);

    return (
        <ValueRotationButton
            value={readingMode}
            values={Object.values(ReadingMode).filter((value) => typeof value === 'number')}
            setValue={setReadingMode}
            valueToDisplayData={{
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
            }}
        />
    );
};
