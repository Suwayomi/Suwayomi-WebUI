/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TMangaReader } from '@/features/manga/Manga.types.ts';

interface ReaderStore {
    reset: () => void;
    manga: TMangaReader | undefined;
    setManga: (manga: TMangaReader | undefined) => void;
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
    })),
);
