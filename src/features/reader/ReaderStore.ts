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
import {
    createReaderOverlayStoreSlice,
    ReaderOverlayStoreSlice,
} from '@/features/reader/overlay/ReaderOverlayStore.ts';
import {
    createReaderAutoScrollStoreSlice,
    ReaderAutoScrollStoreSlice,
} from '@/features/reader/auto-scroll/ReaderAutoScrollStore.ts';
import {
    IReaderSettingsWithDefaultFlag,
    ReaderStateChapters,
    ReaderStatePages,
} from '@/features/reader/Reader.types.ts';
import { ImmerStateCreator } from '@/lib/zustand/Zustand.types.ts';
import { READER_DEFAULT_CHAPTERS_STATE, READER_DEFAULT_PAGES_STATE } from '@/features/reader/ReaderStore.constants.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import {
    createReaderProgressBarStoreSlice,
    ReaderProgressBarStoreSlice,
} from '@/features/reader/overlay/progress-bar/ReaderProgressBarStore.tsx';

interface ReaderPagesStoreSlice {
    pages: ReaderStatePages & {
        reset: () => void;
    };
}

interface ReaderChaptersStoreSlice {
    chapters: ReaderStateChapters & {
        reset: () => void;
    };
}

interface ReaderStore
    extends ReaderOverlayStoreSlice,
        ReaderAutoScrollStoreSlice,
        ReaderPagesStoreSlice,
        ReaderChaptersStoreSlice,
        ReaderProgressBarStoreSlice {
    reset: () => void;
    manga: TMangaReader | undefined;
    setManga: (manga: TMangaReader | undefined) => void;
    scrollbar: {
        xSize: number;
        setXSize: (size: number) => void;
        ySize: number;
        setYSize: (size: number) => void;
    };
    settings: IReaderSettingsWithDefaultFlag & {
        setSettings: (settings: IReaderSettingsWithDefaultFlag) => void;
    };
}

const DEFAULT_STATE = {
    manga: undefined,
    scrollbar: {
        xSize: 0,
        ySize: 0,
    },
} satisfies Pick<ReaderStore, 'manga'> & { scrollbar: Pick<ReaderStore['scrollbar'], 'xSize' | 'ySize'> };

const createReaderPagesStoreSlice = <T extends ReaderPagesStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderPagesStoreSlice => ({
    pages: {
        ...READER_DEFAULT_PAGES_STATE,
        reset: () => set(() => ({ pages: { ...get().pages, ...READER_DEFAULT_PAGES_STATE } })),
        setCurrentPageIndex: (index) =>
            set((draft) => {
                draft.pages.currentPageIndex = index;
            }),
        setPageToScrollToIndex: (index) =>
            set((draft) => {
                draft.pages.pageToScrollToIndex = index;
            }),
        setTotalPages: (total) =>
            set((draft) => {
                draft.pages.totalPages = total;
            }),
        setPageUrls: (urls) =>
            set((draft) => {
                draft.pages.pageUrls = urls;
            }),
        setPageLoadStates: (loadStates) =>
            set((draft) => {
                if (typeof loadStates === 'function') {
                    draft.pages.pageLoadStates = loadStates(get().pages.pageLoadStates);
                    return;
                }

                draft.pages.pageLoadStates = loadStates;
            }),
        setPages: (pages) =>
            set((draft) => {
                draft.pages.pages = pages;
            }),
        setTransitionPageMode: (mode) =>
            set((draft) => {
                draft.pages.transitionPageMode = mode;
            }),
        setRetryFailedPagesKeyPrefix: (prefix) =>
            set((draft) => {
                draft.pages.retryFailedPagesKeyPrefix = prefix;
            }),
    },
});

const createReaderChaptersStoreSlice = <T extends ReaderChaptersStoreSlice>(
    ...[set, get]: Parameters<ImmerStateCreator<T>>
): ReaderChaptersStoreSlice => ({
    chapters: {
        ...READER_DEFAULT_CHAPTERS_STATE.chapters,
        reset: () => set(() => ({ chapters: { ...get().chapters, ...READER_DEFAULT_CHAPTERS_STATE.chapters } })),
        setReaderStateChapters: (state) =>
            set((draft) => {
                if (typeof state === 'function') {
                    draft.chapters = {
                        ...get().chapters,
                        ...state(get().chapters),
                    };
                    return;
                }

                draft.chapters = {
                    ...get().chapters,
                    ...state,
                };
            }),
    },
});

export const useReaderStore = create<ReaderStore>()(
    immer((set, get, store) => ({
        ...DEFAULT_STATE,
        reset: () =>
            set((draft) => {
                draft.manga = DEFAULT_STATE.manga;
                draft.scrollbar = { ...get().scrollbar, ...DEFAULT_STATE.scrollbar };
                get().overlay.reset();
                get().autoScroll.reset();
                get().pages.reset();
                get().chapters.reset();
                draft.settings = {
                    ...get().settings,
                    ...DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
                };
                get().progressBar.reset();
            }),
        setManga: (manga) =>
            set((draft) => {
                draft.manga = manga;
            }),
        scrollbar: {
            ...DEFAULT_STATE.scrollbar,
            setXSize: (size) =>
                set((draft) => {
                    draft.scrollbar.xSize = size;
                }),
            setYSize: (size) =>
                set((draft) => {
                    draft.scrollbar.ySize = size;
                }),
        },
        settings: {
            ...DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
            setSettings: (settings) =>
                set((draft) => {
                    draft.settings = {
                        ...get().settings,
                        ...settings,
                    };
                }),
        },
        ...createReaderOverlayStoreSlice(set, get, store),
        ...createReaderAutoScrollStoreSlice(set, get, store),
        ...createReaderPagesStoreSlice(set, get, store),
        ...createReaderChaptersStoreSlice(set, get, store),
        ...createReaderProgressBarStoreSlice(set, get, store),
    })),
);
export const useReaderStoreShallow = <T>(selector: (state: ReaderStore) => T): T =>
    useReaderStore(useShallow(selector));
export const getReaderStore = () => useReaderStore.getState();
