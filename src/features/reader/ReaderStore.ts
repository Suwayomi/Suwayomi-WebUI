/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { TMangaReader } from '@/features/manga/Manga.types.ts';

interface ReaderStore {
    reset: () => void;
    manga: TMangaReader | undefined;
    setManga: (manga: TMangaReader | undefined) => void;
    scrollbar: {
        scrollbarXSize: number;
        setScrollbarXSize: (size: number) => void;
        scrollbarYSize: number;
        setScrollbarYSize: (size: number) => void;
    };
}

const DEFAULT_STATE = {
    manga: undefined,
} satisfies Pick<ReaderStore, 'manga'>;

export const useReaderStore = create<ReaderStore>()(
    immer((set) => ({
        ...DEFAULT_STATE,
        reset: () =>
            set((draft) => {
                draft.manga = DEFAULT_STATE.manga;
            }),
        setManga: (manga) =>
            set((draft) => {
                draft.manga = manga;
            }),
        scrollbar: {
            scrollbarXSize: 0,
            setScrollbarXSize: (size) =>
                set((draft) => {
                    draft.scrollbar.scrollbarXSize = size;
                }),
            scrollbarYSize: 0,
            setScrollbarYSize: (size) =>
                set((draft) => {
                    draft.scrollbar.scrollbarYSize = size;
                }),
        },
    })),
);
export const useReaderStoreShallow = <T>(selector: (state: ReaderStore) => T): T =>
    useReaderStore(useShallow(selector));
export const getReaderStore = () => useReaderStore.getState();
