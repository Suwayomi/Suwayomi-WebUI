/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BoxProps } from '@mui/material/Box';

type PageData = [
    PageIndexes: [Primary: number] | [Priamry: number, Secondary: number],
    PageName: string,
    LoadState: boolean,
];

export interface ReaderStatePages {
    totalPages: number;
    setTotalPages: (total: number) => void;
    pages: PageData[];
    setPages: (pages: PageData[]) => void;
    currentPageIndex: number;
    setCurrentPageIndex: (pageIndex: number) => void;
}

export interface ReaderProgressBarProps extends Omit<ReaderStatePages, 'setTotalPages' | 'setPages'> {}

export type TReaderProgressCurrentPage = [
    PageIndexes: ReaderProgressBarProps['pages'][number][0],
    PageName: ReaderProgressBarProps['pages'][number][1],
    PagesIndex: number,
];

export interface ReaderProgressBarSlotProps {
    pageName: string;
    boxProps?: BoxProps;
}

export interface CurrentPageSlotProps {
    pageName: string;
    currentPagesIndex: number;
    pagesLength: number;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    boxProps?: BoxProps;
}
