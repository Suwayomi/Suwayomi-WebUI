/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useEffect } from 'react';
import { ReadingDirection, ReadingMode } from '@/features/reader/Reader.types.ts';

export const useReaderHorizontalModeInvertXYScrolling = (
    readingMode: ReadingMode,
    readingDirection: ReadingDirection,
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
) => {
    // invert x and y scrolling for the continuous horizontal reading mode
    useEffect(() => {
        if (readingMode !== ReadingMode.CONTINUOUS_HORIZONTAL) {
            return () => {};
        }

        if (!scrollElementRef.current) {
            return () => {};
        }

        let previousDeltaX: number | undefined;
        let previousDeltaY: number | undefined;

        // Trackpads can be identified by checking the delta values.
        // For a trackpad these values are not consistent since it basically behaves like scrolling via touch.
        // While for a mouse the values should always have the same value because each wheel turn scrolls the same exact amount.
        let isTrackpad: boolean | undefined;

        const handleScroll = (e: WheelEvent) => {
            // Trackpads can scroll horizontally without the need of having "shift" pressed.
            // This is a problem because the hook will consider this to be a vertical scroll event and will invert it, which
            // breaks scrolling horizontally on trackpads.
            if (isTrackpad === true) {
                return;
            }

            e.preventDefault();

            const isConsistentDeltaX = !Math.abs(Math.abs(previousDeltaX ?? e.deltaX) - Math.abs(e.deltaX));
            const isConsistentDeltaY = !Math.abs(Math.abs(previousDeltaY ?? e.deltaY) - Math.abs(e.deltaY));

            previousDeltaX = e.deltaX;
            previousDeltaY = e.deltaY;

            if (!isTrackpad) {
                isTrackpad = !isConsistentDeltaX || !isConsistentDeltaY;
            }

            const preventInversion = isTrackpad === undefined;
            if (preventInversion) {
                return;
            }

            if (e.shiftKey) {
                scrollElementRef.current?.scrollBy({
                    top: e.deltaY,
                });
                return;
            }

            scrollElementRef.current?.scrollBy({
                left: readingDirection === ReadingDirection.LTR ? e.deltaY : e.deltaY * -1,
            });
        };

        scrollElementRef.current.addEventListener('wheel', handleScroll);
        return () => scrollElementRef.current?.removeEventListener('wheel', handleScroll);
    }, [readingMode, readingDirection]);
};
