/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ContextType, MutableRefObject, useCallback, useMemo } from 'react';
import { Direction, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { getNextIndexFromPage, getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
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
import {
    ReaderScrollAmount,
    READING_DIRECTION_TO_THEME_DIRECTION,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { isEndOfPageInViewport, isPageInViewport } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderOverlayContext, useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { TapZoneRegionType } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { ReaderTapZoneService } from '@/modules/reader/services/ReaderTapZoneService.ts';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { getReaderChapterFromCache } from '@/modules/reader/utils/Reader.utils.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset, TranslationKey } from '@/Base.types.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { awaitConfirmation } from '@/modules/core/utils/AwaitableDialog.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

const getScrollDirectionInvert = (
    scrollDirection: ScrollDirection,
    scrollOffset: ScrollOffset,
    themeDirection: Direction,
): 1 | -1 => {
    if (scrollDirection === ScrollDirection.X) {
        if (scrollOffset === ScrollOffset.BACKWARD) {
            if (themeDirection === 'ltr') {
                return -1;
            }

            return 1;
        }

        if (scrollOffset === ScrollOffset.FORWARD) {
            if (themeDirection === 'ltr') {
                return 1;
            }

            return -1;
        }
    }

    // handle ScrollDirection.XY the same as ScrollDirection.Y
    if (scrollOffset === ScrollOffset.BACKWARD) {
        return -1;
    }

    return 1;
};

export class ReaderControls {
    private static updateCurrentPageTimeout: NodeJS.Timeout;

    static scroll(
        offset: ScrollOffset,
        direction: ScrollDirection,
        readingMode: ReadingMode,
        readingDirection: ReadingDirection,
        themeDirection: Direction,
        element: HTMLElement,
        openChapter: ReturnType<(typeof ReaderControls)['useOpenChapter']>,
        setIsOverlayVisible: ContextType<typeof ReaderOverlayContext>['setIsVisible'],
        scrollAmountPercentage: number = ReaderScrollAmount.LARGE,
    ): void {
        if (!element) {
            return;
        }

        const themeDirectionOfReadingDirection = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];
        const areReadingDirectionsEqual = themeDirection === themeDirectionOfReadingDirection;
        const isContinuousReadingModeActive = isContinuousReadingMode(readingMode);

        const isAtStartY = Math.abs(element.scrollTop) <= 1;
        const isAtEndY =
            Math.floor(element.scrollTop) === element.scrollHeight - element.clientHeight ||
            Math.ceil(element.scrollTop) === element.scrollHeight - element.clientHeight;
        const isAtStartX = Math.abs(element.scrollLeft) <= 1;
        const isAtEndX =
            element.scrollWidth - element.clientWidth - Math.floor(Math.abs(element.scrollLeft)) <= 1 ||
            element.scrollWidth - element.clientWidth - Math.ceil(Math.abs(element.scrollLeft)) <= 1;
        const isAtStartXForDirection = areReadingDirectionsEqual ? isAtStartX : isAtEndX;
        const isAtEndXForDirection = areReadingDirectionsEqual ? isAtEndX : isAtStartX;

        const scrollAmount = scrollAmountPercentage / 100;
        const scrollDirection = getScrollDirectionInvert(direction, offset, themeDirectionOfReadingDirection);

        const getNewScrollPosition = (currentPos: number, elementSize: number) =>
            currentPos + elementSize * scrollAmount * scrollDirection;

        setIsOverlayVisible(false);

        switch (direction) {
            case ScrollDirection.X:
                if (isAtStartXForDirection && offset === ScrollOffset.BACKWARD && isContinuousReadingModeActive) {
                    openChapter('previous');
                    return;
                }

                if (isAtEndXForDirection && offset === ScrollOffset.FORWARD && isContinuousReadingModeActive) {
                    openChapter('next');
                    return;
                }

                element.scroll({
                    left: getNewScrollPosition(element.scrollLeft, element.clientWidth),
                    behavior: 'smooth',
                });
                break;
            case ScrollDirection.Y:
                if (isAtStartY && offset === ScrollOffset.BACKWARD && isContinuousReadingModeActive) {
                    openChapter('previous');
                    return;
                }

                if (isAtEndY && offset === ScrollOffset.FORWARD && isContinuousReadingModeActive) {
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
        const { t } = useTranslation();
        const { readingMode } = ReaderService.useSettings();
        const { currentChapter, previousChapter, nextChapter } = useReaderStateChaptersContext();

        const openPreviousChapter = ReaderService.useNavigateToChapter(previousChapter, ReaderResumeMode.END);
        const openNextChapter = ReaderService.useNavigateToChapter(nextChapter, ReaderResumeMode.START);

        return useCallback(
            (offset) => {
                switch (offset) {
                    case 'previous':
                        ReaderControls.checkNextChapterConsistency(t, offset, currentChapter, previousChapter)
                            .then(openPreviousChapter)
                            .catch(defaultPromiseErrorHandler('ReaderControls::checkNextChapterConsistency: previous'));
                        break;
                    case 'next':
                        ReaderControls.checkNextChapterConsistency(t, offset, currentChapter, nextChapter)
                            .then(openNextChapter)
                            .catch(defaultPromiseErrorHandler('ReaderControls::checkNextChapterConsistency: next'));
                        break;
                    default:
                        throw new Error(`Unexpected "offset" (${offset})`);
                }
            },
            [t, currentChapter?.id, openPreviousChapter, openNextChapter, readingMode.value],
        );
    }

    private static async checkNextChapterConsistency(
        t: TFunction,
        offset: 'previous' | 'next',
        currentChapter?: TChapterReader | null,
        chapterToOpen?: TChapterReader | null,
    ): Promise<void> {
        if (!currentChapter || !chapterToOpen) {
            return;
        }

        const missingChapters = Math.abs(currentChapter.chapterNumber - chapterToOpen.chapterNumber);
        const isSameScanlator = currentChapter.scanlator === chapterToOpen.scanlator;
        const isContinuousChapter = missingChapters <= 1;

        const showWarning = !isSameScanlator || !isContinuousChapter;
        if (!showWarning) {
            return;
        }

        const offsetToTranslationKeys: Record<typeof offset, Record<'scanlator' | 'chapter_number', TranslationKey>> = {
            previous: {
                scanlator: 'reader.chapter_transition.warning.previous.scanlator',
                chapter_number: 'reader.chapter_transition.warning.previous.chapter_number',
            },
            next: {
                scanlator: 'reader.chapter_transition.warning.next.scanlator',
                chapter_number: 'reader.chapter_transition.warning.next.chapter_number',
            },
        };

        const sameScanlator = isSameScanlator
            ? ''
            : t(offsetToTranslationKeys[offset].scanlator, {
                  nextScanlator: chapterToOpen.scanlator,
                  currentScanlator: currentChapter.scanlator,
              });
        const continuousChapter = isContinuousChapter
            ? ''
            : t(offsetToTranslationKeys[offset].chapter_number, {
                  count: missingChapters,
                  nextChapter: `#${chapterToOpen.chapterNumber} ${chapterToOpen.name}`,
                  currentChapter: `#${currentChapter.chapterNumber} ${currentChapter.name}`,
              });
        const warningLineBreak = !isSameScanlator && !isContinuousChapter ? '\n\n' : '';
        const warning = `${sameScanlator}${warningLineBreak}${continuousChapter}`;

        await awaitConfirmation({
            title: t('reader.chapter_transition.warning.title'),
            message: warning,
            actions: {
                confirm: {
                    title: t('global.button.open'),
                },
            },
        });
    }

    static useOpenPage(): (
        page: number | 'previous' | 'next',
        forceDirection?: Direction,
        hideOverlay?: boolean,
    ) => void {
        const { currentPageIndex, setPageToScrollToIndex, pages, transitionPageMode, setTransitionPageMode } =
            userReaderStatePagesContext();
        const { previousChapter, nextChapter } = useReaderStateChaptersContext();
        const { setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
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
        const indexOfFirstPage = getNextIndexFromPage(pages[0]);
        const indexOfLastPage = getNextIndexFromPage(pages[pages.length - 1]);
        const direction = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection.value];

        const isFirstPage = currentPage.primary.index === 0;
        const isLastPage = currentPageIndex === indexOfLastPage;
        const isATransitionPageVisible = transitionPageMode !== ReaderTransitionPageMode.NONE;
        const isContinuousReadingModeActive = isContinuousReadingMode(readingMode.value);

        return useCallback(
            (page, forceDirection = direction, hideOverlay: boolean = true) => {
                const convertedPage = getOptionForDirection(
                    page,
                    page === 'previous' ? 'next' : 'previous',
                    forceDirection,
                );

                if (hideOverlay) {
                    setIsOverlayVisible(false);
                }

                const hideTransitionPage = () => setTransitionPageMode(ReaderTransitionPageMode.NONE);

                if (typeof page === 'number') {
                    setPageToScrollToIndex(page);
                    hideTransitionPage();
                    return;
                }

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

                const needToHideTransitionPage = isATransitionPageVisible && !isContinuousReadingModeActive;
                switch (convertedPage) {
                    case 'previous':
                        if (isFirstPage) {
                            setTransitionPageMode(ReaderTransitionPageMode.PREVIOUS);
                            return;
                        }

                        if (needToHideTransitionPage) {
                            hideTransitionPage();
                            setPageToScrollToIndex(indexOfLastPage);
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
                            setPageToScrollToIndex(indexOfFirstPage);
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
                indexOfFirstPage,
                indexOfLastPage,
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

                ReaderService.downloadAhead(currentChapter, nextChapter, nextChapters, pageIndex, downloadAheadLimit);

                const handleCurrentPageIndexChange = () => {
                    const currentChapterUpToDate = getReaderChapterFromCache(currentChapter.id);
                    if (!currentChapterUpToDate) {
                        return;
                    }

                    const actualPageIndex = endReached ? currentChapterUpToDate.pageCount - 1 : pageIndex;

                    const hasLastPageReadChanged = actualPageIndex !== currentChapterUpToDate.lastPageRead;
                    const isLastPage = actualPageIndex === currentChapterUpToDate.pageCount - 1;
                    const hasIsReadChanged = (isLastPage || endReached) && !currentChapterUpToDate.isRead;

                    const shouldUpdateChapter = hasLastPageReadChanged || hasIsReadChanged;
                    if (!shouldUpdateChapter) {
                        return;
                    }

                    updateChapter({
                        lastPageRead: hasLastPageReadChanged ? actualPageIndex : undefined,
                        isRead: isLastPage ? true : undefined,
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
            updateCurrentPageIndex(firstVisibleImageIndex, false, true);
            return;
        }

        if (firstVisibleImageIndex !== -1) {
            updateCurrentPageIndex(firstVisibleImageIndex, firstVisibleImageIndex !== lastPageIndex);
        }
    }

    static useHandleClick(
        scrollElement: HTMLElement | null,
    ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
        const { direction: themeDirection } = useTheme();
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
                                readingMode.value,
                                readingDirection.value,
                                themeDirection,
                                scrollElement,
                                openChapter,
                                setIsOverlayVisible,
                            );
                        } else {
                            openPage('previous', 'ltr');
                        }
                        break;
                    case TapZoneRegionType.NEXT:
                        if (isContinuousReadingModeActive) {
                            this.scroll(
                                ScrollOffset.FORWARD,
                                scrollDirection,
                                readingMode.value,
                                readingDirection.value,
                                themeDirection,
                                scrollElement,
                                openChapter,
                                setIsOverlayVisible,
                            );
                        } else {
                            openPage('next', 'ltr');
                        }
                        break;
                    default:
                        throw new Error(`Unexpected "TapZoneRegionType" (${action})`);
                }
            },
            [
                scrollElement,
                currentPageIndex,
                pages,
                readingMode.value,
                openPage,
                readingDirection.value,
                openChapter,
                themeDirection,
            ],
        );
    }
}
