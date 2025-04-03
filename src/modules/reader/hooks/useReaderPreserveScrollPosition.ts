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

const getActiveScrollElement = (root: HTMLElement): HTMLElement | undefined => {
    const stack = [root];
    while (stack.length) {
        const which = stack.splice(0, 1)[0]; // pop front
        if (
            which.childElementCount === 0 &&
            which.offsetTop + which.offsetHeight >= root.scrollTop &&
            which.offsetLeft + which.offsetWidth >= root.scrollLeft
        )
            return which;
        stack.splice(-1, 0, ...Array.from(which.children).filter((x) => x instanceof HTMLElement));
    }
    return undefined;
};

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
            const active = getActiveScrollElement(element);
            scrollPosition.current = {
                ...scrollPosition.current,
                left: element.scrollLeft,
                top: element.scrollTop,
                active,
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

        const resizeObserver = new ResizeObserver(onDoPreserveScroll);
        const mutationObserver = new MutationObserver((entries) => {
            for (const entry of entries) {
                for (const added of entry.addedNodes) {
                    if (added instanceof HTMLElement) {
                        resizeObserver.observe(added);
                    }
                }
                for (const removed of entry.removedNodes) {
                    if (removed instanceof HTMLElement) {
                        resizeObserver.unobserve(removed);
                    }
                }
            }
        });
        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
        });

        return () => {
            mutationObserver.disconnect();
            resizeObserver.disconnect();
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
