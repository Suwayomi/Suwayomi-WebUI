/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { IReaderSettings, ProgressBarType } from '@/modules/reader-deprecated/Reader.types.ts';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader-deprecated/Reader.constants.ts';

export const ProgressBarSize = ({
    progressBarType,
    progressBarSize,
    setProgressBarSize,
}: Pick<IReaderSettings, 'progressBarType' | 'progressBarSize'> & {
    setProgressBarSize: (size: number, commit: boolean) => void;
}) => {
    const { t } = useTranslation();
    const isChangeable = progressBarType === ProgressBarType.STANDARD;

    if (!isChangeable) {
        return null;
    }

    return (
        <Stack sx={{ flexDirection: 'column' }}>
            <Typography>{t('reader.settings.progress_bar.size', { value: progressBarSize })}</Typography>
            <Slider
                defaultValue={DEFAULT_READER_SETTINGS.progressBarSize}
                value={progressBarSize}
                step={1}
                min={2}
                max={20}
                onChange={(_, value) => {
                    setProgressBarSize(value as number, false);
                }}
                onChangeCommitted={(_, value) => {
                    setProgressBarSize(value as number, true);
                }}
            />
        </Stack>
    );
};
