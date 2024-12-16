/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ReaderLayoutSettings } from '@/modules/reader/components/settings/layout/ReaderLayoutSettings.tsx';
import { ReaderSettingProfileSettings } from '@/modules/reader/components/settings/layout/profiles/ReaderSettingProfileSettings.tsx';
import {
    READING_MODE_VALUE_TO_DISPLAY_DATA,
    READING_MODE_VALUES,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { ReaderSettingReadingMode } from '@/modules/reader/components/settings/layout/ReaderSettingReadingMode.tsx';

export const ReaderDefaultLayoutSettings = (
    props: Omit<ComponentProps<typeof ReaderLayoutSettings>, 'setShowPreview'>,
) => {
    const { settings, updateSetting } = props;

    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2, pb: 2 }}>
            <Stack sx={{ pt: 2, px: 2 }}>
                <ReaderSettingReadingMode
                    readingMode={settings.readingMode}
                    setReadingMode={(value) => updateSetting('readingMode', value)}
                />
            </Stack>
            {READING_MODE_VALUES.map((readingMode) => (
                <ReaderSettingProfileSettings
                    key={readingMode}
                    profile={readingMode}
                    title={t(READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode].title)}
                    {...props}
                />
            ))}
        </Stack>
    );
};
