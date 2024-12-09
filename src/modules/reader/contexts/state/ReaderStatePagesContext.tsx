/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';

export const ReaderStatePagesContext = createContext<ReaderStatePages>({
    totalPages: 0,
    currentPageIndex: 0,
    setCurrentPageIndex: () => undefined,
    pageToScrollToIndex: 0,
    setPageToScrollToIndex: () => undefined,
    setTotalPages: () => undefined,
    pageUrls: [],
    setPageUrls: () => undefined,
    pageLoadStates: [],
    setPageLoadStates: () => undefined,
    pages: [],
    setPages: () => undefined,
    transitionPageMode: ReaderTransitionPageMode.NONE,
    setTransitionPageMode: () => undefined,
    retryFailedPagesKeyPrefix: '',
    setRetryFailedPagesKeyPrefix: () => undefined,
});

export const userReaderStatePagesContext = () => useContext(ReaderStatePagesContext);
