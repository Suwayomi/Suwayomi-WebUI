/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useEffect } from 'react';
import { ReaderProgressBarProps, TReaderProgressCurrentPage } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { useGetOptionForDirection } from '@/theme.tsx';

export const getPage = (pageIndex: number, pages: ReaderProgressBarProps['pages']): TReaderProgressCurrentPage => {
    // this should never be undefined, if it is, it should just cause an error
    const pagesIndex = pages.findIndex((page) => page[0].includes(pageIndex))!;
    return [pages[pagesIndex][0], pages[pagesIndex][1], pagesIndex];
};

export const getNextPageIndex = (
    offset: 'previous' | 'next',
    pagesIndex: number,
    pages: ReaderProgressBarProps['pages'],
): number => {
    switch (offset) {
        case 'previous':
            return pages[Math.max(0, pagesIndex - 1)][0][0];
        case 'next':
            return pages[Math.min(pages.length - 1, pagesIndex + 1)][0][0];
        default:
            throw new Error(`Unexpected offset "${offset}"`);
    }
};

export const getPageForMouseXPos = (
    xPos: number,
    elementRect: DOMRect,
    pages: ReaderProgressBarProps['pages'],
    getOptionForDirection: ReturnType<typeof useGetOptionForDirection>,
): ReaderProgressBarProps['pages'][number] => {
    const mouseXPosRelativeToProgressBar = xPos - elementRect.left;
    const pageForMouseXPos = Math.ceil((mouseXPosRelativeToProgressBar / elementRect.width) * pages.length);
    const minPage = Math.max(1, pageForMouseXPos);
    const maxPage = Math.min(minPage, pages.length);
    const newPageIndex = getOptionForDirection(maxPage - 1, pages.length - maxPage);

    return pages[newPageIndex];
};

export const useHandleProgressDragging = (
    progressBarRef: RefObject<HTMLDivElement | null>,
    isDragging: boolean,
    currentPage: TReaderProgressCurrentPage,
    setCurrentPageIndex: (pageIndex: number) => void,
    pages: ReaderProgressBarProps['pages'],
    getOptionForDirection: ReturnType<typeof useGetOptionForDirection>,
) => {
    useEffect(() => {
        if (!isDragging) {
            return () => undefined;
        }

        const handleMove = (xPos: number) => {
            if (!progressBarRef.current) {
                return;
            }

            const newPageIndex = getPageForMouseXPos(
                xPos,
                progressBarRef.current.getBoundingClientRect(),
                pages,
                getOptionForDirection,
            )[0][0];

            const hasCurrentPageIndexChanged = currentPage[0][0] !== newPageIndex;
            if (!hasCurrentPageIndexChanged) {
                return;
            }

            setCurrentPageIndex(newPageIndex);
        };

        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isDragging, currentPage, pages]);
};
