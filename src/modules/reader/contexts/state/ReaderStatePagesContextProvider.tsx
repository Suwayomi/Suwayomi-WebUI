/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useState } from 'react';
import { ReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { createPageData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';

export const ReaderStatePagesContextProvider = ({ children }: { children: ReactNode }) => {
    const [totalPages, setTotalPages] = useState<ReaderStatePages['totalPages']>(0);
    const [currentPageIndex, setCurrentPageIndex] = useState<ReaderStatePages['currentPageIndex']>(0);
    const [pageToScrollToIndex, setPageToScrollToIndex] = useState<ReaderStatePages['pageToScrollToIndex']>(null);
    const [pageUrls, setPageUrls] = useState<ReaderStatePages['pageUrls']>([]);
    const [pageLoadStates, setPageLoadStates] = useState<ReaderStatePages['pageLoadStates']>([{ loaded: false }]);
    const [pages, setPages] = useState<ReaderStatePages['pages']>([createPageData('', 0)]);
    const [transitionPageMode, setTransitionPageMode] = useState<ReaderStatePages['transitionPageMode']>(
        ReaderTransitionPageMode.NONE,
    );
    const [retryFailedPagesKeyPrefix, setRetryFailedPagesKeyPrefix] =
        useState<ReaderStatePages['retryFailedPagesKeyPrefix']>('');

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
