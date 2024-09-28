/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Direction, useTheme } from '@mui/material/styles';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { IReaderSettings, ReadingDirection } from '@/modules/reader/types/Reader.types.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { getReaderSettingsFor, useDefaultReaderSettings } from '@/modules/reader/services/ReaderSettingsMetadata.ts';

const DIRECTION_TO_INVERTED: Record<Direction, Direction> = {
    ltr: 'rtl',
    rtl: 'ltr',
};

const DIRECTION_TO_READING_DIRECTION: Record<Direction, ReadingDirection> = {
    ltr: ReadingDirection.LTR,
    rtl: ReadingDirection.RTL,
};

export class ReaderService {
    static useNavigateToChapter(chapter?: TChapterReader): () => void {
        const navigate = useNavigate();

        return useCallback(() => chapter && navigate(Chapters.getReaderUrl(chapter), { replace: true }), [chapter]);
    }

    static useSettings(): IReaderSettings {
        const { manga } = useReaderStateMangaContext();
        const defaultReaderSettings = useDefaultReaderSettings();
        return useMemo(
            () => getReaderSettingsFor(manga ?? { id: -1 }, defaultReaderSettings.settings),
            [manga, defaultReaderSettings],
        );
    }

    static useGetThemeDirection(): Direction {
        const { direction } = useTheme();
        const { readingDirection } = ReaderService.useSettings();

        return DIRECTION_TO_READING_DIRECTION[direction] === readingDirection
            ? direction
            : DIRECTION_TO_INVERTED[direction];
    }
}
