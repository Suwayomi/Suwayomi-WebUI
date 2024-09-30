/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import useMediaQuery from '@mui/material/useMediaQuery';
import { Breakpoint } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { getCurrentTheme } from '@/theme.tsx';
import { ThemeMode } from '@/components/context/ThemeModeContext.tsx';
import { AppStorage } from '@/util/AppStorage.ts';
import { useResizeObserver } from '@/util/useResizeObserver.tsx';

export class MediaQuery {
    static useIsTouchDevice(): boolean {
        return useMediaQuery('not (pointer: fine)');
    }

    static useIsBelowWidth(breakpoint: Breakpoint): boolean {
        return useMediaQuery(getCurrentTheme().breakpoints.down(breakpoint));
    }

    static useIsMobileWidth(): boolean {
        return this.useIsBelowWidth('sm');
    }

    static useGetScrollbarSize(type: 'height' | 'width'): number {
        const [scrollbarSize, setScrollbarSize] = useState(0);

        useResizeObserver(
            document.documentElement,
            useCallback(() => {
                const height = window.innerHeight - document.documentElement.clientHeight;
                const width = window.innerWidth - document.documentElement.clientWidth;
                const size = type === 'height' ? height : width;

                setScrollbarSize(size);
            }, []),
        );

        return scrollbarSize;
    }

    static getSystemThemeMode(): Exclude<ThemeMode, 'system'> {
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT;
    }

    static getThemeMode(): Exclude<ThemeMode, 'system'> {
        const themeMode = AppStorage.local.getItemParsed<ThemeMode>('themeMode', ThemeMode.SYSTEM);

        const isSystemMode = themeMode === ThemeMode.SYSTEM;
        if (isSystemMode) {
            return this.getSystemThemeMode();
        }

        return themeMode;
    }

    static listenToSystemThemeChange(onChange: (themeMode: Exclude<ThemeMode, 'system'>) => void): () => void {
        const handleSystemThemeModeChange = (e: MediaQueryListEvent) => {
            onChange(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
        };

        const matchSystemThemeMode = window.matchMedia('(prefers-color-scheme: dark)');

        matchSystemThemeMode.addEventListener('change', handleSystemThemeModeChange);

        return () => matchSystemThemeMode.removeEventListener('change', handleSystemThemeModeChange);
    }
}
