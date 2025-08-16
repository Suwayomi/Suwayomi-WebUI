/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { ReaderTransitionPageMode } from '@/features/reader/Reader.types.ts';
import { READER_STATE_PAGES_DEFAULTS } from '@/features/reader/ReaderContext.constants.ts';

export const ReaderStatePagesContext = createContext<ReaderStatePages>({
    totalPages: 0,
    currentPageIndex: 0,
    setCurrentPageIndex: () => undefined,
    pageToScrollToIndex: null,
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

export const ReaderStatePagesContextProvider = ({ children }: { children: ReactNode }) => {
    const [totalPages, setTotalPages] = useState<ReaderStatePages['totalPages']>(
        READER_STATE_PAGES_DEFAULTS.totalPages,
    );
    const [currentPageIndex, setCurrentPageIndex] = useState<ReaderStatePages['currentPageIndex']>(
        READER_STATE_PAGES_DEFAULTS.currentPageIndex,
    );
    const [pageToScrollToIndex, setPageToScrollToIndex] = useState<ReaderStatePages['pageToScrollToIndex']>(
        READER_STATE_PAGES_DEFAULTS.pageToScrollToIndex,
    );
    const [pageUrls, setPageUrls] = useState<ReaderStatePages['pageUrls']>(READER_STATE_PAGES_DEFAULTS.pageUrls);
    const [pageLoadStates, setPageLoadStates] = useState<ReaderStatePages['pageLoadStates']>(
        READER_STATE_PAGES_DEFAULTS.pageLoadStates,
    );
    const [pages, setPages] = useState<ReaderStatePages['pages']>(READER_STATE_PAGES_DEFAULTS.pages);
    const [transitionPageMode, setTransitionPageMode] = useState<ReaderStatePages['transitionPageMode']>(
        READER_STATE_PAGES_DEFAULTS.transitionPageMode,
    );
    const [retryFailedPagesKeyPrefix, setRetryFailedPagesKeyPrefix] = useState<
        ReaderStatePages['retryFailedPagesKeyPrefix']
    >(READER_STATE_PAGES_DEFAULTS.retryFailedPagesKeyPrefix);

    const value = useMemo(
        () => ({
            totalPages,
            setTotalPages,
            currentPageIndex,
            setCurrentPageIndex,
            pageToScrollToIndex,
            setPageToScrollToIndex,
            pageUrls,
            setPageUrls,
            pageLoadStates,
            setPageLoadStates,
            pages,
            setPages,
            transitionPageMode,
            setTransitionPageMode,
            retryFailedPagesKeyPrefix,
            setRetryFailedPagesKeyPrefix,
        }),
        [
            totalPages,
            pages,
            currentPageIndex,
            pageToScrollToIndex,
            pageUrls,
            pageLoadStates,
            transitionPageMode,
            retryFailedPagesKeyPrefix,
        ],
    );

    return <ReaderStatePagesContext.Provider value={value}>{children}</ReaderStatePagesContext.Provider>;
};
