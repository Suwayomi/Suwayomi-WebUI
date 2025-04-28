/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { ReaderPageScaleMode, ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types';
import {
    isContinuousVerticalReadingMode,
    isHeightPageScaleMode,
    isReaderWidthEditable,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';

const shouldPreserveOnResizeChange = (
    readingMode: ReadingMode,
    pageScaleMode: ReaderPageScaleMode,
    previousWidth: number,
    previousHeight: number,
): boolean => {
    const isEditableReaderWidth = isReaderWidthEditable(pageScaleMode);
    const isHeightPageScaleModeActive = isHeightPageScaleMode(pageScaleMode);

    const didWidthChange = previousWidth !== window.innerWidth;
    const didHeightChange = previousHeight !== window.innerHeight;

    const handleWidthChange = isEditableReaderWidth && didWidthChange;
    const handleHeightChange = isHeightPageScaleModeActive && didHeightChange;

    if (!isContinuousVerticalReadingMode(readingMode) && didWidthChange) {
        return true;
    }

    return handleWidthChange || handleHeightChange;
};

const usePreserveOnValueChange = (
    value: unknown,
    currentPageIndex: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
) => {
    useLayoutEffect(() => {
        setPageToScrollToIndex(currentPageIndex);
    }, [value]);
};

const usePreserveOnWindowResize = (
    readingMode: ReadingMode,
    pageScaleMode: ReaderPageScaleMode,
    setPageToScrollToIndex: React.Dispatch<React.SetStateAction<number | null>>,
    pageIndex: number,
) => {
    const previousDimensionsRef = useRef({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            const { width, height } = previousDimensionsRef.current;
            previousDimensionsRef.current = { width: window.innerWidth, height: window.innerHeight };

            if (!shouldPreserveOnResizeChange(readingMode, pageScaleMode, width, height)) {
                return;
            }

            setPageToScrollToIndex(pageIndex);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [readingMode, pageScaleMode, pageIndex]);
};

const usePreserveOnReaderViewerElementMutation = (
    scrollElementRef: RefObject<HTMLElement | null>,
    isContinuousReadingModeActive: boolean,
) => {
    const scrollPosition = useRef<{
        left: number;
        top: number;
        visibleElement: HTMLElement | undefined;
        visibleElementLeft: number;
        visibleElementTop: number;
    }>({
        left: 0,
        top: 0,
        visibleElement: undefined,
        visibleElementLeft: 0,
        visibleElementTop: 0,
    });

    useEffect(() => {
        const scrollElement = scrollElementRef.current;

        if (!scrollElement) {
            return () => {};
        }

        const onScroll = () => {
            const { visibleElement } = scrollPosition.current;
            scrollPosition.current = {
                ...scrollPosition.current,
                left: scrollElement.scrollLeft,
                top: scrollElement.scrollTop,
                visibleElementLeft: visibleElement?.offsetLeft ?? 0,
                visibleElementTop: visibleElement?.offsetTop ?? 0,
            };
        };

        scrollElement.addEventListener('scroll', onScroll);

        return () => scrollElement.removeEventListener('scroll', onScroll);
    }, []);

    useLayoutEffect(() => {
        const scrollElement = scrollElementRef.current;

        if (!scrollElement || !isContinuousReadingModeActive) {
            return () => {};
        }

        const preserveScrollPosition = () => {
            const { left, top, visibleElement, visibleElementLeft, visibleElementTop } = scrollPosition.current;

            if (!visibleElement) {
                return;
            }

            const newLeft = left - visibleElementLeft + visibleElement.offsetLeft;
            const newTop = top - visibleElementTop + visibleElement.offsetTop;

            scrollElement.scrollTo(newLeft, newTop);
        };

        const updateObservation = (
            nodes: NodeList,
            resizeAction: (element: Element) => void,
            intersectionAction: (element: Element) => void,
        ) =>
            Array.from(nodes)
                .filter((node) => node instanceof HTMLElement)
                .flatMap((element) => {
                    resizeAction(element);
                    return Array.from(element.querySelectorAll('img'));
                })
                .forEach(intersectionAction);

        const resizeObserver = new ResizeObserver(preserveScrollPosition);
        const intersectionObserver = new IntersectionObserver((entries) => {
            const firstVisibleElement = entries.find((entry) => entry.isIntersecting);

            if (!(firstVisibleElement?.target instanceof HTMLElement)) {
                return;
            }

            scrollPosition.current = {
                ...scrollPosition.current,
                visibleElement: firstVisibleElement.target,
                visibleElementLeft: firstVisibleElement.target.offsetLeft,
                visibleElementTop: firstVisibleElement.target.offsetTop,
            };
        });
        const mutationObserver = new MutationObserver((entries) => {
            for (const entry of entries) {
                updateObservation(
                    entry.addedNodes,
                    (n) => resizeObserver.observe(n),
                    (n) => intersectionObserver.observe(n),
                );
                updateObservation(
                    entry.removedNodes,
                    (element) => resizeObserver.unobserve(element),
                    (element) => intersectionObserver.unobserve(element),
                );
            }
        });

        mutationObserver.observe(scrollElement, {
            childList: true,
        });

        return () => {
            mutationObserver.disconnect();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [isContinuousReadingModeActive]);
};

export const useReaderPreserveScrollPosition = (
    scrollElementRef: RefObject<HTMLElement | null>,
    pageIndex: number,
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    isContinuousReadingModeActive: boolean,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    pageScaleMode: ReaderPageScaleMode,
) => {
    usePreserveOnReaderViewerElementMutation(scrollElementRef, isContinuousReadingModeActive);
    usePreserveOnWindowResize(readingMode, pageScaleMode, setPageToScrollToIndex, pageIndex);
    usePreserveOnValueChange(readingDirection, pageIndex, setPageToScrollToIndex);
    usePreserveOnValueChange(readingMode, pageIndex, setPageToScrollToIndex);
};
