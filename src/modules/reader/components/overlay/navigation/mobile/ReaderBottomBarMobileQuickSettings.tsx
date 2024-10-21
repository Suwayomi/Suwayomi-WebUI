/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ReaderReadingMode } from '@/modules/reader/components/settings/ReaderReadingMode.tsx';
import { ReaderReadingDirection } from '@/modules/reader/components/settings/ReaderReadingDirection.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';

export const ReaderBottomBarMobileQuickSettings = () => {
    const { manga } = useReaderStateMangaContext();
    const { readingMode, readingDirection } = ReaderService.useSettings();

    if (!manga) {
        return null;
    }

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => ReaderService.updateSetting(manga, 'readingMode', value)}
            />
            <ReaderReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => ReaderService.updateSetting(manga, 'readingDirection', value)}
            />
        </Stack>
    );
};
