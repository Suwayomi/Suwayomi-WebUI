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
    ReaderTransitionPageMode,
    TReaderAutoScrollContext,
    TReaderStateMangaContext,
    TReaderStateSettingsContext,
} from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { TReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { READER_STATE_CHAPTERS_DEFAULTS } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';

export const useReaderResetStates = (
    setManga: TReaderStateMangaContext['setManga'],
    setReaderStateChapters: ReaderStateChapters['setReaderStateChapters'],
    setCurrentPageIndex: ReaderStatePages['setCurrentPageIndex'],
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    setTotalPages: ReaderStatePages['setTotalPages'],
    setPages: ReaderStatePages['setPages'],
    setPageUrls: ReaderStatePages['setPageUrls'],
    setPageLoadStates: ReaderStatePages['setPageLoadStates'],
    setTransitionPageMode: ReaderStatePages['setTransitionPageMode'],
    setIsOverlayVisible: TReaderOverlayContext['setIsVisible'],
    setSettings: TReaderStateSettingsContext['setSettings'],
    cancelAutoScroll: TReaderAutoScrollContext['cancel'],
) => {
    useEffect(
        () => () => {
            setManga(undefined);
            setReaderStateChapters(READER_STATE_CHAPTERS_DEFAULTS);

            setCurrentPageIndex(0);
            setPageToScrollToIndex(null);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ url: '', loaded: false }]);
            setTransitionPageMode(ReaderTransitionPageMode.NONE);

            setIsOverlayVisible(false);

            setSettings(DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG);

            cancelAutoScroll();
        },
        [],
    );
};
