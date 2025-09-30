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
import { TBaseTheme, themes } from '@/features/theme/Themes.ts';

export type AppThemes = keyof typeof themes | string;

export type AppTheme = TBaseTheme & { id: AppThemes; isCustom: boolean };

export const appThemes = (Object.entries(themes) as [AppThemes, TBaseTheme][]).map(([id, theme]) => ({
    id,
    ...theme,
})) satisfies AppTheme[];

export const getTheme = (id: AppThemes | undefined, customThemes: Record<string, AppTheme> = {}): AppTheme => {
    // TODO - This is a workaround to fix a type error which causes a white screen.
    //        It should be removed and replaced with a proper migration logic, which would then e.g., add a migration to
    //        remove deprecated/outdated settings from the local storage
    const actualId = id === undefined ? 'default' : id;

    const allThemes = { ...themes, ...customThemes };
    const theme = (allThemes[actualId as keyof typeof themes] as AppTheme) ?? themes.default;

    return {
        // @ts-ignore - custom themes do not have a "getName" function
        getName: () => id,
        // @ts-ignore - app themes do not have the "id" prop by default
        id,
        ...theme,
    };
};

export const isThemeNameUnique = (id: string, customThemes: Record<string, AppTheme>): boolean =>
    Object.keys({ ...themes, ...customThemes }).every((themeId) => themeId.toLowerCase() !== id.toLowerCase());

const parseFontWeight = (value: any): number | null => {
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;

        // Handle CSS keywords
        switch (value.toLowerCase()) {
            case 'light':
                return 300;
            case 'regular':
                return 400;
            case 'medium':
                return 500;
            case 'bold':
                return 700;
            default: // Fall through
        }
    }

    return null;
};

const extractFontWeightsFromObject = (obj: Record<string, any>): number[] =>
    Object.entries(obj)
        .filter(([key]) => key.startsWith('fontWeight'))
        .map(([, value]) => parseFontWeight(value))
        .filter((weight) => weight !== null);

const getFontsFromTheme = (
    obj: Record<string, any>,
    fonts: Record<string, Set<number>> = {},
): Record<string, Set<number>> => {
    const result = { ...fonts };

    for (const propertyName of Object.keys(obj)) {
        const propertyValue = obj[propertyName];
        const propertyType = typeof obj[propertyName];

        const isValidFontProperty = propertyName === 'fontFamily' && propertyType === 'string';
        if (isValidFontProperty) {
            const detectedFonts = propertyValue.split(',') as string[];
            const normalizedFonts = detectedFonts.map((detectedFont) => detectedFont.replace(/"/g, '').trim());

            const weights = extractFontWeightsFromObject(obj);

            normalizedFonts.forEach((font) => {
                result[font] = new Set([...(result[font] ?? []), ...weights].toSorted((a, b) => a - b));
            });

            // eslint-disable-next-line no-continue
            continue;
        }

        if (propertyType === 'object') {
            const nestedFonts = getFontsFromTheme(propertyValue, result);
            Object.entries(nestedFonts).forEach(([font, weights]) => {
                result[font] = new Set([...(result[font] ?? []), ...weights].toSorted((a, b) => a - b));
            });
        }
    }

    return result;
};

// https://developer.mozilla.org/en-US/docs/Web/CSS/generic-family
const GENERIC_FONT_FAMILIES = new Set([
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'math',
    'emoji',
    'fangsong',
]);

const usableFonts: Record<string, Set<number>> = {};

export const hasMissingFonts = (theme: CssVarsThemeOptions): boolean => {
    const fontWeightsMap = getFontsFromTheme(theme.typography ?? {});
    const fontNames = Object.keys(fontWeightsMap);

    return fontNames.some((fontName) => {
        if (GENERIC_FONT_FAMILIES.has(fontName.toLowerCase())) {
            return false;
        }

        const requiredWeights = fontWeightsMap[fontName];
        const usableWeights = usableFonts[fontName];

        if (!usableWeights) {
            return true;
        }

        return Array.from(requiredWeights).some((weight) => !usableWeights.has(weight));
    });
};

const isFontInstalled = async (fontName: string, weight: number | string): Promise<boolean> =>
    document.fonts.check(`${weight} 12px "${fontName}"`);

const getMissingFontWeights = async (
    fontWeightsMap: Record<string, Set<number>>,
): Promise<Record<string, Set<number>>> => {
    const pendingMissingFontWeightsEntries = Object.entries(fontWeightsMap).map(async ([fontName, requiredWeights]) => {
        if (GENERIC_FONT_FAMILIES.has(fontName.toLowerCase())) {
            return null;
        }

        const usableWeights = usableFonts[fontName] ?? new Set<number>();

        const weightChecks = await Promise.all(
            Array.from(requiredWeights).map(async (weight) => {
                if (usableWeights.has(weight)) {
                    return null;
                }

                if (!(await isFontInstalled(fontName, weight))) {
                    return null;
                }

                return weight;
            }),
        );

        const missingWeights = new Set(weightChecks.filter((weight) => weight !== null));
        if (!missingWeights.size) {
            return null;
        }

        return [fontName, missingWeights];
    });
    const missingFontWeightsEntries = await Promise.all(pendingMissingFontWeightsEntries);

    return Object.fromEntries(missingFontWeightsEntries.filter(Boolean) as [string, Set<number>][]);
};

export const loadThemeFonts = async (theme: CssVarsThemeOptions): Promise<void> => {
    const fontWeightsMap = getFontsFromTheme(theme.typography ?? {});

    const missingFontWeights = await getMissingFontWeights(fontWeightsMap);

    if (!Object.keys(missingFontWeights).length) {
        return;
    }

    // Transform to WebFont format: "Roboto:400,700"
    const webFontFamilies = Object.entries(missingFontWeights).map(([font, weights]) => {
        const weightsArray = Array.from(weights);

        if (!weightsArray.length) {
            return font;
        }

        return `${font}:${weightsArray.join(',')}`;
    });

    const loadFontsPromise = new ControlledPromise();
    try {
        WebFont.load({
            google: {
                families: webFontFamilies,
            },
            active: () => {
                Object.entries(missingFontWeights).forEach(([fontName, weights]) => {
                    usableFonts[fontName] ??= new Set();
                    weights.forEach((weight) => usableFonts[fontName].add(weight));
                });
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
