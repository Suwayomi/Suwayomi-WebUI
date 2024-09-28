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
    useTheme,
} from '@mui/material/styles';
import { useCallback } from 'react';
import { ThemeMode } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { AppTheme, loadThemeFonts } from '@/modules/theme/services/AppThemes.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

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
        paper: lighten(baseTheme.palette.primary.dark, 0.8),
        default: lighten(baseTheme.palette.primary.dark, 0.9),
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
            ...appTheme.muiTheme.components,
            MuiUseMediaQuery: {
                defaultProps: {
                    noSsr: true,
                },
            },
            MuiCssBaseline: {
                ...appTheme.muiTheme.components?.MuiCssBaseline,
                styleOverrides:
                    typeof appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides === 'object'
                        ? {
                              ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides,
                              '*::-webkit-scrollbar': {
                                  width: `${SCROLLBAR_SIZE}px`,
                                  height: `${SCROLLBAR_SIZE}px`,
                                  // @ts-ignore - '*::-webkit-scrollbar' is a valid key
                                  ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                      '*::-webkit-scrollbar'
                                  ],
                              },
                              '*::-webkit-scrollbar-thumb': {
                                  border: '4px solid rgba(0, 0, 0, 0)',
                                  backgroundClip: 'padding-box',
                                  borderRadius: '9999px',
                                  backgroundColor: `${colorTheme.palette.primary[isDarkMode ? 'dark' : 'light']}`,
                                  // @ts-ignore - '*::-webkit-scrollbar-thumb' is a valid key
                                  ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                      '*::-webkit-scrollbar-thumb'
                                  ],
                              },
                              '*::-webkit-scrollbar-thumb:hover': {
                                  borderWidth: '2px',
                                  // @ts-ignore - '*::-webkit-scrollbar-thumb:hover' is a valid key
                                  ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                      '*::-webkit-scrollbar-thumb:hover'
                                  ],
                              },
                          }
                        : `
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
                        
                        ${appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides ?? ''}
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
    loadThemeFonts(theme).catch(defaultPromiseErrorHandler('theme::createAndSetTheme'));

    return theme;
};

export const getOptionForDirection = <T,>(
    ltrOption: T,
    rtlOption: T,
    direction: Theme['direction'] = theme?.direction ?? 'ltr',
): T => (direction === 'ltr' ? ltrOption : rtlOption);

export const useGetOptionForDirection = (): typeof getOptionForDirection => {
    const muiTheme = useTheme();

    return useCallback(
        <T,>(...args: Parameters<typeof getOptionForDirection<T>>) => getOptionForDirection(...args),
        [muiTheme.direction],
    );
};
