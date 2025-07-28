/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CssVarsThemeOptions } from '@mui/material/styles';
import WebFont from 'webfontloader';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { TBaseTheme, themes } from '@/modules/theme/Themes.ts';

export type AppThemes = keyof typeof themes | string;

export type AppTheme = TBaseTheme & { id: AppThemes; isCustom: boolean };

export const appThemes = (Object.entries(themes) as [AppThemes, TBaseTheme][]).map(([id, theme]) => ({
    id,
    ...theme,
})) satisfies AppTheme[];

export const getTheme = (id: AppThemes, customThemes: Record<string, AppTheme> = {}): AppTheme => {
    try {
        const allThemes = { ...themes, ...customThemes };
        const theme = (allThemes[id as keyof typeof themes] as AppTheme) ?? themes.default;

        return {
            // @ts-ignore - custom themes do not have a "getName" function
            getName: () => id,
            // @ts-ignore - app themes do not have the "id" prop by default
            id,
            ...theme,
        };
    } catch (e) {
        defaultPromiseErrorHandler('getTheme')(e);
    }
    return { id, ...themes[id as keyof typeof themes] };
};

export const isThemeNameUnique = (id: string, customThemes: Record<string, AppTheme>): boolean =>
    Object.keys({ ...themes, ...customThemes }).every((themeId) => themeId.toLowerCase() !== id.toLowerCase());

const getFontsFromTheme = (obj: Record<string, any>, fonts: string[] = []): string[] => {
    const tmpFonts = [...fonts];

    const propertyNames = Object.keys(obj);
    for (const propertyName of propertyNames) {
        const propertyValue = obj[propertyName];
        const propertyType = typeof obj[propertyName];

        const isValidFontProperty = propertyName === 'fontFamily' && propertyType === 'string';
        if (isValidFontProperty) {
            tmpFonts.push(propertyValue as string);
            // eslint-disable-next-line no-continue
            continue;
        }

        const isObject = propertyType === 'object';
        if (isObject) {
            tmpFonts.push(...getFontsFromTheme(propertyValue as Record<string, any>, tmpFonts));
        }
    }

    return [...new Set(tmpFonts)];
};

const loadedFonts: string[] = [];

export const hasMissingFonts = (theme: CssVarsThemeOptions): boolean => {
    const themeFonts = getFontsFromTheme(theme.typography ?? {});
    return !!themeFonts.length && themeFonts.some((font) => !loadedFonts.includes(font));
};

export const loadThemeFonts = async (theme: CssVarsThemeOptions): Promise<void> => {
    const themeFonts = getFontsFromTheme(theme.typography ?? {});
    const missingThemeFonts = themeFonts.filter((font) => !loadedFonts.includes(font));

    if (!missingThemeFonts.length) {
        return;
    }

    const loadFontsPromise = new ControlledPromise();
    try {
        WebFont.load({
            google: {
                families: missingThemeFonts,
            },
            active: () => {
                loadedFonts.push(...missingThemeFonts);
                loadFontsPromise.resolve();
            },
            inactive: () => {
                loadFontsPromise.reject();
            },
        });
    } catch (e) {
        defaultPromiseErrorHandler('AppThemes::loadFonts')(e);
        loadFontsPromise.reject(e);
    }

    await loadFontsPromise.promise;
};
