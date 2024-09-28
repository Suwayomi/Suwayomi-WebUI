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

type TContext = ContextType<typeof ReaderStatePagesContext>;

export const ReaderStatePagesContextProvider = ({ children }: { children: ReactNode }) => {
    const [totalPages, setTotalPages] = useState<TContext['totalPages']>(0);
    const [currentPageIndex, setCurrentPageIndex] = useState<TContext['currentPageIndex']>(0);
    const [pageUrls, setPageUrls] = useState<TContext['pageUrls']>([]);
    const [pageLoadStates, setPageLoadStates] = useState<TContext['pageLoadStates']>([]);
    const [pages, setPages] = useState<TContext['pages']>([createPageData('', 0)]);

    const value = useMemo(
        () => ({
            totalPages,
            setTotalPages,
            currentPageIndex,
            setCurrentPageIndex,
            pageUrls,
            setPageUrls,
            pageLoadStates,
            setPageLoadStates,
            pages,
            setPages,
        }),
        [totalPages, pages, currentPageIndex, pageUrls, pageLoadStates],
    );

    return <ReaderStatePagesContext.Provider value={value}>{children}</ReaderStatePagesContext.Provider>;
};
