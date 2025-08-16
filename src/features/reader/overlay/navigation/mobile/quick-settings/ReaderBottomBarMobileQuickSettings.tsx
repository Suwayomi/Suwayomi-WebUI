/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReaderSettingReadingMode } from '@/features/reader/settings/layout/components/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/features/reader/settings/layout/components/ReaderSettingReadingDirection.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { useReaderStateMangaContext } from '@/features/reader/contexts/state/ReaderStateMangaContext.tsx';
import { DefaultSettingFootnote } from '@/features/reader/settings/components/DefaultSettingFootnote.tsx';
import {
    IReaderSettingsWithDefaultFlag,
    TReaderAutoScrollContext,
    TReaderStateMangaContext,
} from '@/features/reader/Reader.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';
import { ReaderSettingAutoScroll } from '@/features/reader/auto-scroll/settings/ReaderSettingAutoScroll.tsx';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { useReaderAutoScrollContext } from '@/features/reader/auto-scroll/ReaderAutoScrollContext.tsx';

const BaseReaderBottomBarMobileQuickSettings = ({
    manga,
    readingMode,
    readingDirection,
    autoScroll,
    isActive,
    toggleActive,
}: Pick<TReaderStateMangaContext, 'manga'> &
    Pick<IReaderSettingsWithDefaultFlag, 'readingMode' | 'readingDirection' | 'autoScroll'> &
    Pick<TReaderAutoScrollContext, 'isActive' | 'toggleActive'>) => {
    const { t } = useTranslation();
    const deleteSetting = ReaderService.useCreateDeleteSetting(manga ?? FALLBACK_MANGA);

    if (!manga) {
        return null;
    }

    return (
        <Stack sx={{ gap: 2 }}>
            <DefaultSettingFootnote />
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
            <CheckboxInput
                label={t('reader.settings.auto_scroll.title')}
                checked={isActive}
                onChange={() => toggleActive()}
            />
            <ReaderSettingAutoScroll
                autoScroll={autoScroll}
                setAutoScroll={(...args) => ReaderService.updateSetting(manga, 'autoScroll', ...args)}
            />
        </Stack>
    );
};

export const ReaderBottomBarMobileQuickSettings = withPropsFrom(
    memo(BaseReaderBottomBarMobileQuickSettings),
    [useReaderStateMangaContext, ReaderService.useSettings, useReaderAutoScrollContext],
    ['manga', 'readingMode', 'readingDirection', 'autoScroll', 'isActive', 'toggleActive'],
);
