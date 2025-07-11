/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReadingDirection, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';

interface UseSwipeNavigateProps {
    readingMode: ReadingMode;
    readingDirection: ReadingDirection;
    swipePreviewThreshold: number;
    currentPageIndex: number;
    pages: ReaderStatePages['pages'];
}

const SWIPE_THRESHOLD = 30;
const ANIMATION_DURATION = 200;

export function useSwipeNavigate({
    readingMode,
    readingDirection,
    swipePreviewThreshold,
    currentPageIndex,
    pages,
}: UseSwipeNavigateProps) {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [previewDirection, setPreviewDirection] = useState<'next' | 'previous' | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const openPage = ReaderControls.useOpenPage();

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (readingMode === ReadingMode.SINGLE_PAGE) {
                e.preventDefault();
            }
        };

        if (readingMode === ReadingMode.SINGLE_PAGE) {
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
        }

        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [readingMode]);

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
                setSwipeOffset(0);
                setPreviewDirection(null);
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

            if (absDeltaX > deltaY && absDeltaX > SWIPE_THRESHOLD) {
                setIsSwiping(true);
                setSwipeOffset(deltaX);
                const isLeftSwipe = deltaX < 0;
                if (readingDirection === ReadingDirection.LTR) {
                    setPreviewDirection(isLeftSwipe ? 'next' : 'previous');
                } else {
                    setPreviewDirection(isLeftSwipe ? 'previous' : 'next');
                }
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
            const triggerThreshold = window.innerWidth * (swipePreviewThreshold / 100);

            if (distance > triggerThreshold && deltaY < 100) {
                setIsTransitioning(true);
                setTouchStart(null);
                const targetOffset = deltaX > 0 ? window.innerWidth : -window.innerWidth;
                setSwipeOffset(targetOffset);

                setTimeout(() => {
                    setSwipeOffset(0);
                    const shouldGoNext = deltaX < 0;
                    const direction = shouldGoNext ? 'next' : 'previous';
                    openPage(direction);
                    setPreviewDirection(null);
                    setIsSwiping(false);
                    setIsTransitioning(false);
                }, ANIMATION_DURATION);
                return;
            }

            setTouchStart(null);
            setIsSwiping(false);
            setSwipeOffset(0);
            setPreviewDirection(null);
        },
        [touchStart, readingMode, readingDirection, openPage, swipePreviewThreshold],
    );

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

    return {
        isSwiping,
        swipeOffset,
        isTransitioning,
        previewPageUrl,
        previewDirection,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    };
}
