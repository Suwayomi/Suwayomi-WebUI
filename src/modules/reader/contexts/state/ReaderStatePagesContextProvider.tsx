/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ContextType, ReactNode, useMemo, useState } from 'react';
import { ReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { createPageData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';

type TContext = ContextType<typeof ReaderStatePagesContext>;

export const ReaderStatePagesContextProvider = ({ children }: { children: ReactNode }) => {
    const [totalPages, setTotalPages] = useState<TContext['totalPages']>(0);
    const [currentPageIndex, setCurrentPageIndex] = useState<TContext['currentPageIndex']>(0);
    const [pageToScrollToIndex, setPageToScrollToIndex] = useState<TContext['pageToScrollToIndex']>(0);
    const [pageUrls, setPageUrls] = useState<TContext['pageUrls']>([]);
    const [pageLoadStates, setPageLoadStates] = useState<TContext['pageLoadStates']>([{ loaded: false }]);
    const [pages, setPages] = useState<TContext['pages']>([createPageData('', 0)]);
    const [transitionPageMode, setTransitionPageMode] = useState<TContext['transitionPageMode']>(
        ReaderTransitionPageMode.NONE,
    );
    const [retryFailedPagesKeyPrefix, setRetryFailedPagesKeyPrefix] =
        useState<TContext['retryFailedPagesKeyPrefix']>('');

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
