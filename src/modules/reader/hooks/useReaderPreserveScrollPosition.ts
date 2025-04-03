/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { ReaderPageScaleMode, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types';
import { isReaderWidthEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';

export const useReaderPreserveScrollPosition = (
    scrollElementRef: RefObject<HTMLElement | null>,
    pageIndex: number,
    readingMode: ReadingMode,
    isContinuousReadingModeActive: boolean,
    readerNavBarWidth: number,
    setPageToScrollToIndex: ReaderStatePages['setPageToScrollToIndex'],
    pageScaleMode: ReaderPageScaleMode,
) => {
    const scrollPosition = useRef({
        left: 0,
        top: 0,
        active: undefined as HTMLElement | undefined,
        activeLeft: 0,
        activeTop: 0,
    });
    const readerNavBarWidthRef = useRef<number>(readerNavBarWidth);

    useEffect(() => {
        const element = scrollElementRef.current;

        if (!element) {
            return () => {};
        }

        const onScroll = () => {
            const { active } = scrollPosition.current;
            scrollPosition.current = {
                ...scrollPosition.current,
                left: element.scrollLeft,
                top: element.scrollTop,
                activeLeft: active?.offsetLeft ?? 0,
                activeTop: active?.offsetTop ?? 0,
            };
        };

        element.addEventListener('scroll', onScroll);

        return () => element.removeEventListener('scroll', onScroll);
    }, []);

    // on rendering previous chapter (infinite scroll in continuous reading modes)
    const onDoPreserveScroll = useCallback(() => {
        const scrollElement = scrollElementRef.current;
        const { left, top, active, activeLeft, activeTop } = scrollPosition.current;

        if (!scrollElement || !isContinuousReadingModeActive) {
            return;
        }

        if (!active) return;

        const newLeft = left - activeLeft + active.offsetLeft;
        const newTop = top - activeTop + active.offsetTop;
        scrollElement.scrollTo(newLeft, newTop);
    }, [scrollElementRef, isContinuousReadingModeActive]);

    useLayoutEffect(() => {
        const element = scrollElementRef.current;

        if (!element) {
            return () => {};
        }

        const updateObservation = (
            nodes: NodeList,
            resizeAction: (n: Element) => void,
            intersectionAction: (n: Element) => void,
        ) =>
            Array.from(nodes)
                .filter((n) => n instanceof HTMLElement)
                .flatMap((n) => {
                    resizeAction(n);
                    return Array.from(n.querySelectorAll('img'));
                })
                .forEach(intersectionAction);

        const resizeObserver = new ResizeObserver(onDoPreserveScroll);
        const intersectionObserver = new IntersectionObserver((entries) => {
            // find the first visible image inside the viewport
            const first = entries.filter((e) => e.isIntersecting).shift();
            if (!first || !(first.target instanceof HTMLElement)) return;
            scrollPosition.current = {
                ...scrollPosition.current,
                active: first.target,
                activeLeft: first.target.offsetLeft,
                activeTop: first.target.offsetTop,
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
                    (n) => resizeObserver.unobserve(n),
                    (n) => intersectionObserver.unobserve(n),
                );
            }
        });
        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
        });

        return () => {
            mutationObserver.disconnect();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [scrollElementRef, onDoPreserveScroll]);

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

    // on reading mode change
    useLayoutEffect(() => {
        setPageToScrollToIndex(pageIndex);
    }, [readingMode]);
};
