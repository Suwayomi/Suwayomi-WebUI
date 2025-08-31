/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { createPageData } from '@/features/reader/viewer/pager/ReaderPager.utils.tsx';
import {
    ReaderStateChapters,
    ReaderStatePages,
    ReaderTransitionPageMode,
    TReaderStateSettingsContext,
} from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { READER_STATE_CHAPTERS_DEFAULTS } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { getReaderStore } from '@/features/reader/ReaderStore.ts';

export const useReaderResetStates = (
    setReaderStateChapters: ReaderStateChapters['setReaderStateChapters'],
    setCurrentPageIndex: ReaderStatePages['setCurrentPageIndex'],
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    setTotalPages: ReaderStatePages['setTotalPages'],
    setPages: ReaderStatePages['setPages'],
    setPageUrls: ReaderStatePages['setPageUrls'],
    setPageLoadStates: ReaderStatePages['setPageLoadStates'],
    setTransitionPageMode: ReaderStatePages['setTransitionPageMode'],
    setSettings: TReaderStateSettingsContext['setSettings'],
) => {
    useEffect(
        () => () => {
            getReaderStore().reset();
            setReaderStateChapters(READER_STATE_CHAPTERS_DEFAULTS);

            setCurrentPageIndex(0);
            setPageToScrollToIndex(null);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ url: '', loaded: false }]);
            setTransitionPageMode(ReaderTransitionPageMode.NONE);

            setSettings(DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG);
        },
        [],
    );
};
