/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useCallback, useMemo } from 'react';
import { Direction } from '@mui/material/styles';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { getNextIndexFromPage, getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/theme.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import {
    PageInViewportType,
    ReaderResumeMode,
    ReaderTransitionPageMode,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { ScrollDirection, ScrollOffset } from '@/modules/core/Core.types.ts';
import { ReaderScrollAmount } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { isEndOfPageInViewport, isPageInViewport } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { TapZoneRegionType } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { ReaderTapZoneService } from '@/modules/reader/services/ReaderTapZoneService.ts';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { getReaderChapterFromCache } from '@/modules/reader/utils/Reader.utils.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset } from '@/Base.types.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';

const READING_DIRECTION_TO_DIRECTION: Record<ReadingDirection, Direction> = {
    [ReadingDirection.LTR]: 'ltr',
    [ReadingDirection.RTL]: 'rtl',
};

const SCROLL_DIRECTION_BY_SCROLL_OFFSET_BY_READING_DIRECTION: Record<ReadingDirection, Record<ScrollOffset, 1 | -1>> = {
    [ReadingDirection.LTR]: {
        [ScrollOffset.BACKWARD]: -1,
        [ScrollOffset.FORWARD]: 1,
    },
    [ReadingDirection.RTL]: {
        [ScrollOffset.BACKWARD]: 1,
        [ScrollOffset.FORWARD]: -1,
    },
};

export class ReaderControls {
    private static updateCurrentPageTimeout: NodeJS.Timeout;

    static scroll(
        offset: ScrollOffset,
        direction: ScrollDirection,
        readingDirection: ReadingDirection,
        element: HTMLElement,
        openChapter: ReturnType<(typeof ReaderControls)['useOpenChapter']>,
        scrollAmountPercentage: number = ReaderScrollAmount.LARGE,
    ): void {
        if (!element) {
            return;
        }

        const isAtStartY = element.scrollTop === 0;
        const isAtEndY =
            Math.floor(element.scrollTop) === element.scrollHeight - element.clientHeight ||
            Math.ceil(element.scrollTop) === element.scrollHeight - element.clientHeight;
        const isAtStartX = element.scrollLeft === 0;
        const isAtEndX =
            Math.floor(element.scrollLeft) === element.scrollWidth - element.clientWidth ||
            Math.ceil(element.scrollLeft) === element.scrollWidth - element.clientWidth;

        const scrollAmount = scrollAmountPercentage / 100;
        const scrollDirection = SCROLL_DIRECTION_BY_SCROLL_OFFSET_BY_READING_DIRECTION[readingDirection][offset];

        const getNewScrollPosition = (currentPos: number, elementSize: number) =>
            currentPos + elementSize * scrollAmount * scrollDirection;

        switch (direction) {
            case ScrollDirection.X:
                if (isAtStartX && offset === ScrollOffset.BACKWARD) {
                    openChapter('previous');
                    return;
                }

                if (isAtEndX && offset === ScrollOffset.FORWARD) {
                    openChapter('next');
                    return;
                }

                element.scroll({
                    left: getNewScrollPosition(element.scrollLeft, element.clientWidth),
                    behavior: 'smooth',
                });
                break;
            case ScrollDirection.Y:
                if (isAtStartY && offset === ScrollOffset.BACKWARD) {
                    openChapter('previous');
                    return;
                }

                if (isAtEndY && offset === ScrollOffset.FORWARD) {
                    openChapter('next');
                    return;
                }

                element.scroll({
                    top: getNewScrollPosition(element.scrollTop, element.clientHeight),
                    behavior: 'smooth',
                });
                break;
            default:
                throw new Error(`Unexpected "ScrollDirection" (${direction})`);
        }
    }

    static useOpenChapter(): (offset: 'previous' | 'next') => void {
        const { readingDirection, readingMode } = ReaderService.useSettings();
        const { previousChapter, nextChapter } = useReaderStateChaptersContext();
        const direction = READING_DIRECTION_TO_DIRECTION[readingDirection.value];

        const openPreviousChapter = ReaderService.useNavigateToChapter(previousChapter, ReaderResumeMode.END);
        const openNextChapter = ReaderService.useNavigateToChapter(nextChapter, ReaderResumeMode.START);

        return useCallback(
            (offset) => {
                switch (offset) {
                    case 'previous':
                        getOptionForDirection(openPreviousChapter, openNextChapter, direction)();
                        break;
                    case 'next':
                        getOptionForDirection(openNextChapter, openPreviousChapter, direction)();
                        break;
                    default:
                        throw new Error(`Unexpected "offset" (${offset})`);
                }
            },
            [direction, openPreviousChapter, openNextChapter, readingMode.value],
        );
    }

    static useOpenPage(): (page: number | 'previous' | 'next', forceDirection?: Direction) => void {
        const { currentPageIndex, setPageToScrollToIndex, pages, transitionPageMode, setTransitionPageMode } =
            userReaderStatePagesContext();
        const { previousChapter, nextChapter } = useReaderStateChaptersContext();
        const { readingDirection, readingMode } = ReaderService.useSettings();
        const openChapter = ReaderControls.useOpenChapter();

        const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
        const previousPageIndex = useMemo(
            () => getNextPageIndex('previous', currentPage.pagesIndex, pages),
            [currentPage, pages],
        );
        const nextPageIndex = useMemo(
            () => getNextPageIndex('next', currentPage.pagesIndex, pages),
            [currentPage, pages],
        );
        const indexOfLastPage = getNextIndexFromPage(pages[pages.length - 1]);
        const direction = READING_DIRECTION_TO_DIRECTION[readingDirection.value];

        const isFirstPage = currentPageIndex === 0;
        const isLastPage = currentPageIndex === indexOfLastPage;
        const isATransitionPageVisible = transitionPageMode !== ReaderTransitionPageMode.NONE;
        const isContinuousReadingModeActive = isContinuousReadingMode(readingMode.value);

        return useCallback(
            (page, forceDirection = direction) => {
                const convertedPage = getOptionForDirection(
                    page,
                    page === 'previous' ? 'next' : 'previous',
                    forceDirection,
                );

                const shouldOpenPreviousChapter =
                    isFirstPage && isATransitionPageVisible && convertedPage === 'previous' && !!previousChapter;
                if (shouldOpenPreviousChapter) {
                    openChapter('previous');
                    return;
                }

                const shouldOpenNextChapter =
                    isLastPage && isATransitionPageVisible && convertedPage === 'next' && !!nextChapter;
                if (shouldOpenNextChapter) {
                    openChapter('next');
                    return;
                }

                const hideTransitionPage = () => setTransitionPageMode(ReaderTransitionPageMode.NONE);

                if (typeof page === 'number') {
                    setPageToScrollToIndex(page);
                    hideTransitionPage();
                    return;
                }

                const needToHideTransitionPage = isATransitionPageVisible && !isContinuousReadingModeActive;
                switch (convertedPage) {
                    case 'previous':
                        if (isFirstPage) {
                            setTransitionPageMode(ReaderTransitionPageMode.PREVIOUS);
                            return;
                        }

                        if (needToHideTransitionPage) {
                            hideTransitionPage();
                            return;
                        }

                        setPageToScrollToIndex(previousPageIndex);
                        break;
                    case 'next':
                        if (isLastPage) {
                            setTransitionPageMode(ReaderTransitionPageMode.NEXT);
                            return;
                        }

                        if (needToHideTransitionPage) {
                            hideTransitionPage();
                            return;
                        }

                        setPageToScrollToIndex(nextPageIndex);
                        break;
                    default:
                        throw new Error(`Unexpected "offset" (${page})`);
                }
            },
            [
                direction,
                previousPageIndex,
                nextPageIndex,
                indexOfLastPage,
                isATransitionPageVisible,
                isContinuousReadingModeActive,
                isFirstPage,
                isLastPage,
                openChapter,
                !!previousChapter,
                !!nextChapter,
            ],
        );
    }

    static useUpdateCurrentPageIndex(): (
        pageIndex: number,
        debounceChapterUpdate?: boolean,
        endReached?: boolean,
    ) => void {
        const { currentPageIndex, setCurrentPageIndex } = userReaderStatePagesContext();
        const { initialChapter, currentChapter, nextChapter, mangaChapters } = useReaderStateChaptersContext();
        const updateChapter = ReaderService.useUpdateChapter();
        const { shouldSkipDupChapters } = ReaderService.useSettings();
        const {
            settings: { downloadAheadLimit },
        } = useMetadataServerSettings();

        const nextChapters = useMemo(() => {
            if (!initialChapter || !currentChapter) {
                return [];
            }

            return Chapters.getNextChapters(currentChapter, mangaChapters, {
                offset: DirectionOffset.NEXT,
                skipDupe: shouldSkipDupChapters,
                skipDupeChapter: initialChapter,
            });
        }, [initialChapter?.id, currentChapter?.id, mangaChapters, shouldSkipDupChapters]);

        return useCallback(
            (pageIndex, debounceChapterUpdate = true, endReached = false) => {
                setCurrentPageIndex(pageIndex);

                if (!currentChapter) {
                    return;
                }

                const hasPageIndexChanged = pageIndex !== currentPageIndex;
                if (!hasPageIndexChanged) {
                    return;
                }

                ReaderService.downloadAhead(currentChapter, nextChapter, nextChapters, pageIndex, downloadAheadLimit);

                const handleCurrentPageIndexChange = () => {
                    const currentChapterUpToDate = getReaderChapterFromCache(currentChapter.id);
                    if (!currentChapterUpToDate) {
                        return;
                    }

                    const hasLastPageReadChanged = pageIndex !== currentChapterUpToDate.lastPageRead;
                    const isLasPage = endReached || pageIndex === currentChapterUpToDate.pageCount - 1;
                    const shouldUpdateChapter = hasLastPageReadChanged || isLasPage;
                    if (!shouldUpdateChapter) {
                        return;
                    }

                    updateChapter({
                        lastPageRead: hasLastPageReadChanged ? pageIndex : undefined,
                        isRead: isLasPage ? true : undefined,
                    });
                };

                clearTimeout(this.updateCurrentPageTimeout);
                if (debounceChapterUpdate) {
                    this.updateCurrentPageTimeout = setTimeout(handleCurrentPageIndexChange, 1000);
                    return;
                }

                handleCurrentPageIndexChange();
            },
            [currentChapter?.id, nextChapter?.id, nextChapters, currentPageIndex, downloadAheadLimit],
        );
    }

    static updateCurrentPageOnScroll(
        imageRefs: MutableRefObject<(HTMLElement | null)[]>,
        lastPageIndex: number,
        updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>,
        type: PageInViewportType,
        readingDirection: ReadingDirection,
    ) {
        const firstVisibleImageIndex = imageRefs.current.findIndex((image) => image && isPageInViewport(image, type));
        const lastPage = imageRefs.current?.[imageRefs.current.length - 1];
        const isEndReached = lastPage && isEndOfPageInViewport(lastPage, type, readingDirection);

        // handle cases where the last page is too small to ever be the "firstVisibleImageIndex"
        if (isEndReached) {
            updateCurrentPageIndex(lastPageIndex, false);
            return;
        }

        if (firstVisibleImageIndex !== -1) {
            updateCurrentPageIndex(firstVisibleImageIndex, firstVisibleImageIndex !== lastPageIndex);
        }
    }

    static useHandleClick(
        scrollElement: HTMLElement | null,
    ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
        const { setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
        const { currentPageIndex, pages } = userReaderStatePagesContext();
        const { setShowPreview } = useReaderTapZoneContext();
        const { readingMode, readingDirection, isStaticNav } = ReaderService.useSettings();
        const openPage = ReaderControls.useOpenPage();
        const openChapter = ReaderControls.useOpenChapter();

        return useCallback(
            (e) => {
                if (!scrollElement) {
                    return;
                }

                const rect = e.currentTarget.getBoundingClientRect();
                const rectRelativeX = e.clientX - rect.left;
                const rectRelativeY = e.clientY - rect.top;
                const action = ReaderTapZoneService.getAction(rectRelativeX, rectRelativeY);

                setShowPreview(false);

                const isContinuousReadingModeActive = isContinuousReadingMode(readingMode.value);
                const scrollDirection =
                    readingMode.value === ReadingMode.CONTINUOUS_HORIZONTAL ? ScrollDirection.X : ScrollDirection.Y;

                switch (action) {
                    case TapZoneRegionType.MENU:
                        setIsOverlayVisible((isVisible) => isStaticNav || !isVisible);
                        break;
                    case TapZoneRegionType.PREVIOUS:
                        if (isContinuousReadingModeActive) {
                            this.scroll(
                                ScrollOffset.BACKWARD,
                                scrollDirection,
                                readingDirection.value,
                                scrollElement,
                                openChapter,
                            );
                        } else {
                            openPage('previous');
                        }
                        break;
                    case TapZoneRegionType.NEXT:
                        if (isContinuousReadingModeActive) {
                            this.scroll(
                                ScrollOffset.FORWARD,
                                scrollDirection,
                                readingDirection.value,
                                scrollElement,
                                openChapter,
                            );
                        } else {
                            openPage('next');
                        }
                        break;
                    default:
                        throw new Error(`Unexpected "TapZoneRegionType" (${action})`);
                }
            },
            [scrollElement, currentPageIndex, pages, readingMode.value, openPage, readingDirection.value, openChapter],
        );
    }
}
