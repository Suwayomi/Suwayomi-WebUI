/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { ReaderNavBarDesktopPageScale } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopPageScale.tsx';
import { ReaderNavBarDesktopReadingMode } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingMode.tsx';
import { ReaderNavBarDesktopOffsetDoubleSpread } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopOffsetDoubleSpread.tsx';
import { ReaderNavBarDesktopReadingDirection } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingDirection.tsx';
import { IReaderSettingsWithDefaultFlag, TReaderStateMangaContext } from '@/modules/reader/types/Reader.types.ts';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';

const DEFAULT_MANGA: MangaIdInfo = { id: -1 };
const BaseReaderNavBarDesktopQuickSettings = ({
    manga,
    readingMode,
    shouldOffsetDoubleSpreads,
    pageScaleMode,
    shouldStretchPage,
    readingDirection,
    openSettings,
}: Pick<TReaderStateMangaContext, 'manga'> &
    Pick<ReaderNavBarDesktopProps, 'openSettings'> &
    Pick<
        IReaderSettingsWithDefaultFlag,
        'readingMode' | 'shouldOffsetDoubleSpreads' | 'pageScaleMode' | 'shouldStretchPage' | 'readingDirection'
    >) => {
    const { t } = useTranslation();

    const updateSetting = ReaderService.useCreateUpdateSetting(manga ?? DEFAULT_MANGA);
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? DEFAULT_MANGA);

    return (
        <Stack sx={{ gap: 1 }}>
            <ReaderNavBarDesktopReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => updateSetting('readingMode', value)}
                isDefaultable
                onDefault={() => deleteSetting('readingMode')}
            />
            <ReaderNavBarDesktopOffsetDoubleSpread
                readingMode={readingMode.value}
                shouldOffsetDoubleSpreads={shouldOffsetDoubleSpreads.value}
                setShouldOffsetDoubleSpreads={(value) => updateSetting('shouldOffsetDoubleSpreads', value)}
            />
            <ReaderNavBarDesktopPageScale
                pageScaleMode={pageScaleMode}
                shouldStretchPage={shouldStretchPage}
                updateSetting={updateSetting}
                isDefaultable
                onDefault={() => deleteSetting('pageScaleMode')}
            />
            <ReaderNavBarDesktopReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => updateSetting('readingDirection', value)}
                isDefaultable
                onDefault={() => deleteSetting('readingDirection')}
            />
            <Button
                onClick={() => openSettings()}
                size="large"
                sx={{ justifyContent: 'start', textTransform: 'none' }}
                variant="contained"
                startIcon={<SettingsIcon />}
            >
                {t('reader.settings.title.reader_settings')}
            </Button>
        </Stack>
    );
};

export const ReaderNavBarDesktopQuickSettings = withPropsFrom(
    BaseReaderNavBarDesktopQuickSettings,
    [useReaderStateMangaContext, ReaderService.useSettings],
    ['manga', 'readingMode', 'shouldOffsetDoubleSpreads', 'pageScaleMode', 'shouldStretchPage', 'readingDirection'],
);
