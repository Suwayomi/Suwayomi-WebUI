/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createRef, MutableRefObject } from 'react';
import { ImmerStateCreator } from '@/lib/zustand/Zustand.types.ts';
import { ScrollOffset } from '@/base/Base.types.ts';
import { useAutomaticScrolling } from '@/base/hooks/useAutomaticScrolling.ts';
import { noOp } from '@/lib/HelperFunctions.ts';

export interface ReaderAutoScrollStoreSlice {
    autoScroll: ReturnType<typeof useAutomaticScrolling> & {
        setIsActive: (active: boolean) => void;
        setIsPaused: (paused: boolean) => void;
        scrollRef?: MutableRefObject<HTMLElement | null>;
        setScrollRef: (scrollElement: HTMLElement | null) => void;
        setDirection: (direction: ScrollOffset) => void;
        setStart: (start: () => void) => void;
        setCancel: (cancel: () => void) => void;
        setToggleActive: (toggleActive: () => void) => void;
        setPause: (pause: () => void) => void;
        setResume: (resume: () => void) => void;
        invert: boolean;
        setInvert: (invert: boolean) => void;
        direction: ScrollOffset;
        reset: () => ReaderAutoScrollStoreSlice;
    };
}

const DEFAULT_STATE = {
    isActive: false,
    isPaused: false,
    start: noOp,
    cancel: noOp,
    toggleActive: noOp,
    pause: noOp,
    resume: noOp,
    invert: false,
    direction: ScrollOffset.FORWARD,
    scrollRef: undefined,
} satisfies Omit<
    ReaderAutoScrollStoreSlice['autoScroll'],
    | 'setIsActive'
    | 'setIsPaused'
    | 'setStart'
    | 'setCancel'
    | 'setToggleActive'
    | 'setPause'
    | 'setResume'
    | 'setInvert'
    | 'setDirection'
    | 'setScrollRef'
    | 'reset'
>;

export const createReaderAutoScrollStoreSlice = <T extends ReaderAutoScrollStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderAutoScrollStoreSlice =>
    ({
        autoScroll: {
            ...DEFAULT_STATE,
            reset: () => ({ autoScroll: { ...get().autoScroll, ...DEFAULT_STATE } }),
            setIsActive: (active) =>
                set((draft) => {
                    draft.autoScroll.isActive = active;
                }),
            setIsPaused: (paused) =>
                set((draft) => {
                    draft.autoScroll.isPaused = paused;
                }),
            setStart: (start) =>
                set((draft) => {
                    draft.autoScroll.start = start;
                }),
            setCancel: (cancel) =>
                set((draft) => {
                    draft.autoScroll.cancel = cancel;
                }),
            setToggleActive: (toggleActive) =>
                set((draft) => {
                    draft.autoScroll.toggleActive = toggleActive;
                }),
            setPause: (pause) =>
                set((draft) => {
                    draft.autoScroll.pause = pause;
                }),
            setResume: (resume) =>
                set((draft) => {
                    draft.autoScroll.resume = resume;
                }),
            setInvert: (invert) =>
                set((draft) => {
                    draft.autoScroll.invert = invert;
                }),
            setDirection: (direction) =>
                set((draft) => {
                    draft.autoScroll.direction = direction;
                }),
            setScrollRef: (scrollElement) =>
                set((draft) => {
                    if (!scrollElement) {
                        draft.autoScroll.scrollRef = undefined;
                        return;
                    }

                    const ref = createRef() as MutableRefObject<HTMLElement | null>;
                    ref.current = scrollElement;
                    // @ts-expect-error - TS2322: Type MutableRefObject<HTMLElement | null> is not assignable to type WritableDraft<MutableRefObject<HTMLElement | null>>
                    draft.autoScroll.scrollRef = ref;
                }),
        },
    }) satisfies ReaderAutoScrollStoreSlice;
