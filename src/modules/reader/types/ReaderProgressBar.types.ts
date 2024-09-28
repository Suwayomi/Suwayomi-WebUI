/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BoxProps } from '@mui/material/Box';

export interface ReaderProgressBarProps {
    totalPages: number;
    pages: [PageIndexes: [number] | [number, number], PageName: string, LoadState: boolean][];
    currentPageIndex: number;
    setCurrentPageIndex: (pageIndex: number) => void;
}

export type TReaderProgressCurrentPage = [
    PageIndex: ReaderProgressBarProps['pages'][number][0],
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
