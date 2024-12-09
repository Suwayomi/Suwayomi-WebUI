/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BoxProps } from '@mui/material/Box';
import { TooltipProps } from '@mui/material/Tooltip';
import { IReaderSettings, ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';

interface SinglePageData {
    index: number;
    alt: string;
    url: string;
}

interface PageData {
    name: string;
    primary: SinglePageData;
    secondary?: SinglePageData;
}

export interface ReaderStatePages {
    totalPages: number;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
    currentPageIndex: number;
    setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pageToScrollToIndex: number;
    setPageToScrollToIndex: React.Dispatch<React.SetStateAction<number>>;
    pageUrls: string[];
    setPageUrls: React.Dispatch<React.SetStateAction<string[]>>;
    pageLoadStates: { loaded: boolean; error?: boolean }[];
    setPageLoadStates: React.Dispatch<React.SetStateAction<{ loaded: boolean; error?: boolean }[]>>;
    pages: PageData[];
    setPages: React.Dispatch<React.SetStateAction<PageData[]>>;
    transitionPageMode: ReaderTransitionPageMode;
    setTransitionPageMode: React.Dispatch<React.SetStateAction<ReaderTransitionPageMode>>;
    retryFailedPagesKeyPrefix: string;
    setRetryFailedPagesKeyPrefix: React.Dispatch<React.SetStateAction<string>>;
}

export interface ReaderProgressBarProps
    extends Omit<ReaderStatePages, 'setTotalPages' | 'setPages' | 'setPageLoadStates'>,
        Pick<IReaderSettings, 'progressBarPosition'> {}

export interface TReaderProgressCurrentPage extends PageData {
    pagesIndex: number;
}

export interface ReaderProgressBarSlotProps extends Pick<IReaderSettings, 'progressBarPosition'> {
    pageName: string;
    slotProps?: {
        box?: BoxProps;
        tooltip?: Omit<TooltipProps, 'title' | 'children'>;
    };
}

export interface CurrentPageSlotProps extends Pick<IReaderSettings, 'progressBarPosition'> {
    pageName: string;
    currentPagesIndex: number;
    pagesLength: number;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    boxProps?: BoxProps;
}
