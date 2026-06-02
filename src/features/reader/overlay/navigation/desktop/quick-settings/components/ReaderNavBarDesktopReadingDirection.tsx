/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import type { IReaderSettingsWithDefaultFlag, ReadingDirection } from '@/features/reader/Reader.types.ts';
import {
    READING_DIRECTION_VALUES,
    READING_DIRECTION_VALUE_TO_DISPLAY_DATA,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';

import type { SelectButtonDefaultableProps } from '@/base/components/buttons/SelectButton.tsx';
import { SelectButton } from '@/base/components/buttons/SelectButton.tsx';

export const ReaderNavBarDesktopReadingDirection = ({
    readingDirection,
    setReadingDirection,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'readingDirection'> &
    Pick<SelectButtonDefaultableProps<ReadingDirection>, 'isDefaultable' | 'onDefault'> & {
        setReadingDirection: (readingDirection: ReadingDirection) => void;
    }) => {
    const { t } = useLingui();

    return (
        <SelectButton
            {...buttonSelectInputProps}
            tooltip={t`Reading direction`}
            value={readingDirection.isDefault ? undefined : readingDirection.value}
            defaultValue={readingDirection.isDefault ? readingDirection.value : undefined}
            values={READING_DIRECTION_VALUES}
            setValue={setReadingDirection}
            valueToDisplayData={READING_DIRECTION_VALUE_TO_DISPLAY_DATA}
            defaultIcon={READING_DIRECTION_VALUE_TO_DISPLAY_DATA[readingDirection.value].icon}
            isCollapsible
        />
    );
};
