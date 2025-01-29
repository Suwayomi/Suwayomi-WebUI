/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { getInitialReaderPageIndex } from '@/modules/reader/utils/Reader.utils.ts';
import { createPagesData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import {
    ReaderResumeMode,
    ReaderStateChapters,
    ReaderTransitionPageMode,
} from '@/modules/reader/types/Reader.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { READER_STATE_PAGES_DEFAULTS } from '@/modules/reader/constants/ReaderContext.constants.ts';

export const useReaderSetPagesState = (
    pagesResponse: ReturnType<typeof requestManager.useGetChapterPagesFetch>[1],
    resumeMode: ReaderResumeMode,
    currentChapter: ReaderStateChapters['currentChapter'],
    setArePagesFetched: (fetched: boolean) => void,
    setTotalPages: ReaderStatePages['setTotalPages'],
    setPages: ReaderStatePages['setPages'],
    setPageUrls: ReaderStatePages['setPageUrls'],
    setPageLoadStates: ReaderStatePages['setPageLoadStates'],
    setCurrentPageIndex: ReaderStatePages['setCurrentPageIndex'],
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    setTransitionPageMode: ReaderStatePages['setTransitionPageMode'],
) => {
    useEffect(() => {
        const pagesPayload = pagesResponse.data?.fetchChapterPages;
        if (pagesPayload) {
            const { pages } = pagesPayload;
            const newPages = pages.length ? pages : [''];

            const initialReaderPageIndex = getInitialReaderPageIndex(
                resumeMode,
                currentChapter?.lastPageRead ?? 0,
                newPages.length - 1,
            );

            const newPageData = createPagesData(newPages);

            setArePagesFetched(true);
            setTotalPages(pagesPayload.chapter.pageCount);
            setPages(newPageData);
            setPageUrls(newPages);
            setPageLoadStates(newPageData.map(({ primary: { url } }) => ({ url, loaded: false })));
            setCurrentPageIndex(initialReaderPageIndex);
            setPageToScrollToIndex(initialReaderPageIndex);
        } else {
            setArePagesFetched(false);
            setCurrentPageIndex(READER_STATE_PAGES_DEFAULTS.currentPageIndex);
            setPageToScrollToIndex(READER_STATE_PAGES_DEFAULTS.pageToScrollToIndex);
            setTotalPages(READER_STATE_PAGES_DEFAULTS.totalPages);
            setPages(READER_STATE_PAGES_DEFAULTS.pages);
            setPageUrls(READER_STATE_PAGES_DEFAULTS.pageUrls);
            setPageLoadStates(READER_STATE_PAGES_DEFAULTS.pageLoadStates);
        }

        setTransitionPageMode(ReaderTransitionPageMode.NONE);
    }, [pagesResponse.data?.fetchChapterPages?.pages]);
};
