/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Theme, createTheme as createMuiTheme } from '@mui/material/styles';

declare module '@mui/styles/defaultTheme' {
    interface DefaultTheme extends Theme {}
}

declare module '@mui/material/styles' {
    interface PaletteOptions {
        custom?: PaletteOptions['primary'];
    }

}

const createTheme = (dark?: boolean) => {
    const baseTheme = createMuiTheme({
        palette: {
            mode: dark ? 'dark' : 'light',
        },
    });

    const tachideskTheme = createMuiTheme({
        palette: {
            custom: {
                main: dark ? baseTheme.palette.common.black : baseTheme.palette.common.white,
                light: dark ? baseTheme.palette.grey[900] : baseTheme.palette.grey[100],
            },
        },
        components: {
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
    }, baseTheme);

    return tachideskTheme;
};

export default createTheme;
