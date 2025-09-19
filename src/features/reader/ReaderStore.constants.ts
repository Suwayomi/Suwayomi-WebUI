/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReaderStatePages, ReaderTransitionPageMode } from '@/features/reader/Reader.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

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
