/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, RefObject, useCallback, useEffect, useMemo } from 'react';
import { Direction, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { userReaderStatePagesContext } from '@/features/reader/contexts/state/ReaderStatePagesContext.tsx';
import {
    getNextIndexFromPage,
    getNextPageIndex,
    getPage,
    getPageForMousePos,
    getProgressBarPositionInfo,
} from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { useReaderStateChaptersContext } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import {
    PageInViewportType,
    ProgressBarPosition,
    ReaderScrollAmount,
    ReaderTransitionPageMode,
    ReadingDirection,
    ReadingMode,
} from '@/features/reader/Reader.types.ts';
import { DirectionOffset, ScrollDirection, ScrollOffset, TranslationKey } from '@/base/Base.types.ts';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import {
    isATransitionPageVisible,
    isEndOfPageInViewport,
    isPageInViewport,
} from '@/features/reader/viewer/pager/ReaderPager.utils.tsx';
import { useReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlayContext.tsx';
import { useReaderTapZoneContext } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';
import { TapZoneRegionType, TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';
import { ReaderTapZoneService } from '@/features/reader/tap-zones/ReaderTapZoneService.ts';
import { isContinuousReadingMode } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import {
    getReaderChapterFromCache,
    getReaderOpenChapterResumeMode,
    updateReaderStateVisibleChapters,
} from '@/features/reader/Reader.utils.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { ChapterIdInfo, TChapterReader } from '@/features/chapter/Chapter.types.ts';
import { awaitConfirmation } from '@/base/utils/AwaitableDialog.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { TReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import {
    ReaderProgressBarProps,
    TReaderProgressCurrentPage,
} from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';

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
        setIsOverlayVisible: TReaderOverlayContext['setIsVisible'],
        setShowPreview: TReaderTapZoneContext['setShowPreview'],
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
        setShowPreview(false);

        const doScroll = (
            isAtStartForDirection: boolean,
            isAtEndForDirection: boolean,
            scrollToOptions: ScrollToOptions,
        ) => {
            if (isAtStartForDirection && offset === ScrollOffset.BACKWARD && isContinuousReadingModeActive) {
                openChapter('previous');
                return;
            }

            if (isAtEndForDirection && offset === ScrollOffset.FORWARD && isContinuousReadingModeActive) {
                openChapter('next');
                return;
            }

            element.scroll({
                ...scrollToOptions,
                behavior: 'smooth',
            });
        };

        switch (direction) {
            case ScrollDirection.X:
                doScroll(isAtStartXForDirection, isAtEndXForDirection, {
                    left: getNewScrollPosition(element.scrollLeft, element.clientWidth),
                });
                break;
            case ScrollDirection.Y:
                doScroll(isAtStartY, isAtEndY, { top: getNewScrollPosition(element.scrollTop, element.clientHeight) });
                break;
            default:
                throw new Error(`Unexpected "ScrollDirection" (${direction})`);
        }
    }

    static useOpenChapter(): (
        offset: 'previous' | 'next' | ChapterIdInfo['id'],
        doTransitionCheck?: boolean,
        scrollIntoView?: boolean,
    ) => void {
        const { t } = useTranslation();
        const {
            readingMode,
            shouldInformAboutMissingChapter,
            shouldInformAboutScanlatorChange,
            shouldUseInfiniteScroll,
        } = ReaderService.useSettings();
        const {
            currentChapter,
            previousChapter,
            nextChapter,
            chapters,
            visibleChapters: { lastLeadingChapterSourceOrder, lastTrailingChapterSourceOrder },
            setReaderStateChapters,
        } = useReaderStateChaptersContext();

        const openChapter = ReaderService.useNavigateToChapter();

        return useCallback(
            (offset, doTransitionCheck = true, scrollIntoView = true) => {
                if (!currentChapter) {
                    return;
                }

                const isSpecificChapterMode = typeof offset === 'number';
                const isPreviousOffset = offset === 'previous';

                const doesPreviousChapterExist = isPreviousOffset && !!previousChapter;
                const doesNextChapterExist = !isPreviousOffset && !!nextChapter;

                const canOpenNextChapter = isSpecificChapterMode || doesPreviousChapterExist || doesNextChapterExist;
                if (!canOpenNextChapter) {
                    return;
                }

                const doOpenChapter = async () => {
                    const chapterToOpen = (() => {
                        if (isSpecificChapterMode) {
                            return chapters.find((chapter) => chapter.id === offset);
                        }

                        if (isPreviousOffset) {
                            return previousChapter;
                        }

                        return nextChapter;
                    })();

                    if (!chapterToOpen) {
                        return;
                    }

                    const isPreviousChapter = chapterToOpen.sourceOrder < currentChapter.sourceOrder;

                    try {
                        if (doTransitionCheck) {
                            await ReaderControls.checkNextChapterConsistency(
                                t,
                                isPreviousChapter ? 'previous' : 'next',
                                currentChapter,
                                chapterToOpen,
                                shouldInformAboutMissingChapter,
                                shouldInformAboutScanlatorChange,
                            );
                        }

                        const isAlreadyLoaded =
                            lastLeadingChapterSourceOrder <= chapterToOpen.sourceOrder &&
                            lastTrailingChapterSourceOrder >= chapterToOpen.sourceOrder;
                        const keepRenderedChapters = shouldUseInfiniteScroll && (!scrollIntoView || isAlreadyLoaded);

                        if (keepRenderedChapters) {
                            setReaderStateChapters((prevState) =>
                                updateReaderStateVisibleChapters(
                                    isPreviousChapter,
                                    prevState,
                                    chapterToOpen.sourceOrder,
                                    scrollIntoView,
                                    isPreviousChapter ? false : undefined,
                                    !isPreviousChapter ? false : undefined,
                                ),
                            );
                        }

                        openChapter(chapterToOpen, {
                            resumeMode: getReaderOpenChapterResumeMode(
                                isSpecificChapterMode || !keepRenderedChapters,
                                isPreviousChapter,
                            ),
                            updateInitialChapter: !keepRenderedChapters,
                        });
                    } catch (error) {
                        defaultPromiseErrorHandler('ReaderControls#useOpenChapter#doOpenChapter:')(error);
                    }
                };

                doOpenChapter().catch(defaultPromiseErrorHandler('ReaderControls#useOpenChapter'));
            },
            [
                t,
                currentChapter?.id,
                openChapter,
                readingMode.value,
                shouldInformAboutMissingChapter,
                shouldInformAboutScanlatorChange,
                lastLeadingChapterSourceOrder,
                lastTrailingChapterSourceOrder,
                shouldUseInfiniteScroll,
            ],
        );
    }

    private static async checkNextChapterConsistency(
        t: TFunction,
        offset: 'previous' | 'next',
        currentChapter: TChapterReader | null | undefined,
        chapterToOpen: TChapterReader | null | undefined,
        shouldInformAboutMissingChapter: boolean,
        shouldInformAboutScanlatorChange: boolean,
    ): Promise<void> {
        if (!currentChapter || !chapterToOpen) {
            return;
        }

        const missingChapters = Chapters.getGap(currentChapter, chapterToOpen);
        const isSameScanlator =
            !shouldInformAboutScanlatorChange || currentChapter.scanlator === chapterToOpen.scanlator;
        const isContinuousChapter = !shouldInformAboutMissingChapter || !missingChapters;

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
        const { setShowPreview } = useReaderTapZoneContext();
        const { readingDirection, readingMode, shouldShowTransitionPage } = ReaderService.useSettings();
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
        const isATransitionPageVisibleFlag = isATransitionPageVisible(transitionPageMode, readingMode.value);
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
                    setShowPreview(false);
                }

                const hideTransitionPage = () => setTransitionPageMode(ReaderTransitionPageMode.NONE);

                if (typeof page === 'number') {
                    setPageToScrollToIndex(page);
                    hideTransitionPage();
                    return;
                }

                const areContinuousPagerTransitionPagesVisible =
                    isContinuousReadingModeActive && isATransitionPageVisibleFlag;
                const isPreviousTransitionPageVisible =
                    (!isContinuousReadingModeActive && transitionPageMode === ReaderTransitionPageMode.PREVIOUS) ||
                    areContinuousPagerTransitionPagesVisible;
                const isNextTransitionPageVisible =
                    (!isContinuousReadingModeActive && transitionPageMode === ReaderTransitionPageMode.NEXT) ||
                    areContinuousPagerTransitionPagesVisible;

                const shouldOpenPreviousChapter =
                    isFirstPage &&
                    (!shouldShowTransitionPage || isPreviousTransitionPageVisible) &&
                    convertedPage === 'previous' &&
                    !!previousChapter;
                if (shouldOpenPreviousChapter) {
                    openChapter('previous');
                    return;
                }

                const shouldOpenNextChapter =
                    isLastPage &&
                    (!shouldShowTransitionPage || isNextTransitionPageVisible) &&
                    convertedPage === 'next' &&
                    !!nextChapter;
                if (shouldOpenNextChapter) {
                    openChapter('next');
                    return;
                }

                const isPreviousMode = convertedPage === 'previous';
                const isNextMode = convertedPage === 'next';

                const closePreviousTransitionPage = isPreviousTransitionPageVisible && isNextMode;
                const closeNextTransitionPage = isNextTransitionPageVisible && isPreviousMode;

                const needToHideTransitionPage =
                    isATransitionPageVisibleFlag &&
                    !isContinuousReadingModeActive &&
                    (closePreviousTransitionPage || closeNextTransitionPage);
                if (needToHideTransitionPage) {
                    hideTransitionPage();
                    setPageToScrollToIndex(isPreviousTransitionPageVisible ? indexOfFirstPage : indexOfLastPage);

                    return;
                }

                const needToOpenTransitionPage =
                    ((isFirstPage && isPreviousMode) || (isLastPage && isNextMode)) && !isContinuousReadingModeActive;
                if (needToOpenTransitionPage) {
                    setTransitionPageMode(
                        isPreviousMode ? ReaderTransitionPageMode.PREVIOUS : ReaderTransitionPageMode.NEXT,
                    );
                    return;
                }

                setPageToScrollToIndex(isPreviousMode ? previousPageIndex : nextPageIndex);
            },
            [
                direction,
                indexOfFirstPage,
                indexOfLastPage,
                previousPageIndex,
                nextPageIndex,
                indexOfLastPage,
                isATransitionPageVisibleFlag,
                isContinuousReadingModeActive,
                isFirstPage,
                isLastPage,
                openChapter,
                !!previousChapter,
                !!nextChapter,
                shouldShowTransitionPage,
            ],
        );
    }

    static useUpdateCurrentPageIndex(): (
        pageIndex: number,
        debounceChapterUpdate?: boolean,
        endReached?: boolean,
    ) => void {
        const { currentPageIndex, setCurrentPageIndex } = userReaderStatePagesContext();
        const { currentChapter, chapters, previousChapter, nextChapter, visibleChapters, setReaderStateChapters } =
            useReaderStateChaptersContext();
        const updateChapter = ReaderService.useUpdateChapter();
        const {
            settings: { downloadAheadLimit },
        } = useMetadataServerSettings();

        const nextChapters = useMemo(() => {
            if (!currentChapter) {
                return [];
            }

            return Chapters.getNextChapters(currentChapter, chapters, {
                offset: DirectionOffset.NEXT,
            });
        }, [currentChapter?.id, chapters]);

        return useCallback(
            (pageIndex, debounceChapterUpdate = true, endReached = false) => {
                if (pageIndex === currentPageIndex && !endReached) {
                    return;
                }

                setCurrentPageIndex(pageIndex);

                if (!currentChapter) {
                    return;
                }

                const direction = currentPageIndex > pageIndex ? DirectionOffset.PREVIOUS : DirectionOffset.NEXT;

                ReaderService.downloadAhead(currentChapter, nextChapter, nextChapters, pageIndex, downloadAheadLimit);
                ReaderService.preloadChapter(
                    pageIndex,
                    currentChapter.pageCount,
                    direction === DirectionOffset.NEXT ? nextChapter : previousChapter,
                    visibleChapters.lastLeadingChapterSourceOrder,
                    visibleChapters.lastTrailingChapterSourceOrder,
                    setReaderStateChapters,
                    direction,
                );

                const handleCurrentPageIndexChange = () => {
                    const currentChapterUpToDate = getReaderChapterFromCache(currentChapter.id);
                    if (!currentChapterUpToDate) {
                        return;
                    }

                    const actualPageIndex = endReached ? currentChapterUpToDate.pageCount - 1 : pageIndex;
                    const isLastPage = actualPageIndex === currentChapterUpToDate.pageCount - 1;

                    updateChapter({
                        lastPageRead: actualPageIndex,
                        isRead: isLastPage ? true : undefined,
                    });
                };

                clearTimeout(ReaderControls.updateCurrentPageTimeout);
                if (debounceChapterUpdate) {
                    ReaderControls.updateCurrentPageTimeout = setTimeout(handleCurrentPageIndexChange, 1000);
                    return;
                }

                handleCurrentPageIndexChange();
            },
            [
                currentChapter?.id,
                previousChapter?.id,
                nextChapter?.id,
                nextChapters,
                currentPageIndex,
                downloadAheadLimit,
                visibleChapters,
            ],
        );
    }

    static updateCurrentPageOnScroll(
        imageRefs: MutableRefObject<(HTMLElement | null)[]>,
        lastPageIndex: number,
        updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>,
        type: PageInViewportType,
        readingDirection: ReadingDirection,
    ) {
        const themeDirectionForReadingDirection = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];

        const firstVisibleImageIndex = imageRefs.current.findIndex(
            (image) =>
                image &&
                isPageInViewport(
                    image,
                    type,
                    // the pages aren't always properly scrolled to the top which results in the leading page to still be slightly
                    // visible (e.g. 0.0123px) breaking the "first visible image" detection
                    {
                        bottom: 1,
                        left: getOptionForDirection(0, window.innerWidth + 1, themeDirectionForReadingDirection),
                        right: getOptionForDirection(1, 0, themeDirectionForReadingDirection),
                    },
                ),
        );
        const lastPage = imageRefs.current?.[imageRefs.current.length - 1];
        const isEndReached = lastPage && isEndOfPageInViewport(lastPage, type, readingDirection);

        if (firstVisibleImageIndex === -1) {
            return;
        }

        // handle cases where the last page is too small to ever be the "firstVisibleImageIndex"
        if (isEndReached) {
            updateCurrentPageIndex(firstVisibleImageIndex, false, true);
            return;
        }

        updateCurrentPageIndex(firstVisibleImageIndex, firstVisibleImageIndex !== lastPageIndex);
    }

    static useHandleClick(
        scrollElement: HTMLElement | null,
    ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
        const { direction: themeDirection } = useTheme();
        const { setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
        const { currentPageIndex, pages } = userReaderStatePagesContext();
        const { setShowPreview } = useReaderTapZoneContext();
        const { readingMode, readingDirection, isStaticNav, scrollAmount } = ReaderService.useSettings();
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
                    case TapZoneRegionType.NEXT:
                        if (isContinuousReadingModeActive) {
                            ReaderControls.scroll(
                                action === TapZoneRegionType.PREVIOUS ? ScrollOffset.BACKWARD : ScrollOffset.FORWARD,
                                scrollDirection,
                                readingMode.value,
                                readingDirection.value,
                                themeDirection,
                                scrollElement,
                                openChapter,
                                setIsOverlayVisible,
                                setShowPreview,
                                scrollAmount,
                            );
                        } else {
                            openPage(action === TapZoneRegionType.PREVIOUS ? 'previous' : 'next', 'ltr');
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
                isStaticNav,
                scrollAmount,
            ],
        );
    }

    static useHandleProgressDragging(
        openPage: ReturnType<(typeof ReaderControls)['useOpenPage']>,
        progressBarRef: RefObject<HTMLDivElement | null>,
        isDragging: boolean,
        currentPage: TReaderProgressCurrentPage,
        pages: ReaderProgressBarProps['pages'],
        progressBarPosition: ProgressBarPosition,
        getOptionForDirectionFn: typeof getOptionForDirection,
        fullSegmentClicks: boolean,
    ): void {
        useEffect(() => {
            if (!isDragging) {
                return () => undefined;
            }

            const { isHorizontal } = getProgressBarPositionInfo(progressBarPosition);

            const handleMove = (coordinates: { clientX: number; clientY: number }) => {
                if (!progressBarRef.current) {
                    return;
                }

                const newPageIndex = getNextIndexFromPage(
                    getPageForMousePos(
                        coordinates,
                        progressBarRef.current,
                        pages,
                        isHorizontal,
                        fullSegmentClicks,
                        getOptionForDirectionFn,
                    ),
                );

                const hasCurrentPageIndexChanged = getNextIndexFromPage(currentPage) !== newPageIndex;
                if (!hasCurrentPageIndexChanged) {
                    return;
                }

                openPage(newPageIndex, undefined, false);
            };

            const handleMouseMove = (e: MouseEvent) => {
                handleMove(e);
            };

            const handleTouchMove = (e: TouchEvent) => {
                if (e.touches.length > 0) {
                    handleMove(e.touches[0]);
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('touchmove', handleTouchMove);
            };
        }, [openPage, isDragging, currentPage, pages, progressBarPosition]);
    }
}
