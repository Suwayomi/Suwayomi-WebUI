/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZustandUtil } from '@/lib/zustand/ZustandUtil.ts';

export type NovelFontFamily = 'sans-serif' | 'serif' | 'monospace' | 'opendyslexic';
export type NovelTextAlign = 'left' | 'justify' | 'center';

export interface NovelReaderThemeColors {
    background: string;
    text: string;
    link: string;
    border: string;
}

export interface NovelReaderSettings {
    fontFamily: NovelFontFamily;
    fontSize: number;
    lineHeight: number;
    maxWidth: number;
    textAlign: NovelTextAlign;
    margin: number;
    paragraphSpacing: number;
}

export interface NovelReaderSettingsState extends NovelReaderSettings {
    setSetting: <K extends keyof NovelReaderSettings>(key: K, value: NovelReaderSettings[K]) => void;
    resetSettings: () => void;
}

const DEFAULT_SETTINGS: NovelReaderSettings = {
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 1.6,
    maxWidth: 800,
    textAlign: 'left',
    margin: 24,
    paragraphSpacing: 1.0,
};

export const novelReaderSettingsStore = create<NovelReaderSettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_SETTINGS,
            setSetting: (key, value) => set({ [key]: value } as Partial<NovelReaderSettingsState>),
            resetSettings: () => set({ ...DEFAULT_SETTINGS }),
        }),
        {
            name: 'suwayomi_novel_reader_settings',
        },
    ),
);

export const useNovelReaderSettingsStore = ZustandUtil.createStoreHook(novelReaderSettingsStore);
