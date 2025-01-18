/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { getInitialReaderPageIndex } from '@/modules/reader/utils/Reader.utils.ts';
import { createPageData, createPagesData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import {
    ReaderResumeMode,
    ReaderStateChapters,
    ReaderTransitionPageMode,
} from '@/modules/reader/types/Reader.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';

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
            const { pages: newPages } = pagesPayload;

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
            setCurrentPageIndex(0);
            setPageToScrollToIndex(null);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ url: '', loaded: false }]);
        }

        setTransitionPageMode(ReaderTransitionPageMode.NONE);
    }, [pagesResponse.data?.fetchChapterPages?.pages]);
};
