/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollDirection } from '@/modules/core/Core.types.ts';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

// in case the scroll amount is not enough "scrollBy" just does not do anything
const MIN_SCROLL_AMOUNT_PX = 1.5;
const getScrollAmount = (amountPerMs: number, speedMs: number): { amountPx: number; speedMs: number } => {
    const amountPx = amountPerMs * speedMs;

    if (amountPx >= MIN_SCROLL_AMOUNT_PX) {
        return { amountPx, speedMs };
    }

    return getScrollAmount(amountPerMs, speedMs + 1);
};

function getPxPerMs(size: number, scrollAmountPercentage: number, scrollSpeedMs: number) {
    return (size * (scrollAmountPercentage / 100)) / scrollSpeedMs;
}

export const useAutomaticScrolling = (
    refOrCallback: MutableRefObject<HTMLElement | null> | (() => void) | undefined,
    scrollPerSecond: number,
    scrollDirection: Exclude<ScrollDirection, ScrollDirection.XY> = ScrollDirection.Y,
    scrollAmountPercentage: number = 100,
    invert: boolean = false,
    smooth: boolean = false,
): {
    isActive: boolean;
    isPaused: boolean;
    start: () => void;
    cancel: () => void;
    toggleActive: () => void;
    pause: () => void;
    resume: () => void;
} => {
    const isCallback = typeof refOrCallback === 'function';

    const elementStyle = useRef<CSSStyleDeclaration>();
    const scrollTriggerTimer = useRef<NodeJS.Timeout>();

    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // scroll amount is based on the screen dimensions, thus, the hook needs to update in case they change
    const [screenDimensions, setScreenDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    useResizeObserver(
        document.documentElement,
        useCallback(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (screenDimensions.width !== width || screenDimensions.height !== height) {
                setScreenDimensions({ width, height });
            }
        }, []),
    );

    const start = useCallback(() => {
        setIsActive(true);
    }, []);
    const cancel = useCallback(() => {
        setIsActive(false);
        setIsPaused(false);
        clearInterval(scrollTriggerTimer.current);
    }, []);
    const toggleActive = useCallback(() => {
        if (isActive) {
            cancel();
            return;
        }

        start();
    }, [isActive]);
    const pause = useCallback(() => {
        setIsPaused(true);
    }, []);
    const resume = useCallback(() => {
        setIsPaused(false);
    }, []);

    useEffect(() => {
        if (!refOrCallback) {
            return () => {};
        }

        if (!isActive) {
            return () => {};
        }

        const scrollSpeedMs = scrollPerSecond * 1000;

        const startScrolling = (callback: () => void, timeout: number) => {
            clearInterval(scrollTriggerTimer.current);
            scrollTriggerTimer.current = setInterval(() => {
                if (isActive && !isPaused) {
                    callback();
                }
            }, timeout);
        };

        if (isCallback) {
            startScrolling(refOrCallback, scrollSpeedMs);
            return () => clearInterval(scrollTriggerTimer.current);
        }

        const element = refOrCallback.current;
        if (!element) {
            return () => {};
        }

        if (!elementStyle.current) {
            elementStyle.current = getComputedStyle(element);
        }

        const isRTL = elementStyle.current.direction === 'rtl';
        const handleScrollX = scrollDirection !== ScrollDirection.Y;
        const handleScrollY = scrollDirection !== ScrollDirection.X;

        const pxPerMsX = getPxPerMs(window.innerWidth, scrollAmountPercentage, scrollSpeedMs);
        const pxPerMsY = getPxPerMs(window.innerHeight, scrollAmountPercentage, scrollSpeedMs);

        const tmpScrollSpeedMs = smooth ? 1 : scrollSpeedMs;
        const { amountPx: pxScrollAmountX, speedMs: timeoutMsX } = getScrollAmount(pxPerMsX, tmpScrollSpeedMs);
        const { amountPx: pxScrollAmountY, speedMs: timeoutMsY } = getScrollAmount(pxPerMsY, tmpScrollSpeedMs);

        const timeoutMs = handleScrollX ? timeoutMsX : timeoutMsY;

        const scrollTopByBase = handleScrollY ? pxScrollAmountY : 0;
        const scrollLeftByBase = handleScrollX ? pxScrollAmountX : 0;
        const scrollTopByReadingMode = scrollTopByBase;
        const scrollLeftByReadingMode = isRTL ? -scrollLeftByBase : scrollLeftByBase;
        const scrollTopByInverted = invert ? scrollTopByReadingMode * -1 : scrollTopByReadingMode;
        const scrollLeftByInverted = invert ? scrollLeftByReadingMode * -1 : scrollLeftByReadingMode;

        startScrolling(() => {
            element.scrollBy({
                top: scrollTopByInverted,
                left: scrollLeftByInverted,
                // arg "smooth" triggers the interval so fast that using "behavior smooth" doesn't look smooth and also slows down the scrolling
                behavior: smooth ? undefined : 'smooth',
            });
        }, timeoutMs);

        return () => clearInterval(scrollTriggerTimer.current);
    }, [refOrCallback, scrollPerSecond, scrollAmountPercentage, screenDimensions, isActive, isPaused, invert, smooth]);

    return useMemo(
        () => ({ isActive, isPaused, start, cancel, toggleActive, pause, resume }),
        [isActive, isPaused, start, cancel, toggleActive, pause, resume],
    );
};
