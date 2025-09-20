/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ImmerStateCreator } from '@/lib/zustand/Zustand.types.ts';
import { TReaderProgressBarContext } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';

export interface ReaderProgressBarStoreSlice {
    progressBar: TReaderProgressBarContext & {
        reset: () => void;
    };
}

const DEFAULT_STATE = {
    isMaximized: false,
    isDragging: false,
} satisfies Pick<ReaderProgressBarStoreSlice['progressBar'], 'isDragging' | 'isMaximized'>;

export const createReaderProgressBarStoreSlice = <T extends ReaderProgressBarStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderProgressBarStoreSlice => ({
    progressBar: {
        ...DEFAULT_STATE,
        setIsMaximized: (maximized) =>
            set((draft) => {
                draft.progressBar.isMaximized = maximized;
            }),
        setIsDragging: (dragging) =>
            set((draft) => {
                draft.progressBar.isDragging = dragging;
            }),
        reset: () => set(() => ({ progressBar: { ...get().progressBar, ...DEFAULT_STATE } })),
    },
});
