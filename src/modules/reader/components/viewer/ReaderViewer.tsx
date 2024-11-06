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
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Stack from '@mui/material/Stack';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { PageInViewportType, ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderPagedPager } from '@/modules/reader/components/viewer/pager/ReaderPagedPager.tsx';
import { ReaderDoublePagedPager } from '@/modules/reader/components/viewer/pager/ReaderDoublePagedPager.tsx';
import { ReaderHorizontalPager } from '@/modules/reader/components/viewer/pager/ReaderHorizontalPager.tsx';
import { ReaderVerticalPager } from '@/modules/reader/components/viewer/pager/ReaderVerticalPager.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { createPagesData, getDoublePageModePages, isSpreadPage } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

const READING_MODE_TO_IN_VIEWPORT_TYPE: Record<ReadingMode, PageInViewportType> = {
    [ReadingMode.SINGLE_PAGE]: PageInViewportType.X,
    [ReadingMode.DOUBLE_PAGE]: PageInViewportType.X,
    [ReadingMode.CONTINUOUS_VERTICAL]: PageInViewportType.Y,
    [ReadingMode.CONTINUOUS_HORIZONTAL]: PageInViewportType.X,
};

export const ReaderViewer = forwardRef((_, ref: ForwardedRef<HTMLDivElement | null>) => {
    const {
        currentPageIndex,
        setCurrentPageIndex,
        pageToScrollToIndex,
        pages,
        setPages,
        totalPages,
        pageUrls,
        setPageLoadStates,
    } = userReaderStatePagesContext();
    const { readingMode, shouldOffsetDoubleSpreads, readingDirection } = ReaderService.useSettings();
    const { setScrollbarXSize, setScrollbarYSize } = useReaderScrollbarContext();

    const scrollElementRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => scrollElementRef.current!);

    const scrollbarXSize = MediaQuery.useGetScrollbarSize('width', scrollElementRef.current);
    const scrollbarYSize = MediaQuery.useGetScrollbarSize('height', scrollElementRef.current);
    useLayoutEffect(() => {
        setScrollbarXSize(scrollbarXSize);
        setScrollbarYSize(scrollbarYSize);
    }, [scrollbarXSize, scrollbarYSize]);

    const handleClick = ReaderControls.useHandleClick(scrollElementRef.current);

    const [wasDoublePageMode, setWasDoublePageMode] = useState(readingMode.value === ReadingMode.DOUBLE_PAGE);
    const [pagesToSpreadState, setPagesToSpreadState] = useState(Array(totalPages).fill(false));

    const imageRefs = useRef<(HTMLElement | null)[]>(pages.map(() => null));

    const actualPages = useMemo(() => {
        const arePagesLoaded = pageUrls.length;
        if (!arePagesLoaded) {
            return pages;
        }

        if (readingMode.value === ReadingMode.DOUBLE_PAGE) {
            return getDoublePageModePages(
                pageUrls,
                pagesToSpreadState,
                shouldOffsetDoubleSpreads.value,
                readingDirection.value,
            );
        }

        return pages;
    }, [pagesToSpreadState, readingMode.value, shouldOffsetDoubleSpreads.value, readingDirection.value]);

    const Pager = useMemo(() => {
        switch (readingMode.value) {
            case ReadingMode.SINGLE_PAGE:
                return ReaderPagedPager;
            case ReadingMode.DOUBLE_PAGE:
                return ReaderDoublePagedPager;
            case ReadingMode.CONTINUOUS_VERTICAL:
                return ReaderVerticalPager;
            case ReadingMode.CONTINUOUS_HORIZONTAL:
                return ReaderHorizontalPager;
            default:
                throw new Error(`Unexpected "ReadingMode" (${readingMode.value})`);
        }
    }, [readingMode.value]);

    const inViewportType = READING_MODE_TO_IN_VIEWPORT_TYPE[readingMode.value];

    // reset spread state
    useLayoutEffect(() => {
        setPagesToSpreadState(Array(totalPages).fill(false));
    }, [totalPages]);

    // optionally convert pages to normal or double page mode
    useLayoutEffect(() => {
        const convertPagesToNormalPageMode = wasDoublePageMode && readingMode.value !== ReadingMode.DOUBLE_PAGE;
        if (convertPagesToNormalPageMode) {
            setWasDoublePageMode(false);
            setPages(createPagesData(pageUrls));
            setPagesToSpreadState(Array(totalPages).fill(false));

            return;
        }

        const convertPagesToDoublePageMode = readingMode.value === ReadingMode.DOUBLE_PAGE;
        if (convertPagesToDoublePageMode) {
            setPages(actualPages);
            setWasDoublePageMode(readingMode.value === ReadingMode.DOUBLE_PAGE);
        }
    }, [actualPages, readingMode.value]);

    // optionally scroll selected page into view in continues reading modes
    useLayoutEffect(() => {
        if (isContinuousReadingMode(readingMode.value)) {
            const pageToScrollToPagesIndex = getPage(pageToScrollToIndex, pages).pagesIndex;
            const imageRef = imageRefs.current[pageToScrollToPagesIndex];
            imageRef?.scrollIntoView({
                block: 'start',
                inline: 'start',
            });
            setCurrentPageIndex(pageToScrollToPagesIndex);
        }
    }, [pageToScrollToIndex]);

    // invert x and y scrolling for the continuous horizontal reading mode
    useEffect(() => {
        if (readingMode.value !== ReadingMode.CONTINUOUS_HORIZONTAL) {
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
                left: readingDirection.value === ReadingDirection.LTR ? e.deltaY : e.deltaY * -1,
            });
        };

        scrollElementRef.current.addEventListener('wheel', handleScroll);
        return () => scrollElementRef.current?.removeEventListener('wheel', handleScroll);
    }, [readingMode.value, readingDirection.value]);

    return (
        <Stack
            ref={scrollElementRef}
            sx={{ width: '100%', height: '100%', overflow: 'auto' }}
            onClick={handleClick}
            onScroll={() =>
                ReaderControls.updateCurrentPageOnScroll(
                    imageRefs,
                    currentPageIndex,
                    setCurrentPageIndex,
                    inViewportType,
                )
            }
        >
            <Pager
                totalPages={totalPages}
                currentPageIndex={currentPageIndex}
                pages={actualPages}
                imageRefs={imageRefs}
                onLoad={(pagesIndex, isPrimary = true) => {
                    const page = actualPages[pagesIndex];
                    const { index, url } = isPrimary ? page.primary : page.secondary!;

                    if (readingMode.value === ReadingMode.DOUBLE_PAGE) {
                        const img = new Image();
                        img.onload = () => {
                            setPagesToSpreadState((prevState) => prevState.toSpliced(index, 1, isSpreadPage(img)));
                        };
                        img.src = url;
                    }

                    setPageLoadStates((pageLoadStates) => pageLoadStates.toSpliced(index, 1, true));
                }}
            />
        </Stack>
    );
});
