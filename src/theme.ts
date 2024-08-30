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
    Palette as MuiPalette,
    Theme,
} from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
    interface Palette {
        custom: Palette['primary'];
    }

    interface PaletteOptions {
        custom: PaletteOptions['primary'];
    }
}

export const SCROLLBAR_WIDTH = 14;

type DefaultMuiPalette = Omit<MuiPalette, 'custom'>;
type DefaultMuiTheme = Omit<Theme, 'palette'> & { palette: DefaultMuiPalette };

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createTheme = (dark?: boolean, direction: Direction = 'ltr') => {
    const baseTheme: DefaultMuiTheme = createMuiTheme({
        direction,
        palette: {
            mode: dark ? 'dark' : 'light',
        },
    } as Theme);

    const suwayomiTheme = createMuiTheme(
        {
            palette: {
                custom: {
                    main: dark ? baseTheme.palette.common.black : baseTheme.palette.common.white,
                    light: dark ? baseTheme.palette.grey[900] : baseTheme.palette.grey[100],
                },
            },
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
                          background-color: ${dark ? lighten(baseTheme.palette.background.default, 0.4) : darken(baseTheme.palette.background.default, 0.4)};
                        }
                        *::-webkit-scrollbar-thumb:hover {
                          border-width: 2px;
                        }
                    `,
                },
            },
        },
        baseTheme,
    );

    theme = suwayomiTheme;

    return suwayomiTheme;
};

export const getOptionForDirection = <T>(ltrOption: T, rtlOption: T): T =>
    (theme?.direction ?? 'ltr') === 'ltr' ? ltrOption : rtlOption;
