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
import { ReaderNavBarDesktopPageScale } from '@/features/reader/overlay/navigation/desktop/quick-settings/components/ReaderNavBarDesktopPageScale.tsx';
import { ReaderNavBarDesktopReadingMode } from '@/features/reader/overlay/navigation/desktop/quick-settings/components/ReaderNavBarDesktopReadingMode.tsx';
import { ReaderNavBarDesktopOffsetDoubleSpread } from '@/features/reader/overlay/navigation/desktop/quick-settings/components/ReaderNavBarDesktopOffsetDoubleSpread.tsx';
import { ReaderNavBarDesktopReadingDirection } from '@/features/reader/overlay/navigation/desktop/quick-settings/components/ReaderNavBarDesktopReadingDirection.tsx';
import { IReaderSettingsWithDefaultFlag, TReaderStateMangaContext } from '@/features/reader/Reader.types.ts';
import { ReaderNavBarDesktopProps } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useReaderStateMangaContext } from '@/features/reader/contexts/state/ReaderStateMangaContext.tsx';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';
import { ReaderNavBarDesktopAutoScroll } from '@/features/reader/auto-scroll/settings/quick-setting/ReaderNavBarDesktopAutoScroll.tsx';

const BaseReaderNavBarDesktopQuickSettings = ({
    manga,
    readingMode,
    shouldOffsetDoubleSpreads,
    pageScaleMode,
    shouldStretchPage,
    readingDirection,
    autoScroll,
    openSettings,
}: Pick<TReaderStateMangaContext, 'manga'> &
    Pick<ReaderNavBarDesktopProps, 'openSettings'> &
    Pick<
        IReaderSettingsWithDefaultFlag,
        | 'readingMode'
        | 'shouldOffsetDoubleSpreads'
        | 'pageScaleMode'
        | 'shouldStretchPage'
        | 'readingDirection'
        | 'autoScroll'
    >) => {
    const { t } = useTranslation();

    const updateSetting = ReaderService.useCreateUpdateSetting(manga ?? FALLBACK_MANGA);
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? FALLBACK_MANGA);

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
            <ReaderNavBarDesktopAutoScroll
                autoScroll={autoScroll}
                setAutoScroll={(...args) => updateSetting('autoScroll', ...args)}
            />
            <Button
                onClick={() => openSettings()}
                size="large"
                sx={{ justifyContent: 'start', textTransform: 'none' }}
                variant="contained"
                startIcon={<SettingsIcon />}
            >
                {t('settings.title')}
            </Button>
        </Stack>
    );
};

export const ReaderNavBarDesktopQuickSettings = withPropsFrom(
    BaseReaderNavBarDesktopQuickSettings,
    [useReaderStateMangaContext, ReaderService.useSettings],
    [
        'manga',
        'readingMode',
        'shouldOffsetDoubleSpreads',
        'pageScaleMode',
        'shouldStretchPage',
        'readingDirection',
        'autoScroll',
    ],
);
