/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PaletteOptions } from '@mui/material/styles';
import { t as translate } from 'i18next';

type Theme = { getName: () => string; palette: PaletteOptions };

const themes = {
    default: {
        getName: () => translate('global.label.default'),
        palette: {
            primary: {
                main: '#5b74ef',
            },
            secondary: {
                main: '#efd65b',
            },
        },
    },
    lavender: {
        getName: () => translate('settings.appearance.themes.lavendar'),
        palette: {
            primary: {
                main: '#5c58dc',
            },
            secondary: {
                main: '#d8dc58',
            },
        },
    },
    dune: {
        getName: () => translate('settings.appearance.themes.dune'),
        palette: {
            primary: {
                main: '#897869',
            },
            secondary: {
                main: '#697a89',
            },
        },
    },
    rosegold: {
        getName: () => translate('settings.appearance.themes.rosegold'),
        palette: {
            primary: {
                main: '#f1a886',
            },
            secondary: {
                main: '#86cff1',
            },
        },
    },
    forestDew: {
        getName: () => translate('settings.appearance.themes.forest_dew'),
        palette: {
            primary: {
                main: '#53a584',
            },
            secondary: {
                main: '#a55374',
            },
        },
    },
    mountainSunset: {
        getName: () => translate('settings.appearance.themes.mountain_sunset'),
        palette: {
            primary: {
                main: '#c55a77',
            },
            secondary: {
                main: '#5ac5a8',
            },
        },
    },
    crimson: {
        getName: () => translate('settings.appearance.themes.crimson'),
        palette: {
            primary: {
                main: '#ff0033',
            },
            secondary: {
                main: '#00ffcc',
            },
        },
    },
    mintyMiracles: {
        getName: () => translate('settings.appearance.themes.minty_miracles'),
        palette: {
            primary: {
                main: '#9defc3',
            },
            secondary: {
                main: '#ef9dc9',
            },
        },
    },
    orangeJuice: {
        getName: () => translate('settings.appearance.themes.orange_juice'),
        palette: {
            primary: {
                main: '#ffb546',
            },
            secondary: {
                main: '#4690ff',
            },
        },
    },
} as const satisfies Record<string, Theme>;

export type AppThemes = keyof typeof themes;

export type AppTheme = Theme & { id: AppThemes };

export const appThemes = (Object.entries(themes) as [AppThemes, Theme][]).map(([id, theme]) => ({
    id,
    ...theme,
})) satisfies AppTheme[];

export const getTheme = (id: AppThemes): AppTheme => ({ id, ...themes[id] });
