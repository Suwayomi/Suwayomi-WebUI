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
import { getCurrentTheme } from '@/modules/theme/services/ThemeCreator.ts';
import { ThemeMode } from '@/modules/theme/contexts/AppThemeContext.tsx';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

export class MediaQuery {
    static readonly MOBILE_WIDTH: Breakpoint | number = 'sm';

    static readonly TABLET_WIDTH: Breakpoint | number = 1025;

    static useIsTouchDevice(): boolean {
        return useMediaQuery('not (pointer: fine)');
    }

    static useIsBelowWidth(breakpoint: Breakpoint | number): boolean {
        return useMediaQuery(getCurrentTheme().breakpoints.down(breakpoint));
    }

    static useIsMobileWidth(): boolean {
        return this.useIsBelowWidth(this.MOBILE_WIDTH);
    }

    static useIsTabletWidth(): boolean {
        return this.useIsBelowWidth(this.TABLET_WIDTH);
    }

    private static getScrollbarSize(type: 'height' | 'width'): number {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        outer.appendChild(inner);

        const width = outer.offsetWidth - inner.offsetWidth;
        const height = outer.offsetHeight - inner.offsetHeight;

        outer.parentNode?.removeChild(outer);

        return type === 'height' ? height : width;
    }

    static useGetScrollbarSize(
        type: 'height' | 'width',
        element: HTMLElement | null = document.documentElement,
    ): number {
        const [scrollbarSize, setScrollbarSize] = useState(0);

        useResizeObserver(
            element,
            useCallback(() => {
                const hasYScrollbar = !!(element!.scrollHeight - element!.clientHeight);
                const hasXScrollbar = !!(element!.scrollWidth - element!.clientWidth);

                const hasScrollbar = (type === 'height' && hasYScrollbar) || (type === 'width' && hasXScrollbar);
                if (hasScrollbar) {
                    setScrollbarSize(this.getScrollbarSize(type));
                    return;
                }

                setScrollbarSize(0);
            }, [element]),
        );

        return scrollbarSize;
    }

    static getSystemThemeMode(): Exclude<ThemeMode, 'system'> {
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT;
    }

    static getThemeMode(): Exclude<ThemeMode, 'system'> {
        const themeMode = AppStorage.local.getItem('mui-mode') as ThemeMode;

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
