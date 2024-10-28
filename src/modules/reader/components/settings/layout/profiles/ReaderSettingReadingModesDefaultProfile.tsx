/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import {
    READING_MODE_VALUE_TO_DISPLAY_DATA,
    READING_MODE_VALUES,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { ButtonSelectInput } from '@/modules/core/components/inputs/ButtonSelectInput.tsx';
import { createProfileValueToDisplayData } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

export const ReaderSettingReadingModesDefaultProfile = ({
    profiles,
    readingModesDefaultProfile,
    updateSetting,
}: Pick<IReaderSettings, 'profiles' | 'readingModesDefaultProfile'> & {
    updateSetting: (readingModesDefaultProfile: IReaderSettings['readingModesDefaultProfile']) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2 }}>
            <Typography>Reading mode default profile</Typography>
            {READING_MODE_VALUES.map((readingMode) => (
                <Stack key={readingMode} sx={{ gap: 1 }}>
                    <ButtonSelectInput
                        label={t(READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode].title)}
                        value={readingModesDefaultProfile[readingMode]}
                        values={profiles}
                        setValue={(profile) =>
                            updateSetting({
                                ...readingModesDefaultProfile,
                                [readingMode]: profile,
                            })
                        }
                        valueToDisplayData={createProfileValueToDisplayData(profiles)}
                    />
                </Stack>
            ))}
        </Stack>
    );
};
