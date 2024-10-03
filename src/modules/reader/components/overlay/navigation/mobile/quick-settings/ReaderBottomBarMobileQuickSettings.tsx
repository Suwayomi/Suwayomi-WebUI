/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { ReaderBottomBarMobileReadingMode } from '@/modules/reader/components/overlay/navigation/mobile/quick-settings/ReaderBottomBarMobileReadingMode.tsx';
import { ReaderBottomBarMobileReadingDirection } from '@/modules/reader/components/overlay/navigation/mobile/quick-settings/ReaderBottomBarMobileReadingDirection.tsx';
import { createUpdateReaderSettings } from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';

export const ReaderBottomBarMobileQuickSettings = () => {
    const { t } = useTranslation();

    const { manga } = useReaderStateMangaContext();
    const { readingMode, readingDirection } = ReaderService.useSettings();

    const updateReaderSettings = createUpdateReaderSettings<
        keyof Pick<IReaderSettings, 'readingMode' | 'readingDirection'>
    >(manga ?? { id: -1 }, () => makeToast(t('reader.settings.error.label.failed_to_save_settings')));

    if (!manga) {
        return null;
    }

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderBottomBarMobileReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => updateReaderSettings('readingMode', value)}
            />
            <ReaderBottomBarMobileReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => updateReaderSettings('readingDirection', value)}
            />
        </Stack>
    );
};
