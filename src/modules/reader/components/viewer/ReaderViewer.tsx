/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    ForwardedRef,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import {
    IReaderSettings,
    PageInViewportType,
    ReaderPageSpreadState,
    ReadingMode,
    TReaderScrollbarContext,
} from '@/modules/reader/types/Reader.types.ts';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { getDoublePageModePages, isPageOfOutdatedPageLoadStates } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import {
    getPagerForReadingMode,
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
    shouldApplyReaderWidth,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { useMouseDragScroll } from '@/modules/core/hooks/useMouseDragScroll.tsx';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { TReaderOverlayContext } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderAutoScrollContext } from '@/modules/reader/contexts/ReaderAutoScrollContext.tsx';
import { createUpdateReaderPageLoadState } from '@/modules/reader/utils/Reader.utils.ts';
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { useReaderAutoScroll } from '@/modules/reader/hooks/useReaderAutoScroll.ts';
import { useReaderHideOverlayOnUserScroll } from '@/modules/reader/hooks/useReaderHideOverlayOnUserScroll.ts';
import { useReaderHorizontalModeInvertXYScrolling } from '@/modules/reader/hooks/useReaderHorizontalModeInvertXYScrolling.ts';
import { useReaderHideCursorOnInactivity } from '@/modules/reader/hooks/useReaderHideCursorOnInactivity.ts';
import { useReaderScrollToStartOnPageChange } from '@/modules/reader/hooks/useReaderScrollToStartOnPageChange.ts';
import { useReaderHandlePageSelection } from '@/modules/reader/hooks/useReaderHandlePageSelection.ts';
import { useReaderConvertPagesForReadingMode } from '@/modules/reader/hooks/useReaderConvertPagesForReadingMode.ts';

const READING_MODE_TO_IN_VIEWPORT_TYPE: Record<ReadingMode, PageInViewportType> = {
    [ReadingMode.SINGLE_PAGE]: PageInViewportType.X,
    [ReadingMode.DOUBLE_PAGE]: PageInViewportType.X,
    [ReadingMode.CONTINUOUS_VERTICAL]: PageInViewportType.Y,
    [ReadingMode.CONTINUOUS_HORIZONTAL]: PageInViewportType.X,
    [ReadingMode.WEBTOON]: PageInViewportType.Y,
};

const BaseReaderViewer = forwardRef(
    (
        {
            currentPageIndex,
            pageToScrollToIndex,
            setPageToScrollToIndex,
            pages,
            setPages,
            totalPages,
            pageUrls,
            pageLoadStates,
            setPageLoadStates,
            transitionPageMode,
            retryFailedPagesKeyPrefix,
            readingMode,
            shouldOffsetDoubleSpreads,
            readingDirection,
            readerWidth,
            pageScaleMode,
            setScrollbarXSize,
            setScrollbarYSize,
            isVisible: isOverlayVisible,
            setIsVisible: setIsOverlayVisible,
            updateCurrentPageIndex,
            showPreview,
            setShowPreview,
        }: Pick<
            ReaderStatePages,
            | 'currentPageIndex'
            | 'pageToScrollToIndex'
            | 'setPageToScrollToIndex'
            | 'pages'
            | 'setPages'
            | 'totalPages'
            | 'pageUrls'
            | 'pageLoadStates'
            | 'setPageLoadStates'
            | 'transitionPageMode'
            | 'retryFailedPagesKeyPrefix'
        > &
            Pick<
                IReaderSettings,
                'readingMode' | 'shouldOffsetDoubleSpreads' | 'readingDirection' | 'readerWidth' | 'pageScaleMode'
            > &
            Pick<TReaderScrollbarContext, 'setScrollbarXSize' | 'setScrollbarYSize'> &
            Pick<TReaderOverlayContext, 'isVisible' | 'setIsVisible'> &
            TReaderTapZoneContext & {
                updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>;
            },

        ref: ForwardedRef<HTMLDivElement | null>,
    ) => {
        const { direction: themeDirection } = useTheme();

        const scrollElementRef = useRef<HTMLDivElement | null>(null);
        useImperativeHandle(ref, () => scrollElementRef.current!);

        const isContinuousReadingModeActive = isContinuousReadingMode(readingMode);
        const isDragging = useMouseDragScroll(scrollElementRef);

        const automaticScrolling = useReaderAutoScrollContext();
        useEffect(() => automaticScrolling.setScrollRef(scrollElementRef), []);

        const scrollbarXSize = MediaQuery.useGetScrollbarSize('width', scrollElementRef.current);
        const scrollbarYSize = MediaQuery.useGetScrollbarSize('height', scrollElementRef.current);
        useLayoutEffect(() => {
            setScrollbarXSize(scrollbarXSize);
            setScrollbarYSize(scrollbarYSize);
        }, [scrollbarXSize, scrollbarYSize]);

        const handleClick = ReaderControls.useHandleClick(scrollElementRef.current);

        const previousTotalPages = useRef(totalPages);
        const [pagesToSpreadState, setPagesToSpreadState] = useState<ReaderPageSpreadState[]>(
            pageLoadStates.map(({ url }) => ({ url, isSpread: false })),
        );

        const resetPagesSpreadState = previousTotalPages.current !== totalPages;
        if (resetPagesSpreadState) {
            previousTotalPages.current = totalPages;
            setPagesToSpreadState(pageLoadStates.map(({ url }) => ({ url, isSpread: false })));
        }

        const imageRefs = useRef<(HTMLElement | null)[]>(pages.map(() => null));

        const actualPages = useMemo(() => {
            const arePagesLoaded = !!totalPages;
            if (!arePagesLoaded) {
                return pages;
            }

            if (readingMode === ReadingMode.DOUBLE_PAGE) {
                return getDoublePageModePages(
                    pageUrls,
                    pagesToSpreadState,
                    shouldOffsetDoubleSpreads,
                    readingDirection,
                );
            }

            return pages;
        }, [pagesToSpreadState, readingMode, shouldOffsetDoubleSpreads, readingDirection, totalPages]);

        const Pager = useMemo(() => getPagerForReadingMode(readingMode), [readingMode]);
        const inViewportType = READING_MODE_TO_IN_VIEWPORT_TYPE[readingMode];

        const onLoad = useMemo(
            () =>
                createUpdateReaderPageLoadState(
                    actualPages,
                    pagesToSpreadState,
                    setPagesToSpreadState,
                    pageLoadStates,
                    setPageLoadStates,
                    readingMode,
                ),
            // do not add "pagesToSpreadState" and "pageLoadStates" as a dependency, otherwise, every page gets re-rendered
            // when they change which impacts the performance massively (depending on the total page count)
            [actualPages, readingMode],
        );

        const onError = useCallback((pageIndex: number, url: string) => {
            setPageLoadStates((statePageLoadStates) => {
                const pageLoadState = statePageLoadStates[pageIndex];

                if (isPageOfOutdatedPageLoadStates(url, pageLoadState)) {
                    return statePageLoadStates;
                }

                return statePageLoadStates.toSpliced(pageIndex, 1, {
                    ...pageLoadState,
                    loaded: false,
                    error: true,
                });
            });
        }, []);

        useReaderConvertPagesForReadingMode(
            currentPageIndex,
            actualPages,
            pageUrls,
            setPages,
            setPagesToSpreadState,
            updateCurrentPageIndex,
            readingMode,
        );
        useReaderHandlePageSelection(
            pageToScrollToIndex,
            currentPageIndex,
            pages,
            totalPages,
            setPageToScrollToIndex,
            updateCurrentPageIndex,
            isContinuousReadingModeActive,
            imageRefs,
            themeDirection,
            readingDirection,
        );
        useReaderScrollToStartOnPageChange(
            currentPageIndex,
            isContinuousReadingModeActive,
            themeDirection,
            readingDirection,
            scrollElementRef,
        );
        useReaderHideCursorOnInactivity(scrollElementRef);
        useReaderHorizontalModeInvertXYScrolling(readingMode, readingDirection, scrollElementRef);
        useReaderHideOverlayOnUserScroll(
            isOverlayVisible,
            setIsOverlayVisible,
            showPreview,
            setShowPreview,
            scrollElementRef,
        );
        useReaderAutoScroll(isOverlayVisible, automaticScrolling);

        return (
            <Stack
                ref={scrollElementRef}
                sx={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    ...applyStyles(
                        isContinuousVerticalReadingMode(readingMode) &&
                            shouldApplyReaderWidth(readerWidth, pageScaleMode),
                        { alignItems: 'center' },
                    ),
                }}
                onClick={(e) => !isDragging && handleClick(e)}
                onScroll={() =>
                    ReaderControls.updateCurrentPageOnScroll(
                        imageRefs,
                        totalPages - 1,
                        updateCurrentPageIndex,
                        inViewportType,
                        readingDirection,
                    )
                }
            >
                <Pager
                    totalPages={totalPages}
                    currentPageIndex={currentPageIndex}
                    pages={actualPages}
                    transitionPageMode={transitionPageMode}
                    pageLoadStates={pageLoadStates}
                    retryFailedPagesKeyPrefix={retryFailedPagesKeyPrefix}
                    imageRefs={imageRefs}
                    onLoad={onLoad}
                    onError={onError}
                />
            </Stack>
        );
    },
);

export const ReaderViewer = withPropsFrom(
    memo(BaseReaderViewer),
    [
        userReaderStatePagesContext,
        ReaderService.useSettingsWithoutDefaultFlag,
        useReaderScrollbarContext,
        useReaderOverlayContext,
        () => ({ updateCurrentPageIndex: ReaderControls.useUpdateCurrentPageIndex() }),
        useReaderTapZoneContext,
    ],
    [
        'currentPageIndex',
        'pageToScrollToIndex',
        'setPageToScrollToIndex',
        'pages',
        'setPages',
        'totalPages',
        'pageUrls',
        'pageLoadStates',
        'setPageLoadStates',
        'transitionPageMode',
        'retryFailedPagesKeyPrefix',
        'readingMode',
        'shouldOffsetDoubleSpreads',
        'readingDirection',
        'readerWidth',
        'pageScaleMode',
        'setScrollbarXSize',
        'setScrollbarYSize',
        'isVisible',
        'setIsVisible',
        'updateCurrentPageIndex',
        'showPreview',
        'setShowPreview',
    ],
);
