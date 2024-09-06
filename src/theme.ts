/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    createTheme as createMuiTheme,
    darken,
    Direction,
    lighten,
    Palette,
    responsiveFontSizes,
    Theme,
} from '@mui/material/styles';
import { ThemeMode } from '@/components/context/ThemeModeContext.tsx';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';
import { AppTheme } from '@/lib/ui/AppThemes.ts';

const SCROLLBAR_SIZE = 14;

export const createTheme = (
    themeMode: ThemeMode,
    appTheme: AppTheme,
    pureBlackMode: boolean = false,
    direction: Direction = 'ltr',
) => {
    const systemMode = MediaQuery.getSystemThemeMode();

    const appThemeType = (appTheme.muiTheme.palette as any)?.type ?? appTheme.muiTheme.palette?.mode;
    const isStaticThemeMode = !!appThemeType;
    const appThemeMode = appThemeType === 'dark' ? ThemeMode.DARK : ThemeMode.LIGHT;
    const staticThemeMode = isStaticThemeMode ? appThemeMode : undefined;

    const mode = staticThemeMode ?? (themeMode === ThemeMode.SYSTEM ? systemMode : themeMode);
    const isDarkMode = mode === ThemeMode.DARK;
    const setPureBlackMode = isDarkMode && pureBlackMode;

    const baseTheme = createMuiTheme({
        direction,
        ...appTheme.muiTheme,
        palette: {
            mode,
            ...(appTheme.muiTheme.palette ?? {}),
        },
    });

    const backgroundTrueBlack: Palette['background'] = {
        paper: '#111',
        default: '#000',
    };
    const backgroundDark: Palette['background'] = {
        paper: darken(baseTheme.palette.primary.main, 0.75),
        default: darken(baseTheme.palette.primary.main, 0.85),
    };
    const backgroundLight: Palette['background'] = {
        paper: lighten(baseTheme.palette.primary.dark, 0.75),
        default: lighten(baseTheme.palette.primary.dark, 0.85),
    };
    const backgroundThemeMode = isDarkMode ? backgroundDark : backgroundLight;
    const automaticBackground = setPureBlackMode ? backgroundTrueBlack : backgroundThemeMode;
    const appThemeBackground = appTheme.muiTheme.palette?.background;

    const requiresAutomaticBackground = setPureBlackMode || !appThemeBackground;
    const background = requiresAutomaticBackground ? automaticBackground : appThemeBackground;

    const colorTheme = createMuiTheme(baseTheme, {
        palette: {
            background,
        },
    });

    const suwayomiTheme = createMuiTheme(colorTheme, {
        components: {
            MuiUseMediaQuery: {
                defaultProps: {
                    noSsr: true,
                },
            },
            MuiCssBaseline: {
                styleOverrides: `
                        *::-webkit-scrollbar {
                          width: ${SCROLLBAR_SIZE}px;
                          height: ${SCROLLBAR_SIZE}px;
                        }
                        *::-webkit-scrollbar-thumb {
                          border: 4px solid rgba(0, 0, 0, 0);
                          background-clip: padding-box;
                          border-radius: 9999px;
                          background-color: ${colorTheme.palette.primary[isDarkMode ? 'dark' : 'light']};
                        }
                        *::-webkit-scrollbar-thumb:hover {
                          border-width: 2px;
                        }
                    `,
            },
        },
    });

    return responsiveFontSizes(suwayomiTheme);
};

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createAndSetTheme = (...args: Parameters<typeof createTheme>) => {
    theme = createTheme(...args);
    return theme;
};

export const getOptionForDirection = <T>(ltrOption: T, rtlOption: T): T =>
    (theme?.direction ?? 'ltr') === 'ltr' ? ltrOption : rtlOption;
