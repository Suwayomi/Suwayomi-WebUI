/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { ReaderStateChapters } from '@/features/reader/Reader.types.ts';

export const READER_STATE_CHAPTERS_DEFAULTS: Omit<ReaderStateChapters, 'setReaderStateChapters'> = {
    chapters: [],
    isCurrentChapterReady: false,
    visibleChapters: {
        leading: 0,
        trailing: 0,
        lastLeadingChapterSourceOrder: 99999,
        lastTrailingChapterSourceOrder: -1,
        isLeadingChapterPreloadMode: true,
        isTrailingChapterPreloadMode: true,
        scrollIntoView: false,
        resumeMode: undefined,
    },
};

export const ReaderStateChaptersContext = createContext<ReaderStateChapters>({
    ...READER_STATE_CHAPTERS_DEFAULTS,
    setReaderStateChapters: () => {},
});

export const useReaderStateChaptersContext = () => useContext(ReaderStateChaptersContext);
