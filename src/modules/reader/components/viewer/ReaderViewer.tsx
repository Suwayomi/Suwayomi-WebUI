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
import { getPage, getNextPageIndex } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

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
        const openPage = ReaderControls.useOpenPage();

        // 触摸滑动状态
        const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
        const [isSwiping, setIsSwiping] = useState(false);
        const [swipeOffset, setSwipeOffset] = useState(0); // 滑动偏移量，用于页面跟随效果
        const [previewDirection, setPreviewDirection] = useState<'next' | 'previous' | null>(null); // 预览方向
        const [isTransitioning, setIsTransitioning] = useState(false); // 翻页过渡状态

        // 触摸滑动处理函数
        const handleTouchStart = useCallback(
            (e: React.TouchEvent) => {
                if (e.touches.length === 1 && readingMode === ReadingMode.SINGLE_PAGE) {
                    const touch = e.touches[0];
                    setTouchStart({
                        x: touch.clientX,
                        y: touch.clientY,
                        time: Date.now(),
                    });
                    setIsSwiping(false);
                    setSwipeOffset(0); // 重置滑动偏移量
                    setPreviewDirection(null); // 重置预览方向
                }
            },
            [readingMode],
        );

        const handleTouchMove = useCallback(
            (e: React.TouchEvent) => {
                if (!touchStart || e.touches.length !== 1 || readingMode !== ReadingMode.SINGLE_PAGE) {
                    return;
                }

                const touch = e.touches[0];
                const deltaX = touch.clientX - touchStart.x;
                const deltaY = Math.abs(touch.clientY - touchStart.y);
                const absDeltaX = Math.abs(deltaX);

                // 如果水平滑动距离大于垂直滑动距离，且超过最小阈值，则认为是水平滑动
                if (absDeltaX > deltaY && absDeltaX > 30) {
                    setIsSwiping(true);
                    // 设置滑动偏移量，不限制最大偏移，允许无限预览
                    setSwipeOffset(deltaX);
                    // 设置预览方向：根据阅读方向决定
                    // LTR模式：左滑显示下一页，右滑显示上一页
                    // RTL模式：左滑显示上一页，右滑显示下一页
                    const isLeftSwipe = deltaX < 0;
                    if (readingDirection === ReadingDirection.LTR) {
                        setPreviewDirection(isLeftSwipe ? 'next' : 'previous');
                    } else {
                        setPreviewDirection(isLeftSwipe ? 'previous' : 'next');
                    }
                    // 移除preventDefault以避免passive事件监听器错误
                }
            },
            [touchStart, readingMode, readingDirection],
        );

        const handleTouchEnd = useCallback(
            (e: React.TouchEvent) => {
                if (!touchStart || readingMode !== ReadingMode.SINGLE_PAGE) {
                    setTouchStart(null);
                    setIsSwiping(false);
                    setSwipeOffset(0);
                    setPreviewDirection(null);
                    return;
                }

                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStart.x;
                const deltaY = Math.abs(touch.clientY - touchStart.y);
                const distance = Math.abs(deltaX);

                // 使用 swipePreviewThreshold 作为翻页触发阈值
                const triggerThreshold = window.innerWidth * (swipePreviewThreshold / 100);

                // 滑动条件：水平距离 > 阈值，垂直距离 < 100px
                if (distance > triggerThreshold && deltaY < 100) {
                    // 开始过渡动画
                    setIsTransitioning(true);
                    setTouchStart(null);

                    // 计算完成动画的目标偏移量
                    const targetOffset = deltaX > 0 ? window.innerWidth : -window.innerWidth;
                    setSwipeOffset(targetOffset);

                    // 延迟执行翻页和状态重置，确保动画完成后再更新内容
                    setTimeout(() => {
                        // 先重置swipeOffset，避免新页面显示时还有偏移
                        setSwipeOffset(0);

                        // 执行翻页操作
                        const shouldGoNext = deltaX < 0;
                        const direction = shouldGoNext ? 'next' : 'previous';
                        openPage(direction);

                        // 重置其他滑动相关状态
                        setPreviewDirection(null);
                        setIsSwiping(false);
                        setIsTransitioning(false);
                    }, 200); // 200ms 过渡动画

                    return;
                }

                // 如果没有触发翻页，直接重置滑动状态和偏移量
                setTouchStart(null);
                setIsSwiping(false);
                setSwipeOffset(0);
                setPreviewDirection(null);
            },
            [touchStart, readingMode, readingDirection, openPage, swipePreviewThreshold],
        );

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

        // 计算预览页面信息
        const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
        const previewPageIndex = useMemo(() => {
            if (!previewDirection) return null;
            try {
                return getNextPageIndex(previewDirection, currentPage.pagesIndex, pages);
            } catch {
                return null;
            }
        }, [previewDirection, currentPage.pagesIndex, pages]);

        const previewPageUrl = useMemo(() => {
            if (previewPageIndex === null) return null;
            const previewPage = pages.find(
                (page) => page.primary.index === previewPageIndex || page.secondary?.index === previewPageIndex,
            );
            return previewPage?.primary.index === previewPageIndex
                ? previewPage.primary.url
                : previewPage?.secondary?.url || null;
        }, [previewPageIndex, pages]);

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
