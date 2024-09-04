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

export const SCROLLBAR_WIDTH = 14;

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createTheme = (
    themeMode: ThemeMode,
    direction: Direction = 'ltr',
    color: string = '#5b74ef',
    pureBlackMode: boolean = false,
) => {
    const systemMode = MediaQuery.getSystemThemeMode();
    const mode = themeMode === ThemeMode.SYSTEM ? systemMode : themeMode;
    const isDarkMode = mode === ThemeMode.DARK;

    const baseTheme = createMuiTheme({
        direction,
        palette: {
            mode,
            primary: {
                main: color,
            },
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
    const background = pureBlackMode ? backgroundTrueBlack : backgroundThemeMode;

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
                          width: ${SCROLLBAR_WIDTH}px;
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

    theme = responsiveFontSizes(suwayomiTheme);

    return theme;
};

export const getOptionForDirection = <T>(ltrOption: T, rtlOption: T): T =>
    (theme?.direction ?? 'ltr') === 'ltr' ? ltrOption : rtlOption;
