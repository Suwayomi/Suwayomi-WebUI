/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ReaderSettingReadingMode } from '@/modules/reader/components/settings/layout/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/modules/reader/components/settings/layout/ReaderSettingReadingDirection.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';

const DEFAULT_MANGA: MangaIdInfo = { id: -1 };
export const ReaderBottomBarMobileQuickSettings = () => {
    const { manga } = useReaderStateMangaContext();
    const { readingMode, readingDirection } = ReaderService.useSettings();
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? DEFAULT_MANGA);

    if (!manga) {
        return null;
    }

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderSettingReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => ReaderService.updateSetting(manga, 'readingMode', value)}
                isDefaultable
                onDefault={() => deleteSetting('readingMode')}
            />
            <ReaderSettingReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => ReaderService.updateSetting(manga, 'readingDirection', value)}
                isDefaultable
                onDefault={() => deleteSetting('readingDirection')}
            />
        </Stack>
    );
};
