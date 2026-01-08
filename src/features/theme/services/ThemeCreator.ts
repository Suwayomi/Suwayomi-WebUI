/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    createTheme as createMuiTheme,
    Direction,
    responsiveFontSizes,
    Theme,
    TypeBackground,
    useTheme,
} from '@mui/material/styles';
import { useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies,no-restricted-imports
import { deepmerge } from '@mui/utils';
import { PaletteBackgroundChannel } from 'node_modules/@mui/material/esm/styles/createThemeWithVars';
import { complement, hsl, parseToHsl } from 'polished';
import { HslaColor, HslColor } from 'polished/lib/types/color';
import { AppTheme } from '@/features/theme/services/AppThemes.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import { TAppThemeContext, ThemeMode } from '@/features/theme/AppTheme.types.ts';
import { ThemeFontLoader } from '@/features/theme/services/ThemeFontLoader.ts';
import { coerceIn } from '@/lib/HelperFunctions.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

const SCROLLBAR_SIZE = 14;

const isNeutralColor = (color: HslColor | HslaColor): boolean => {
    const isDesaturated = color.saturation < 0.08;
    const isNearBlack = color.lightness < 0.03;
    const isNearWhite = color.lightness > 0.97;

    return isDesaturated || isNearBlack || isNearWhite;
};

const createBackgroundColors = (color: string, lightnessPaper: number, lightnessDefault: number): TypeBackground => {
    const colorHsl = parseToHsl(color);

    const saturationBoost = isNeutralColor(colorHsl) ? 0 : 0.15;
    const saturation = coerceIn(colorHsl.saturation + saturationBoost, 0, 1);

    return {
        paper: hsl(colorHsl.hue, saturation, lightnessPaper),
        default: hsl(colorHsl.hue, saturation, lightnessDefault),
    };
};

const getBackgroundColor = (
    type: 'light' | 'dark',
    appTheme: AppTheme['muiTheme'],
    theme: Theme,
    setPureBlackMode: boolean = false,
): (Partial<TypeBackground> & Partial<PaletteBackgroundChannel>) | undefined => {
    if (setPureBlackMode) {
        return {
            paper: '#000',
            default: '#000',
        };
    }

    if (type === 'light' && !!theme.colorSchemes.light) {
        if (typeof appTheme.colorSchemes?.light === 'object' && appTheme.colorSchemes.light.palette?.background) {
            return appTheme.colorSchemes.light.palette.background;
        }

        return createBackgroundColors(theme.colorSchemes.light.palette.primary.dark, 0.87, 0.93);
    }

    if (type === 'dark' && !!theme.colorSchemes.dark) {
        if (typeof appTheme.colorSchemes?.dark === 'object' && appTheme.colorSchemes.dark.palette?.background) {
            return appTheme.colorSchemes.dark.palette.background;
        }

        return createBackgroundColors(theme.colorSchemes.dark.palette.primary.dark, 0.06, 0.03);
    }

    return undefined;
};

const createAppThemeWithDynamicColors = (
    primaryColorDark: string | null | undefined,
    primaryColorLight: string | null | undefined,
    appTheme: AppTheme['muiTheme'],
): AppTheme['muiTheme'] => {
    if (!primaryColorDark || !primaryColorLight) {
        return appTheme;
    }

    return {
        ...appTheme,
        colorSchemes: {
            light: {
                palette: {
                    primary: { main: primaryColorLight },
                    secondary: { main: complement(primaryColorLight) },
                },
            },
            dark: {
                palette: {
                    primary: { main: primaryColorDark },
                    secondary: { main: complement(primaryColorDark) },
                },
            },
        },
    } satisfies AppTheme['muiTheme'];
};

const getVibrantColorForTheme = (
    palette: TAppThemeContext['dynamicColor'] | null,
    mode: Exclude<ThemeMode, ThemeMode.SYSTEM>,
): string | undefined => {
    if (!palette) {
        return undefined;
    }

    return mode === ThemeMode.LIGHT ? palette.DarkVibrant.hex : palette.LightVibrant.hex;
};

export const createAppColorTheme = (
    appTheme: AppTheme['muiTheme'],
    dynamicColor: TAppThemeContext['dynamicColor'],
    setPureBlackMode: boolean,
    mode: Exclude<ThemeMode, ThemeMode.SYSTEM>,
): AppTheme['muiTheme'] => {
    const appThemeWithDominantPrimaryColor = createAppThemeWithDynamicColors(
        dynamicColor?.average.hex,
        dynamicColor?.average.hex,
        appTheme,
    );
    const themePrimaryColorForBackground = createMuiTheme({
        ...appThemeWithDominantPrimaryColor,
        defaultColorScheme: mode,
    });

    const themeBackgroundColor = deepmerge(appThemeWithDominantPrimaryColor, {
        defaultColorScheme: mode,
        colorSchemes: {
            light: themePrimaryColorForBackground.colorSchemes?.light
                ? {
                      palette: {
                          background: getBackgroundColor(
                              'light',
                              appThemeWithDominantPrimaryColor,
                              themePrimaryColorForBackground,
                          ),
                      },
                  }
                : undefined,
            dark: themePrimaryColorForBackground.colorSchemes?.dark
                ? {
                      palette: {
                          background: getBackgroundColor(
                              'dark',
                              appThemeWithDominantPrimaryColor,
                              themePrimaryColorForBackground,
                              setPureBlackMode,
                          ),
                      },
                  }
                : undefined,
        },
    });

    const appThemeWithVibrantPrimaryColor = createAppThemeWithDynamicColors(
        getVibrantColorForTheme(dynamicColor, ThemeMode.DARK),
        getVibrantColorForTheme(dynamicColor, ThemeMode.LIGHT),
        themeBackgroundColor,
    );
    return deepmerge(themeBackgroundColor, appThemeWithVibrantPrimaryColor);
};

export const createTheme = (
    themeMode: ThemeMode,
    appTheme: AppTheme,
    pureBlackMode: boolean = false,
    direction: Direction = 'ltr',
    dynamicColor: TAppThemeContext['dynamicColor'] = null,
) => {
    const mode = MediaQuery.getThemeMode(themeMode);
    const isDarkMode = mode === ThemeMode.DARK;
    const setPureBlackMode = isDarkMode && pureBlackMode;

    const appColorTheme = createAppColorTheme(appTheme.muiTheme, dynamicColor, setPureBlackMode, mode);

    const themeForColors = createMuiTheme({ ...appColorTheme, defaultColorScheme: mode });

    // only style scrollbar for devices that support hovering; otherwise, they most likely are touch devices that should
    // use the native scrollbar.
    // this is necessary since for some reason chromium uses the native scrollbar for the window scrollbar and the
    // styled non-native scrollbar for element scrollbars on those devices
    const doesDeviceSupportHover = window.matchMedia('hover: hover').matches;

    const suwayomiTheme = createMuiTheme(
        deepmerge(appColorTheme, {
            defaultColorScheme: mode,
            direction,
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
                                  '*::-webkit-scrollbar': applyStyles(doesDeviceSupportHover, {
                                      width: `${SCROLLBAR_SIZE}px`,
                                      height: `${SCROLLBAR_SIZE}px`,
                                      // @ts-ignore - '*::-webkit-scrollbar' is a valid key
                                      ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                          '*::-webkit-scrollbar'
                                      ],
                                  }),
                                  '*::-webkit-scrollbar-thumb': applyStyles(doesDeviceSupportHover, {
                                      border: '4px solid rgba(0, 0, 0, 0)',
                                      backgroundClip: 'padding-box',
                                      borderRadius: '9999px',
                                      backgroundColor: `${themeForColors.palette.primary[isDarkMode ? 'dark' : 'light']}`,
                                      // @ts-ignore - '*::-webkit-scrollbar-thumb' is a valid key
                                      ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                          '*::-webkit-scrollbar-thumb'
                                      ],
                                  }),
                                  '*::-webkit-scrollbar-thumb:hover': applyStyles(doesDeviceSupportHover, {
                                      borderWidth: '2px',
                                      // @ts-ignore - '*::-webkit-scrollbar-thumb:hover' is a valid key
                                      ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                          '*::-webkit-scrollbar-thumb:hover'
                                      ],
                                  }),
                              }
                            : `
                        @media (hover: hover) {
                          *::-webkit-scrollbar {
                            width: ${SCROLLBAR_SIZE}px;
                            height: ${SCROLLBAR_SIZE}px;
                          }
                          *::-webkit-scrollbar-thumb {
                            border: 4px solid rgba(0, 0, 0, 0);
                            background-clip: padding-box;
                            border-radius: 9999px;
                            background-color: ${themeForColors.palette.primary[isDarkMode ? 'dark' : 'light']};
                          }
                          *::-webkit-scrollbar-thumb:hover {
                            border-width: 2px;
                          }
                          
                          ${appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides ?? ''}
                        }
                    `,
                },
            },
        }),
    );

    return responsiveFontSizes(suwayomiTheme);
};

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createAndSetTheme = (...args: Parameters<typeof createTheme>) => {
    theme = createTheme(...args);
    ThemeFontLoader.load(theme).catch(defaultPromiseErrorHandler('theme::createAndSetTheme'));

    return theme;
};

export const getOptionForDirection = <T>(
    ltrOption: T,
    rtlOption: T,
    direction: Theme['direction'] = theme?.direction ?? 'ltr',
): T => (direction === 'ltr' ? ltrOption : rtlOption);

export const useGetOptionForDirection = (): typeof getOptionForDirection => {
    const muiTheme = useTheme();

    return useCallback(
        <T>(...args: Parameters<typeof getOptionForDirection<T>>) => getOptionForDirection(...args),
        [muiTheme.direction],
    );
};
