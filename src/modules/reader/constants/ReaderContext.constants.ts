/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { createPageData } from '@/modules/reader/utils/ReaderPager.utils.tsx';

export const READER_STATE_PAGES_DEFAULTS: ReaderStatePages = {
    totalPages: 0,
    setTotalPages: () => undefined,
    currentPageIndex: 0,
    setCurrentPageIndex: () => undefined,
    pageToScrollToIndex: null,
    setPageToScrollToIndex: () => undefined,
    pageUrls: [],
    setPageUrls: () => undefined,
    pageLoadStates: [{ url: '', loaded: false }],
    setPageLoadStates: () => undefined,
    pages: [createPageData('', 0)],
    setPages: () => undefined,
    transitionPageMode: ReaderTransitionPageMode.NONE,
    setTransitionPageMode: () => undefined,
    retryFailedPagesKeyPrefix: '',
    setRetryFailedPagesKeyPrefix: () => undefined,
};
