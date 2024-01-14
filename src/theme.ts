/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createTheme as createMuiTheme, Palette as MuiPalette, Theme } from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
    interface Palette {
        custom: Palette['primary'];
    }

    interface PaletteOptions {
        custom: PaletteOptions['primary'];
    }
}

type DefaultMuiPalette = Omit<MuiPalette, 'custom'>;
type DefaultMuiTheme = Omit<Theme, 'palette'> & { palette: DefaultMuiPalette };

export const createTheme = (dark?: boolean) => {
    const baseTheme: DefaultMuiTheme = createMuiTheme({
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
                    width: 10px;
                    background: ${dark ? '#222' : '#e1e1e1'};   
                }
                
                *::-webkit-scrollbar-thumb {
                    background: ${dark ? '#111' : '#aaa'};
                    border-radius: 5px;
                }
            `,
                },
            },
        },
        baseTheme,
    );

    return suwayomiTheme;
};
