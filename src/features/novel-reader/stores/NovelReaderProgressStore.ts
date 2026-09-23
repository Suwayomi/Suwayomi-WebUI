/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { create } from 'zustand';

interface NovelReaderProgressState {
    chapterId: number | null;
    progress: number;
    setProgress: (chapterId: number, progress: number) => void;
}

export const useNovelReaderProgressStore = create<NovelReaderProgressState>((set) => ({
    chapterId: null,
    progress: 0,
    setProgress: (chapterId, progress) => set({ chapterId, progress }),
}));
