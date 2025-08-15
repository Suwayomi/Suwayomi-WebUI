/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import { Palette } from '@vibrant/color';
import { FastAverageColorResult } from 'fast-average-color';
import { AppThemes } from '@/features/theme/services/AppThemes.ts';

export enum ThemeMode {
    SYSTEM = 'system',
    DARK = 'dark',
    LIGHT = 'light',
}

export type TAppThemeContext = {
    appTheme: AppThemes;
    setAppTheme: (theme: AppThemes) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    shouldUsePureBlackMode: boolean;
    setShouldUsePureBlackMode: (value: boolean) => void;
    dynamicColor: (NonNullableProperties<Palette> & { average: FastAverageColorResult }) | null;
    setDynamicColor: React.Dispatch<
        React.SetStateAction<(NonNullableProperties<Palette> & { average: FastAverageColorResult }) | null>
    >;
};

export const AppThemeContext = React.createContext<TAppThemeContext>({
    appTheme: 'default',
    setAppTheme: (): void => {},
    themeMode: ThemeMode.SYSTEM,
    setThemeMode: (): void => {},
    shouldUsePureBlackMode: false,
    setShouldUsePureBlackMode: (): void => {},
    dynamicColor: null,
    setDynamicColor: (): void => {},
});

export const useAppThemeContext = () => useContext(AppThemeContext);
