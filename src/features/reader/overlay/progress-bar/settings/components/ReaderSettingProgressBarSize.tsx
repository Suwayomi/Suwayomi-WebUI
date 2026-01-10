/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { IReaderSettings, ProgressBarType, ReaderOverlayMode } from '@/features/reader/Reader.types.ts';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS, PROGRESS_BAR_SIZE } from '@/features/reader/settings/ReaderSettings.constants.tsx';

export const ReaderSettingProgressBarSize = ({
    overlayMode,
    progressBarType,
    progressBarSize,
    setProgressBarSize,
    onDefault,
}: Pick<IReaderSettings, 'progressBarType' | 'progressBarSize' | 'overlayMode'> & {
    setProgressBarSize: (size: number, commit: boolean) => void;
    onDefault: () => void;
}) => {
    const { t } = useLingui();
    const isChangeable = overlayMode === ReaderOverlayMode.DESKTOP && progressBarType === ProgressBarType.STANDARD;

    if (!isChangeable) {
        return null;
    }

    return (
        <SliderInput
            label={t`Progress bar size`}
            value={`${progressBarSize}${t`px`}`}
            onDefault={onDefault}
            slotProps={{
                slider: {
                    defaultValue: DEFAULT_READER_SETTINGS.progressBarSize,
                    value: progressBarSize,
                    step: PROGRESS_BAR_SIZE.step,
                    min: PROGRESS_BAR_SIZE.min,
                    max: PROGRESS_BAR_SIZE.max,
                    onChange: (_, value) => {
                        setProgressBarSize(value as number, false);
                    },
                    onChangeCommitted: (_, value) => {
                        setProgressBarSize(value as number, true);
                    },
                },
            }}
        />
    );
};
