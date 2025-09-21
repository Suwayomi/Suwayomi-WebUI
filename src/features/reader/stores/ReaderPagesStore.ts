/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReaderStatePages, ReaderTransitionPageMode } from '@/features/reader/Reader.types.ts';
import { ImmerStateCreator } from '@/lib/zustand/Zustand.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export interface ReaderPagesStoreSlice {
    pages: ReaderStatePages & {
        reset: () => ReaderPagesStoreSlice;
    };
}

export const READER_DEFAULT_PAGES_STATE: Omit<
    ReaderStatePages,
    | 'setCurrentPageIndex'
    | 'setPageToScrollToIndex'
    | 'setTotalPages'
    | 'setPageUrls'
    | 'setPageLoadStates'
    | 'setPages'
    | 'setTransitionPageMode'
    | 'setRetryFailedPagesKeyPrefix'
    | 'reset'
> = {
    totalPages: 0,
    currentPageIndex: 0,
    pageToScrollToIndex: null,
    pageUrls: [],
    pageLoadStates: [{ url: '', loaded: false }],
    pages: [
        {
            name: '1',
            primary: {
                index: 0,
                alt: `Page #1`,
                url: `${requestManager.getBaseUrl()}`,
            },
        },
    ],
    transitionPageMode: ReaderTransitionPageMode.NONE,
    retryFailedPagesKeyPrefix: '',
};

export const createReaderPagesStoreSlice = <T extends ReaderPagesStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderPagesStoreSlice => ({
    pages: {
        ...READER_DEFAULT_PAGES_STATE,
        reset: () => ({ pages: { ...get().pages, ...READER_DEFAULT_PAGES_STATE } }),
        setCurrentPageIndex: (index) =>
            set((draft) => {
                draft.pages.currentPageIndex = index;
            }),
        setPageToScrollToIndex: (index) =>
            set((draft) => {
                draft.pages.pageToScrollToIndex = index;
            }),
        setTotalPages: (total) =>
            set((draft) => {
                draft.pages.totalPages = total;
            }),
        setPageUrls: (urls) =>
            set((draft) => {
                draft.pages.pageUrls = urls;
            }),
        setPageLoadStates: (loadStates) =>
            set((draft) => {
                if (typeof loadStates === 'function') {
                    draft.pages.pageLoadStates = loadStates(get().pages.pageLoadStates);
                    return;
                }

                draft.pages.pageLoadStates = loadStates;
            }),
        setPages: (pages) =>
            set((draft) => {
                draft.pages.pages = pages;
            }),
        setTransitionPageMode: (mode) =>
            set((draft) => {
                draft.pages.transitionPageMode = mode;
            }),
        setRetryFailedPagesKeyPrefix: (prefix) =>
            set((draft) => {
                draft.pages.retryFailedPagesKeyPrefix = prefix;
            }),
    },
});
