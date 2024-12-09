/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material/styles';
import { ReactNode } from 'react';
import {
    IReaderSettings,
    PageInViewportType,
    ReaderPageScaleMode,
    ReadingDirection,
    ReaderTransitionPageMode,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { isContinuousReadingMode, isReaderWidthEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ReaderPage } from '@/modules/reader/components/viewer/ReaderPage.tsx';
import { reverseString } from '@/util/Strings.ts';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

type CSSObject = ReturnType<Theme['applyStyles']>;

const getPageWidth = (
    pageScaleMode: IReaderSettings['pageScaleMode'],
    isDoublePage?: boolean,
    readerWidth?: IReaderSettings['readerWidth'],
    isImage?: boolean,
): string => {
    if (isImage && isDoublePage) {
        return '50%';
    }

    // the image wrapper gets applied the reader width limit and therefore the images can take up 100%
    if (!isImage && readerWidth?.enabled && isReaderWidthEditable(pageScaleMode)) {
        return `${readerWidth.value}%`;
    }

    return '100%';
};

export const getImagePlaceholderStyling = (
    readingMode: IReaderSettings['readingMode'],
    shouldStretchPage: IReaderSettings['shouldStretchPage'],
    pageScaleMode: IReaderSettings['pageScaleMode'],
    readerWidth: IReaderSettings['readerWidth'],
    scrollbarXSize: number,
    scrollbarYSize: number,
    isDoublePage?: boolean,
    isTabletWidth?: boolean,
): CSSObject => {
    const DEFAULT_SINGLE_PAGE_WIDTH = isTabletWidth ? '100vw' : '40vw';
    const DEFAULT_SINGLE_PAGE_HEIGHT = isTabletWidth ? '100vh' : '85vh';

    const READING_MODE_TO_PLACEHOLDER_SIZE: Record<ReadingMode, { minWidth: string; minHeight: string }> = {
        [ReadingMode.SINGLE_PAGE]: { minWidth: DEFAULT_SINGLE_PAGE_WIDTH, minHeight: DEFAULT_SINGLE_PAGE_HEIGHT },
        [ReadingMode.DOUBLE_PAGE]: { minWidth: isTabletWidth ? '50vw' : '35vw', minHeight: DEFAULT_SINGLE_PAGE_HEIGHT },
        [ReadingMode.CONTINUOUS_VERTICAL]: {
            minWidth: `calc(${DEFAULT_SINGLE_PAGE_WIDTH} - ${scrollbarYSize}px)`,
            minHeight: '100vh',
        },
        [ReadingMode.CONTINUOUS_HORIZONTAL]: {
            minWidth: DEFAULT_SINGLE_PAGE_WIDTH,
            minHeight: `calc(${DEFAULT_SINGLE_PAGE_HEIGHT} - ${scrollbarXSize}px)`,
        },
    };
    const defaultStyling = READING_MODE_TO_PLACEHOLDER_SIZE[readingMode];
    const minWidthForStretch = isDoublePage ? '50%' : '100%';

    switch (pageScaleMode) {
        case ReaderPageScaleMode.WIDTH:
            return {
                ...defaultStyling,
                ...applyStyles(readerWidth.enabled && isReaderWidthEditable(pageScaleMode), {
                    minWidth: minWidthForStretch,
                }),
                ...applyStyles(shouldStretchPage, {
                    minWidth: minWidthForStretch,
                }),
            };
        case ReaderPageScaleMode.HEIGHT:
            return {
                ...defaultStyling,
                ...applyStyles(shouldStretchPage, {
                    minHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_VERTICAL, {
                        minHeight: '100vh',
                    }),
                }),
            };
        case ReaderPageScaleMode.SCREEN:
            return {
                ...defaultStyling,
                ...applyStyles(readerWidth.enabled && isReaderWidthEditable(pageScaleMode), {
                    minWidth: minWidthForStretch,
                }),
                ...applyStyles(shouldStretchPage, {
                    minWidth: minWidthForStretch,
                    minHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_VERTICAL, {
                        minHeight: '100vh',
                    }),
                }),
            };
        case ReaderPageScaleMode.ORIGINAL:
            return defaultStyling;
        default:
            throw new Error(`Unexpected "PageScaleMode" (${pageScaleMode})`);
    }
};

export const getImageWidthStyling = (
    readingMode: IReaderSettings['readingMode'],
    shouldStretchPage: IReaderSettings['shouldStretchPage'],
    pageScaleMode: IReaderSettings['pageScaleMode'],
    isDoublePage?: boolean,
    readerWidth?: IReaderSettings['readerWidth'],
    isImage?: boolean,
): CSSObject => {
    const width = getPageWidth(pageScaleMode, isDoublePage, readerWidth, isImage);

    // setting the "width" of the wrapper is required for being able to properly size the image placeholders
    const staticReaderWidthForWrapper = applyStyles(
        !isImage && !!readerWidth?.enabled && isReaderWidthEditable(pageScaleMode),
        { width },
    );
    const readerWidthStretchForWrapper = applyStyles(!isImage && shouldStretchPage, { width: '100%' });

    switch (pageScaleMode) {
        case ReaderPageScaleMode.WIDTH:
            return {
                ...applyStyles(shouldStretchPage, {
                    minWidth: width,
                    ...readerWidthStretchForWrapper,
                }),
                ...staticReaderWidthForWrapper,
                maxWidth: width,
            };
        case ReaderPageScaleMode.HEIGHT:
            return {
                ...applyStyles(shouldStretchPage, {
                    minHeight: '100%',
                }),
                maxHeight: `100%`,
            };
        case ReaderPageScaleMode.SCREEN:
            return {
                ...applyStyles(shouldStretchPage, {
                    minWidth: width,
                    minHeight: '100%',
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_HORIZONTAL, {
                        minWidth: 'unset',
                        minHeight: '100%',
                    }),
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_VERTICAL, {
                        minWidth: width,
                        minHeight: 'unset',
                    }),
                    ...readerWidthStretchForWrapper,
                }),
                ...staticReaderWidthForWrapper,
                maxWidth: width,
                maxHeight: `100%`,
            };
        case ReaderPageScaleMode.ORIGINAL:
            return {};
        default:
            throw new Error(`Unexpected "PageScaleMode" (${pageScaleMode})`);
    }
};

export const createSinglePageData = (url: string, index: number): ReaderStatePages['pages'][number]['primary'] => ({
    index,
    alt: `Page #${index + 1}`,
    url: `${requestManager.getBaseUrl()}${url}`,
});

export const createPageData = (url: string, index: number): ReaderStatePages['pages'][number] => ({
    name: `${index + 1}`,
    primary: createSinglePageData(url, index),
});

export const createPagesData = (pageUrls: string[]): ReaderStatePages['pages'] => pageUrls.map(createPageData);

const getPageDownloadPriority = (currentPageIndex: number, pageIndex: number, totalPages: number): number => {
    const distanceToCurrentPage = Math.abs(pageIndex - currentPageIndex);
    const priorityBasedOnDistance = totalPages - distanceToCurrentPage;

    const isPreviousPage = pageIndex < currentPageIndex;
    if (isPreviousPage) {
        return priorityBasedOnDistance - 1;
    }

    return priorityBasedOnDistance;
};

export const createReaderPage = (
    { primary: { index, alt, url } }: ReaderStatePages['pages'][number],
    onLoad: () => void,
    shouldLoad: boolean,
    display: boolean,
    currentPageIndex: number,
    totalPages: number,
    position?: 'left' | 'right',
    isDoublePage?: boolean,
    setRef?: (ref: HTMLElement | null) => void,
): ReactNode => (
    <ReaderPage
        ref={setRef}
        key={url}
        src={url}
        alt={alt}
        display={display}
        priority={getPageDownloadPriority(currentPageIndex, index, totalPages)}
        position={position}
        onLoad={onLoad}
        doublePage={isDoublePage}
        shouldLoad={shouldLoad}
    />
);

export const isPageInViewport = (element: HTMLElement, type: PageInViewportType): boolean => {
    const { top, bottom, left, right } = element.getBoundingClientRect();

    // for some reason using "scrollIntoView" to scroll a page into view does not always result in the page to be at top,
    // left/right 0px and instead at something like -0.25px
    const MIN_VISIBLE_PX = 1;

    const isLeftInViewport = left >= MIN_VISIBLE_PX && left <= window.innerWidth;
    const isRightInViewport = right >= MIN_VISIBLE_PX && right <= window.innerWidth;
    const isFillingWidthViewportCompletely = left <= MIN_VISIBLE_PX && right >= window.innerWidth;

    const isTopInViewport = top >= MIN_VISIBLE_PX && top <= window.innerHeight;
    const isBottomInViewport = bottom >= MIN_VISIBLE_PX && bottom <= window.innerHeight;
    const isFillingHeightViewportCompletely = top <= MIN_VISIBLE_PX && bottom >= window.innerHeight;

    const isInViewportX = isLeftInViewport || isRightInViewport || isFillingWidthViewportCompletely;
    const isInViewportY = isTopInViewport || isBottomInViewport || isFillingHeightViewportCompletely;

    switch (type) {
        case PageInViewportType.X:
            return isInViewportX;
        case PageInViewportType.Y:
            return isInViewportY;
        default:
            throw new Error(`unexpected "type" (${type})`);
    }
};

export const getDoublePageModePages = (
    pageUrls: ReaderStatePages['pageUrls'],
    pagesToSpreadState: boolean[],
    shouldOffsetDoubleSpreads: IReaderSettings['shouldOffsetDoubleSpreads'],
    direction: ReadingDirection,
): ReaderStatePages['pages'] => {
    const doublePageModePages: ReaderStatePages['pages'] = [];

    // each spread page has to be counted as 2 pages and all trailing page numbers have to be increased by the count
    // of leading spread pages
    const pageToActualPageIndex = pagesToSpreadState.map(
        (_, page) => page + pagesToSpreadState.slice(0, page).filter(Boolean).length,
    );

    pageUrls.forEach((url, index) => {
        /*

        | = page separator
        + = double page
        _ = double spread

        without double spreads:
         without double spread offset: | 0 + 1 | 2 + 3 | 4 + 5 | 6 + 7 |   8   |
         with double spread offset   : |   0   | 1 + 2 | 3 + 4 | 5 + 6 | 7 + 8 |

        with double spreads
          to handle double spreads:
           each double spread has to count as 2 pages, thus, each page number after a double spread has to increase
           by the number of leading double spreads

         without double spread offset: | 0 + 1 |   2   | _3/4_ |   5   | 6 + 7 |   8    | _9/10_  |   11    | 12 + 13 | 14 |
         with double spread offset   : |   0   | 1 + 2 | _3/4_ | 5 + 6 | 7 + 8 | _9/10_ | 11 + 12 | 13 + 14 |

         thus, to get the second page:
          without offset: second page = current page number even ? +1 : -1
          with offset   : second page = current page number even ? -1 : +1

          the second page has to be ignored in case:
           - double spreads are offset, and the current page is the first page
           - either the current or second page is a double spread
         */

        const normalizedIndex = pageToActualPageIndex[index];
        const isCurrentPageEven = !(normalizedIndex % 2);

        const secondPageOffset = (() => {
            const invert = shouldOffsetDoubleSpreads ? -1 : 1;
            const offset = isCurrentPageEven ? 1 : -1;

            return offset * invert;
        })();

        const secondPageIndex = index + secondPageOffset;

        const isPrimaryPage = index < secondPageIndex;
        const isFirstPage = index === 0;
        const isLastPage = index === pageUrls.length - 1;
        const hasSecondPage = isPrimaryPage && !isLastPage;

        const isPrimaryPageSpreadPage = pagesToSpreadState[index];
        const isSecondPageSpreadPage = pagesToSpreadState[secondPageIndex];
        const hasSpreadPage = isPrimaryPageSpreadPage || isSecondPageSpreadPage;

        const ignoreSecondPageDueToOffset = isFirstPage && shouldOffsetDoubleSpreads;
        const displaySecondPage = !hasSpreadPage && !ignoreSecondPageDueToOffset;

        if (!isPrimaryPage && displaySecondPage) {
            const doublePageModePage = doublePageModePages[doublePageModePages.length - 1];

            doublePageModePages[doublePageModePages.length - 1] = {
                ...doublePageModePage,
                secondary: createSinglePageData(url, index),
            };
            return;
        }

        const SEPARATOR = '-';
        const pageName = `${index + 1}${hasSecondPage && displaySecondPage ? `${SEPARATOR}${secondPageIndex + 1}` : ''}`;

        doublePageModePages.push({
            name: direction === ReadingDirection.LTR ? pageName : reverseString(pageName, SEPARATOR),
            primary: createSinglePageData(url, index),
        });
    });

    return doublePageModePages;
};

export const isSpreadPage = (image: HTMLImageElement): boolean => {
    const aspectRatio = image.height / image.width;
    return aspectRatio < 1;
};

const PREVIOUS_IMAGE_LOAD_AMOUNT = 2;
export const getPageIndexesToLoad = (
    currentPageIndex: number,
    pages: ReaderStatePages['pages'],
    previousCurrentPageIndex: number,
    imagePreLoadAmount: number,
): number[] => {
    const currentPagesIndex = getPage(currentPageIndex, pages).pagesIndex;

    const directionInvert = previousCurrentPageIndex <= currentPageIndex ? 1 : -1;
    // load at most PREVIOUS_IMAGE_LOAD_AMOUNT of the previous pages to ensure that you do not have to wait too long
    // when going back to the previous pages
    const startPagesIndex = Math.max(
        0,
        currentPagesIndex - Math.min(PREVIOUS_IMAGE_LOAD_AMOUNT, imagePreLoadAmount) * directionInvert,
    );
    const endPagesIndex = currentPagesIndex + imagePreLoadAmount * directionInvert;
    const pagesToRenderLength = Math.abs(endPagesIndex - startPagesIndex) + 1;

    return Array(pagesToRenderLength)
        .fill(1)
        .map((_, index) => startPagesIndex + index * directionInvert);
};

export const isTransitionPageVisible = (
    mode: ReaderTransitionPageMode,
    activeMode: ReaderTransitionPageMode,
    readingMode: IReaderSettings['readingMode'],
): boolean => [ReaderTransitionPageMode.BOTH, mode].includes(activeMode) || isContinuousReadingMode(readingMode);
