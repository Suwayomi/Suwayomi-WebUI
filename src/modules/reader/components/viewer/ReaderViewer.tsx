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
import { useLocation } from 'react-router-dom';
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
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters';

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
            readerWidth,
            pageScaleMode,
            shouldOffsetDoubleSpreads,
            imagePreLoadAmount,
            pageGap,
            customFilter,
            shouldStretchPage,
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
                | 'readerWidth'
                | 'pageScaleMode'
                | 'shouldOffsetDoubleSpreads'
                | 'imagePreLoadAmount'
                | 'pageGap'
                | 'customFilter'
                | 'shouldStretchPage'
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
        useImperativeHandle(ref, () => scrollElementRef.current!);

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
        useReaderAutoScroll(isOverlayVisible, automaticScrolling);
        useReaderPreserveScrollPosition(
            scrollElementRef,
            currentPageIndex,
            readingMode,
            isContinuousReadingModeActive,
            readerNavBarWidth,
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
            <Stack
                ref={scrollElementRef}
                sx={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    flexWrap: 'nowrap',
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
                    const isLastLeadingChapter = visibleChapters.lastLeadingChapterSourceOrder === chapter.sourceOrder;
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
        'readerWidth',
        'pageScaleMode',
        'shouldOffsetDoubleSpreads',
        'imagePreLoadAmount',
        'pageGap',
        'customFilter',
        'shouldStretchPage',
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
    ],
);
