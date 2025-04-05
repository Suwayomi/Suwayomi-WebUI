/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { ReaderPageScaleMode, ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types';
import { isReaderWidthEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

export const useReaderPreserveScrollPosition = (
    scrollElementRef: RefObject<HTMLElement | null>,
    pageIndex: number,
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    isContinuousReadingModeActive: boolean,
    readerNavBarWidth: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    pageScaleMode: ReaderPageScaleMode,
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
    const readerNavBarWidthRef = useRef(readerNavBarWidth);

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

    // on rendering previous chapter (infinite scroll in continuous reading modes)
    const onDoPreserveScroll = useCallback(() => {
        const scrollElement = scrollElementRef.current;
        const { left, top, visibleElement, visibleElementLeft, visibleElementTop } = scrollPosition.current;

        if (!scrollElement || !isContinuousReadingModeActive || !visibleElement) {
            return;
        }

        const newLeft = left - visibleElementLeft + visibleElement.offsetLeft;
        const newTop = top - visibleElementTop + visibleElement.offsetTop;

        scrollElement.scrollTo(newLeft, newTop);
    }, [isContinuousReadingModeActive]);

    useLayoutEffect(() => {
        const scrollElement = scrollElementRef.current;

        if (!scrollElement) {
            return () => {};
        }

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

        const resizeObserver = new ResizeObserver(onDoPreserveScroll);
        const intersectionObserver = new IntersectionObserver((entries) => {
            const firstVisibleElement = entries.filter((e) => e.isIntersecting).shift();

            if (!firstVisibleElement || !(firstVisibleElement.target instanceof HTMLElement)) {
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
    }, [onDoPreserveScroll]);

    const onAvailableReaderWidthChange = useCallback(() => {
        if (!isContinuousReadingModeActive) {
            return;
        }

        if (!isReaderWidthEditable(pageScaleMode)) {
            return;
        }

        setPageToScrollToIndex(pageIndex);
    }, [isContinuousReadingModeActive, pageIndex, pageScaleMode]);

    // on window resize
    useEffect(() => {
        window.addEventListener('resize', onAvailableReaderWidthChange);
        return () => window.removeEventListener('resize', onAvailableReaderWidthChange);
    }, [onAvailableReaderWidthChange]);

    // on reader nav bar static setting change
    useEffect(() => {
        if (readerNavBarWidthRef.current === readerNavBarWidth) {
            return;
        }

        readerNavBarWidthRef.current = readerNavBarWidth;
        onAvailableReaderWidthChange();
    }, [onAvailableReaderWidthChange, readerNavBarWidth]);

    // on "reading mode" or "reading direction" change
    useLayoutEffect(() => {
        setPageToScrollToIndex(pageIndex);
    }, [readingMode, readingDirection]);
};
