/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Direction } from '@mui/material/styles';
import {
    ReaderPageSpreadState,
    ReaderResumeMode,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { ChapterIdInfo, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { CHAPTER_READER_FIELDS } from '@/lib/graphql/fragments/ChapterFragments.ts';
import { useAutomaticScrolling } from '@/modules/core/hooks/useAutomaticScrolling.ts';
import { TReaderOverlayContext } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { getNextIndexFromPage, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { DirectionOffset } from '@/Base.types.ts';
import {
    createPagesData,
    getScrollIntoViewInlineOption,
    getScrollToXForReadingDirection,
    isPageOfOutdatedPageLoadStates,
    isSpreadPage,
} from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { coerceIn } from '@/lib/HelperFunctions.ts';
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const getInitialReaderPageIndex = (
    resumeMode: ReaderResumeMode,
    lastReadPageIndex: number,
    lastPageIndex: number,
): number => {
    if (resumeMode === ReaderResumeMode.START) {
        return 0;
    }

    if (resumeMode === ReaderResumeMode.END) {
        return lastPageIndex;
    }

    return coerceIn(lastReadPageIndex, 0, lastPageIndex);
};

export const getReaderChapterFromCache = (id: ChapterIdInfo['id']): TChapterReader | null =>
    Chapters.getFromCache<TChapterReader>(id, CHAPTER_READER_FIELDS, 'CHAPTER_READER_FIELDS')!;

export const getChapterIdsToDeleteForChapterUpdate = (
    chapter: TChapterReader,
    chapters: TChapterReader[],
    previousChapters: TChapterReader[],
    patch: UpdateChapterPatchInput,
    deleteChaptersWhileReading: number,
    deleteChaptersWithBookmark: boolean,
    shouldSkipDupChapters: boolean,
): TChapterReader['id'][] => {
    const isAutoDeletionEnabled = !!patch.isRead && !!deleteChaptersWhileReading;
    if (!isAutoDeletionEnabled) {
        return [];
    }

    const chapterToDelete = [chapter, ...previousChapters][deleteChaptersWhileReading - 1];
    if (!chapterToDelete) {
        return [];
    }

    const chapterToDeleteUpToDateData = getReaderChapterFromCache(chapterToDelete.id);
    if (!chapterToDeleteUpToDateData) {
        return [];
    }

    const shouldDeleteChapter =
        chapterToDeleteUpToDateData.isRead &&
        Chapters.isDeletable(chapterToDeleteUpToDateData, deleteChaptersWithBookmark);
    if (!shouldDeleteChapter) {
        return [];
    }

    if (!shouldSkipDupChapters) {
        return Chapters.getIds([chapterToDelete]);
    }

    return Chapters.getIds(Chapters.addDuplicates([chapterToDelete], chapters));
};

export const getChapterIdsForDownloadAhead = (
    chapter: TChapterReader,
    nextChapter: TChapterReader | undefined,
    nextChapters: TChapterReader[],
    currentPageIndex: number,
    downloadAheadLimit: number,
): TChapterReader['id'][] => {
    const chapterUpToDateData = getReaderChapterFromCache(chapter.id);
    if (!chapterUpToDateData || !nextChapter) {
        return [];
    }

    const isDownloadAheadEnabled = !!downloadAheadLimit;
    const inDownloadRange = (currentPageIndex + 1) / chapterUpToDateData.pageCount > 0.25;
    const shouldCheckDownloadAhead = isDownloadAheadEnabled && chapterUpToDateData.isDownloaded && inDownloadRange;
    if (!shouldCheckDownloadAhead) {
        return [];
    }

    const nextChapterUpToDateData = getReaderChapterFromCache(nextChapter.id);

    if (!nextChapterUpToDateData?.isDownloaded) {
        return [];
    }

    const unreadNextChaptersUpToDateData = Chapters.getNonRead(nextChapters)
        .map((unreadNextChapter) => getReaderChapterFromCache(unreadNextChapter.id))
        .filter((unreadNextChapterUpToDateData) => !!unreadNextChapterUpToDateData);

    return unreadNextChaptersUpToDateData
        .slice(-downloadAheadLimit)
        .filter((unreadNextChapter) => !unreadNextChapter.isDownloaded)
        .map((unreadUnDownloadedNextChapter) => unreadUnDownloadedNextChapter.id)
        .filter((id) => !Chapters.isDownloading(id));
};

export const createUpdateReaderPageLoadState =
    (
        actualPages: ReaderStatePages['pages'],
        pagesToSpreadState: ReaderPageSpreadState[],
        setPagesToSpreadState: React.Dispatch<React.SetStateAction<ReaderPageSpreadState[]>>,
        pageLoadStates: ReaderStatePages['pageLoadStates'],
        setPageLoadStates: ReaderStatePages['setPageLoadStates'],
        readingMode: ReadingMode,
    ) =>
    (pagesIndex: number, url: string, isPrimary: boolean = true) => {
        if (pagesIndex > actualPages.length - 1) {
            return;
        }

        const page = actualPages[pagesIndex];
        const { index } = isPrimary ? page.primary : page.secondary!;

        if (readingMode === ReadingMode.DOUBLE_PAGE) {
            const img = new Image();
            img.onload = () => {
                const isSpreadPageFlag = isSpreadPage(img);
                if (!isSpreadPageFlag) {
                    return;
                }

                setPagesToSpreadState((prevState) => {
                    const pageSpreadState = prevState[index];

                    const isOfOutdatedSpreadState = pageSpreadState === undefined || pageSpreadState.url !== url;
                    if (isOfOutdatedSpreadState) {
                        return prevState;
                    }

                    if (pageSpreadState.isSpread === isSpreadPageFlag) {
                        return prevState;
                    }

                    return prevState.toSpliced(index, 1, { url, isSpread: isSpreadPageFlag });
                });
            };
            img.src = url;
        }

        setPageLoadStates((statePageLoadStates) => {
            const pageLoadState = statePageLoadStates[index];

            if (isPageOfOutdatedPageLoadStates(url, pageLoadState)) {
                return statePageLoadStates;
            }

            if (pageLoadState.loaded) {
                return statePageLoadStates;
            }

            return statePageLoadStates.toSpliced(index, 1, { url: pageLoadState.url, loaded: true });
        });
    };

export const useReaderConvertPagesForReadingMode = (
    currentPageIndex: number,
    actualPages: ReaderStatePages['pages'],
    pageUrls: ReaderStatePages['pageUrls'],
    setPages: ReaderStatePages['setPages'],
    setPagesToSpreadState: (states: ReaderPageSpreadState[]) => void,
    updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>,
    readingMode: ReadingMode,
) => {
    const [wasDoublePageMode, setWasDoublePageMode] = useState(readingMode === ReadingMode.DOUBLE_PAGE);

    useLayoutEffect(() => {
        const convertPagesToNormalPageMode = wasDoublePageMode && readingMode !== ReadingMode.DOUBLE_PAGE;
        if (convertPagesToNormalPageMode) {
            setWasDoublePageMode(false);

            const newPageData = createPagesData(pageUrls);
            setPages(newPageData);
            setPagesToSpreadState(newPageData.map(({ primary: { url } }) => ({ url, isSpread: false })));
            return;
        }

        const convertPagesToDoublePageMode = readingMode === ReadingMode.DOUBLE_PAGE;
        if (convertPagesToDoublePageMode) {
            if (!wasDoublePageMode) {
                updateCurrentPageIndex(getNextIndexFromPage(getPage(currentPageIndex, actualPages)));
            }
            setPages(actualPages);
            setWasDoublePageMode(readingMode === ReadingMode.DOUBLE_PAGE);
        }
    }, [actualPages, readingMode]);
};

export const useReaderHandlePageSelection = (
    pageToScrollToIndex: ReaderStatePages['pageToScrollToIndex'],
    currentPageIndex: number,
    pages: ReaderStatePages['pages'],
    totalPages: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>,
    isContinuousReadingModeActive: boolean,
    imageRefs: MutableRefObject<(HTMLElement | null)[]>,
    themeDirection: Direction,
    readingDirection: ReadingDirection,
) => {
    useLayoutEffect(() => {
        if (pageToScrollToIndex == null) {
            return;
        }

        const pageToScrollTo = getPage(pageToScrollToIndex, pages);

        if (isContinuousReadingModeActive) {
            const directionOffset =
                pageToScrollToIndex > currentPageIndex ? DirectionOffset.PREVIOUS : DirectionOffset.NEXT;
            const imageRef = imageRefs.current[pageToScrollTo.pagesIndex];

            imageRef?.scrollIntoView({
                block: 'start',
                inline: getScrollIntoViewInlineOption(directionOffset, themeDirection, readingDirection),
            });
        }

        const newPageIndex = getNextIndexFromPage(pageToScrollTo);
        const isLastPage = newPageIndex === totalPages - 1;

        setPageToScrollToIndex(null);
        updateCurrentPageIndex(newPageIndex, !isLastPage);
    }, [pageToScrollToIndex]);
};

export const useReaderScrollToStartOnPageChange = (
    currentPageIndex: ReaderStatePages['currentPageIndex'],
    isContinuousReadingModeActive: boolean,
    themeDirection: Direction,
    readingDirection: ReadingDirection,
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
): void => {
    useLayoutEffect(() => {
        if (!isContinuousReadingModeActive) {
            scrollElementRef.current?.scrollTo(
                getScrollToXForReadingDirection(scrollElementRef.current, themeDirection, readingDirection),
                0,
            );
        }
    }, [currentPageIndex]);
};

export const useReaderHideCursorOnInactivity = (scrollElementRef: MutableRefObject<HTMLDivElement | null>) => {
    const mouseInactiveTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const setCursorVisibility = (visible: boolean) => {
            const scrollElement = scrollElementRef.current;
            if (!scrollElement) {
                return;
            }

            scrollElement.style.cursor = visible ? 'default' : 'none';
        };

        const handleMouseMove = () => {
            setCursorVisibility(true);
            clearTimeout(mouseInactiveTimeout.current);
            mouseInactiveTimeout.current = setTimeout(() => {
                setCursorVisibility(false);
            }, 5000);
        };

        handleMouseMove();
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            setCursorVisibility(true);
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(mouseInactiveTimeout.current);
        };
    }, []);
};

export const useReaderHorizontalModeInvertXYScrolling = (
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
) => {
    // invert x and y scrolling for the continuous horizontal reading mode
    useEffect(() => {
        if (readingMode !== ReadingMode.CONTINUOUS_HORIZONTAL) {
            return () => {};
        }

        if (!scrollElementRef.current) {
            return () => {};
        }

        const handleScroll = (e: WheelEvent) => {
            e.preventDefault();

            if (e.shiftKey) {
                scrollElementRef.current?.scrollBy({
                    top: e.deltaY,
                });
                return;
            }

            scrollElementRef.current?.scrollBy({
                left: readingDirection === ReadingDirection.LTR ? e.deltaY : e.deltaY * -1,
            });
        };

        scrollElementRef.current.addEventListener('wheel', handleScroll);
        return () => scrollElementRef.current?.removeEventListener('wheel', handleScroll);
    }, [readingMode, readingDirection]);
};

export const useReaderHideOverlayOnUserScroll = (
    isOverlayVisible: boolean,
    setIsOverlayVisible: TReaderOverlayContext['setIsVisible'],
    showPreview: TReaderTapZoneContext['showPreview'],
    setShowPreview: TReaderTapZoneContext['setShowPreview'],
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
) => {
    useEffect(() => {
        const handleScroll = () => {
            if (isOverlayVisible) {
                setIsOverlayVisible(false);
            }

            if (showPreview) {
                setShowPreview(false);
            }
        };

        scrollElementRef.current?.addEventListener('wheel', handleScroll);
        scrollElementRef.current?.addEventListener('touchmove', handleScroll);
        return () => {
            scrollElementRef.current?.removeEventListener('wheel', handleScroll);
            scrollElementRef.current?.removeEventListener('touchmove', handleScroll);
        };
    }, [isOverlayVisible, showPreview]);
};

export const useReaderAutoScroll = (
    isOverlayVisible: boolean,
    automaticScrolling: ReturnType<typeof useAutomaticScrolling>,
): void => {
    useEffect(() => {
        if (isOverlayVisible) {
            automaticScrolling.pause();
            return;
        }

        automaticScrolling.resume();
    }, [isOverlayVisible, automaticScrolling.isPaused]);
};
