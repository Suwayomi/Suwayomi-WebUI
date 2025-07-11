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
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useMergedRef } from '@mantine/hooks';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import {
    IReaderSettings,
    PageInViewportType,
    ReaderOpenChapterLocationState,
    ReaderResumeMode,
    ReaderStateChapters,
    ReadingDirection,
    ReadingMode,
    TReaderScrollbarContext,
} from '@/modules/reader/types/Reader.types.ts';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import {
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
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { useReaderAutoScroll } from '@/modules/reader/hooks/useReaderAutoScroll.ts';
import { useReaderHideOverlayOnUserScroll } from '@/modules/reader/hooks/useReaderHideOverlayOnUserScroll.ts';
import { useReaderHorizontalModeInvertXYScrolling } from '@/modules/reader/hooks/useReaderHorizontalModeInvertXYScrolling.ts';
import { useReaderHideCursorOnInactivity } from '@/modules/reader/hooks/useReaderHideCursorOnInactivity.ts';
import { useReaderScrollToStartOnPageChange } from '@/modules/reader/hooks/useReaderScrollToStartOnPageChange.ts';
import { useReaderHandlePageSelection } from '@/modules/reader/hooks/useReaderHandlePageSelection.ts';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderChapterViewer } from '@/modules/reader/components/viewer/ReaderChapterViewer.tsx';
import {
    getPreviousNextChapterVisibility,
    getReaderChapterViewerCurrentPageIndex,
    getReaderChapterViewResumeMode,
} from '@/modules/reader/utils/Reader.utils.ts';
import { coerceIn, noOp } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { NavbarContextType } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { useReaderPreserveScrollPosition } from '@/modules/reader/hooks/useReaderPreserveScrollPosition.ts';

import { ChapterIdInfo } from '@/modules/chapter/Chapter.types.ts';
import { useSwipeNavigate } from '@/modules/reader/hooks/useSwipeNavigate.ts';

import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { Priority } from '@/lib/Queue.ts';

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
            totalPages,
            setPages,
            setPageLoadStates,
            setTotalPages,
            setCurrentPageIndex,
            transitionPageMode,
            retryFailedPagesKeyPrefix,
            setTransitionPageMode,
            readingMode,
            readingDirection,
            shouldUseInfiniteScroll,
            readerWidth,
            pageScaleMode,
            shouldOffsetDoubleSpreads,
            imagePreLoadAmount,
            pageGap,
            customFilter,
            shouldStretchPage,
            isStaticNav,
            swipePreviewThreshold,
            readerNavBarWidth,
            setScrollbarXSize,
            setScrollbarYSize,
            isVisible: isOverlayVisible,
            setIsVisible: setIsOverlayVisible,
            updateCurrentPageIndex,
            showPreview,
            setShowPreview,
            initialChapter,
            currentChapter,
            chapters,
            visibleChapters,
            setReaderStateChapters,
            isCurrentChapterReady,
        }: Pick<
            ReaderStatePages,
            | 'currentPageIndex'
            | 'pageToScrollToIndex'
            | 'setPageToScrollToIndex'
            | 'pages'
            | 'totalPages'
            | 'setPages'
            | 'setPageLoadStates'
            | 'setTotalPages'
            | 'setCurrentPageIndex'
            | 'transitionPageMode'
            | 'retryFailedPagesKeyPrefix'
            | 'setTransitionPageMode'
        > &
            Pick<
                IReaderSettings,
                | 'readingMode'
                | 'readingDirection'
                | 'shouldUseInfiniteScroll'
                | 'readerWidth'
                | 'pageScaleMode'
                | 'shouldOffsetDoubleSpreads'
                | 'imagePreLoadAmount'
                | 'pageGap'
                | 'customFilter'
                | 'shouldStretchPage'
                | 'isStaticNav'
                | 'swipePreviewThreshold'
            > &
            Pick<TReaderScrollbarContext, 'setScrollbarXSize' | 'setScrollbarYSize'> &
            Pick<NavbarContextType, 'readerNavBarWidth'> &
            Pick<TReaderOverlayContext, 'isVisible' | 'setIsVisible'> &
            Pick<
                ReaderStateChapters,
                | 'initialChapter'
                | 'currentChapter'
                | 'chapters'
                | 'visibleChapters'
                | 'setReaderStateChapters'
                | 'isCurrentChapterReady'
            > &
            TReaderTapZoneContext & {
                updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>;
            },

        ref: ForwardedRef<HTMLDivElement | null>,
    ) => {
        const { direction: themeDirection } = useTheme();
        const { resumeMode = ReaderResumeMode.START } = useLocation<ReaderOpenChapterLocationState>().state ?? {
            resumeMode: ReaderResumeMode.START,
        };

        const scrollElementRef = useRef<HTMLDivElement | null>(null);
        const mergedRef = useMergedRef(ref, scrollElementRef);

        const isContinuousVerticalReadingModeActive = isContinuousVerticalReadingMode(readingMode);
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

        const {
            isSwiping,
            swipeOffset,
            isTransitioning,
            previewPageUrl,
            previewDirection,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd,
        } = useSwipeNavigate({
            readingMode,
            readingDirection,
            swipePreviewThreshold,
            currentPageIndex,
            pages,
        });

        const imageRefs = useRef<(HTMLElement | null)[]>(pages.map(() => null));
        const [{ minChapterViewWidth, minChapterViewHeight, minChapterSizeSourceChapterId }, setChapterViewerSize] =
            useState({
                minChapterViewWidth: 0,
                minChapterViewHeight: 0,
                minChapterSizeSourceChapterId: -1,
            });

        const [, setTriggerReRender] = useState({});

        const inViewportType = READING_MODE_TO_IN_VIEWPORT_TYPE[readingMode];
        const isLtrReadingDirection = readingDirection === ReadingDirection.LTR;
        const initialChapterIndex = useMemo(
            () => chapters.findIndex((chapter) => chapter.id === initialChapter?.id),
            [chapters, initialChapter?.id],
        );
        const chaptersToRender = useMemo(
            () =>
                chapters.slice(
                    Math.max(0, initialChapterIndex - visibleChapters.trailing),
                    Math.min(chapters.length, initialChapterIndex + visibleChapters.leading + 1),
                ),
            [chapters, initialChapterIndex, visibleChapters.trailing, visibleChapters.leading],
        );
        const currentChapterIndex = useMemo(
            () => chaptersToRender.findIndex((chapter) => chapter.id === currentChapter?.id),
            [currentChapter, chaptersToRender],
        );

        const onChapterViewSizeChange = useCallback(
            (width: number, height: number, chapterId: ChapterIdInfo['id']) => {
                if (!isContinuousReadingModeActive) {
                    return;
                }

                const isSameChapterId = chapterId === minChapterSizeSourceChapterId;

                if (isContinuousVerticalReadingModeActive) {
                    if (!isSameChapterId && minChapterViewWidth >= width) {
                        return;
                    }

                    setChapterViewerSize({
                        minChapterViewWidth: width,
                        minChapterViewHeight: 0,
                        minChapterSizeSourceChapterId: chapterId,
                    });
                    return;
                }

                if (isSameChapterId || minChapterViewHeight < height) {
                    setChapterViewerSize({
                        minChapterViewWidth: 0,
                        minChapterViewHeight: height,
                        minChapterSizeSourceChapterId: chapterId,
                    });
                }
            },
            [
                isContinuousReadingModeActive,
                isContinuousVerticalReadingModeActive,
                minChapterViewWidth,
                minChapterViewHeight,
                minChapterSizeSourceChapterId,
            ],
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
        useReaderAutoScroll(isOverlayVisible, automaticScrolling, isStaticNav);
        useReaderPreserveScrollPosition(
            scrollElementRef,
            currentChapter?.id,
            currentChapterIndex,
            currentPageIndex,
            chaptersToRender,
            visibleChapters,
            readingMode,
            readingDirection,
            setPageToScrollToIndex,
            pageScaleMode,
        );

        useLayoutEffect(() => {
            setChapterViewerSize({
                minChapterViewWidth: 0,
                minChapterViewHeight: 0,
                minChapterSizeSourceChapterId: -1,
            });
            setTriggerReRender({});
        }, [readingMode]);

        if (!initialChapter || !currentChapter) {
            throw new Error('ReaderViewer: illegal state - initialChapter and currentChapter should not be undefined');
        }

        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {/* 预览页面层 - 放在Stack外面 */}
                {previewPageUrl && (isSwiping || isTransitioning) && swipeOffset !== 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: (() => {
                                // 根据预览方向和阅读方向决定预览页面的初始位置
                                if (previewDirection === 'next') {
                                    // 下一页：在LTR模式下从右侧进入，在RTL模式下从左侧进入
                                    return readingDirection === ReadingDirection.LTR ? '100%' : '-100%';
                                }
                                // 上一页：在LTR模式下从左侧进入，在RTL模式下从右侧进入
                                return readingDirection === ReadingDirection.LTR ? '-100%' : '100%';
                            })(),
                            transform: (() => {
                                const progress = (Math.abs(swipeOffset) / window.innerWidth) * 100;
                                if (previewDirection === 'next') {
                                    // 下一页的移动方向
                                    if (readingDirection === ReadingDirection.LTR) {
                                        return swipeOffset < 0 ? `translateX(-${progress}%)` : 'translateX(0)';
                                    }
                                    return swipeOffset > 0 ? `translateX(${progress}%)` : 'translateX(0)';
                                }
                                // 上一页的移动方向
                                if (readingDirection === ReadingDirection.LTR) {
                                    return swipeOffset > 0 ? `translateX(${progress}%)` : 'translateX(0)';
                                }
                                return swipeOffset < 0 ? `translateX(-${progress}%)` : 'translateX(0)';
                            })(),
                            width: '100%',
                            height: '100%',
                            opacity: Math.min(Math.abs(swipeOffset) / (window.innerWidth * 0.3), 1),
                            pointerEvents: 'none',
                            zIndex: 0,
                            overflow: 'hidden',
                            transition: isTransitioning ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : 'none',
                        }}
                    >
                        <SpinnerImage
                            src={previewPageUrl}
                            alt="Preview page"
                            priority={Priority.HIGH}
                            shouldLoad
                            imgStyle={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                            }}
                            spinnerStyle={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                            }}
                        />
                    </Box>
                )}
                <Stack
                    ref={mergedRef}
                    sx={{
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        overscrollBehavior: 'contain',
                        flexWrap: 'nowrap',
                        // 滑动特效：页面跟随手指移动
                        transform: readingMode === ReadingMode.SINGLE_PAGE ? `translateX(${swipeOffset}px)` : 'none',
                        transition: isTransitioning ? 'transform 0.2s ease-out' : 'none',
                        ...applyStyles(
                            isContinuousVerticalReadingModeActive && shouldApplyReaderWidth(readerWidth, pageScaleMode),
                            { alignItems: 'center' },
                        ),
                        ...applyStyles(!isContinuousVerticalReadingModeActive, {
                            ...applyStyles(themeDirection === 'ltr', {
                                flexDirection: isLtrReadingDirection ? 'row' : 'row-reverse',
                            }),
                            ...applyStyles(themeDirection === 'rtl', {
                                flexDirection: isLtrReadingDirection ? 'row-reverse' : 'row',
                            }),
                        }),
                    }}
                    onClick={(e) => !isDragging && !isSwiping && handleClick(e)}
                    onScroll={() =>
                        ReaderControls.updateCurrentPageOnScroll(
                            imageRefs,
                            totalPages - 1,
                            updateCurrentPageIndex,
                            inViewportType,
                            readingDirection,
                        )
                    }
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {chaptersToRender.map((_, index) => {
                        // chapters are sorted by latest to oldest, thus, loop over it in reversed order
                        const chapterIndex = Math.max(0, chaptersToRender.length - index - 1);
                        const chapter = chaptersToRender[chapterIndex];

                        const previousChapter =
                            chaptersToRender[chapterIndex + 1] ??
                            chapters[initialChapterIndex + visibleChapters.leading + 1];
                        const nextChapter =
                            chaptersToRender[chapterIndex - 1] ??
                            chapters[initialChapterIndex - visibleChapters.trailing - 1];

                        const isInitialChapter = chapter.id === initialChapter.id;
                        const isCurrentChapter = chapter.id === currentChapter.id;
                        const isPreviousChapter = chapter.id === chaptersToRender[currentChapterIndex + 1]?.id;
                        const isNextChapter = chapter.id === chaptersToRender[currentChapterIndex - 1]?.id;
                        const isLeadingChapter = initialChapter.sourceOrder > chapter.sourceOrder;
                        const isTrailingChapter = initialChapter.sourceOrder < chapter.sourceOrder;
                        const isLastLeadingChapter =
                            visibleChapters.lastLeadingChapterSourceOrder === chapter.sourceOrder;
                        const isLastTrailingChapter =
                            visibleChapters.lastTrailingChapterSourceOrder === chapter.sourceOrder;
                        const isPreloadMode =
                            (isLastLeadingChapter && visibleChapters.isLeadingChapterPreloadMode) ||
                            (isLastTrailingChapter && visibleChapters.isTrailingChapterPreloadMode);

                        const previousNextChapterVisibility = getPreviousNextChapterVisibility(
                            chapterIndex,
                            chaptersToRender,
                            visibleChapters,
                        );

                        const isChapterSizeSourceChapter = chapter.id === minChapterSizeSourceChapterId;

                        return (
                            <ReaderChapterViewer
                                key={chapter.id}
                                chapterId={chapter.id}
                                previousChapterId={previousChapter?.id}
                                nextChapterId={nextChapter?.id}
                                isPreviousChapterVisible={previousNextChapterVisibility.previous}
                                isNextChapterVisible={previousNextChapterVisibility.next}
                                lastPageRead={coerceIn(chapter.lastPageRead, 0, chapter.pageCount - 1)}
                                currentPageIndex={getReaderChapterViewerCurrentPageIndex(
                                    currentPageIndex,
                                    chapter,
                                    currentChapter,
                                    isCurrentChapter,
                                    isCurrentChapterReady,
                                    isLeadingChapter,
                                    isTrailingChapter,
                                    visibleChapters,
                                )}
                                isInitialChapter={isInitialChapter}
                                isCurrentChapter={isCurrentChapter}
                                isPreviousChapter={isPreviousChapter}
                                isNextChapter={isNextChapter}
                                isLeadingChapter={isLeadingChapter}
                                isTrailingChapter={isTrailingChapter}
                                isPreloadMode={isPreloadMode}
                                imageRefs={imageRefs}
                                setPages={setPages}
                                setPageLoadStates={setPageLoadStates}
                                setTotalPages={setTotalPages}
                                setCurrentPageIndex={setCurrentPageIndex}
                                setPageToScrollToIndex={setPageToScrollToIndex}
                                transitionPageMode={transitionPageMode}
                                retryFailedPagesKeyPrefix={retryFailedPagesKeyPrefix}
                                readingMode={readingMode}
                                readerWidth={readerWidth}
                                pageScaleMode={pageScaleMode}
                                shouldOffsetDoubleSpreads={shouldOffsetDoubleSpreads}
                                readingDirection={readingDirection}
                                shouldUseInfiniteScroll={shouldUseInfiniteScroll}
                                updateCurrentPageIndex={isCurrentChapter ? updateCurrentPageIndex : noOp}
                                scrollIntoView={isCurrentChapter && visibleChapters.scrollIntoView}
                                resumeMode={getReaderChapterViewResumeMode(
                                    isCurrentChapter,
                                    isInitialChapter,
                                    isLeadingChapter,
                                    isTrailingChapter,
                                    visibleChapters.resumeMode,
                                    resumeMode,
                                )}
                                setReaderStateChapters={setReaderStateChapters}
                                setTransitionPageMode={setTransitionPageMode}
                                pageGap={pageGap}
                                imagePreLoadAmount={imagePreLoadAmount}
                                customFilter={customFilter}
                                shouldStretchPage={shouldStretchPage}
                                scrollbarXSize={scrollbarXSize}
                                scrollbarYSize={scrollbarYSize}
                                readerNavBarWidth={readerNavBarWidth}
                                onSizeChange={onChapterViewSizeChange}
                                minWidth={isChapterSizeSourceChapter ? 0 : minChapterViewWidth}
                                minHeight={isChapterSizeSourceChapter ? 0 : minChapterViewHeight}
                                scrollElement={scrollElementRef.current}
                            />
                        );
                    })}
                </Stack>
            </Box>
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
        useReaderStateChaptersContext,
        useNavBarContext,
    ],
    [
        'currentPageIndex',
        'pageToScrollToIndex',
        'setPageToScrollToIndex',
        'pages',
        'totalPages',
        'setPages',
        'setPageLoadStates',
        'setTotalPages',
        'setCurrentPageIndex',
        'retryFailedPagesKeyPrefix',
        'setTransitionPageMode',
        'readingMode',
        'readingDirection',
        'shouldUseInfiniteScroll',
        'readerWidth',
        'pageScaleMode',
        'shouldOffsetDoubleSpreads',
        'imagePreLoadAmount',
        'pageGap',
        'customFilter',
        'shouldStretchPage',
        'isStaticNav',
        'readerNavBarWidth',
        'transitionPageMode',
        'setScrollbarXSize',
        'setScrollbarYSize',
        'isVisible',
        'setIsVisible',
        'updateCurrentPageIndex',
        'showPreview',
        'setShowPreview',
        'initialChapter',
        'currentChapter',
        'chapters',
        'visibleChapters',
        'setReaderStateChapters',
        'isCurrentChapterReady',
        'swipePreviewThreshold',
    ],
);
