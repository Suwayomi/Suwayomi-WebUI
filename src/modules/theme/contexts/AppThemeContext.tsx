/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { AppThemes } from '@/modules/theme/services/AppThemes.ts';

export enum ThemeMode {
    SYSTEM = 'system',
    DARK = 'dark',
    LIGHT = 'light',
}

export type TAppThemeContext = {
    appTheme: AppThemes;
    setAppTheme: React.Dispatch<React.SetStateAction<AppThemes>>;
    themeMode: ThemeMode;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
    pureBlackMode: boolean;
    setPureBlackMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppThemeContext = React.createContext<TAppThemeContext>({
    appTheme: 'default',
    setAppTheme: (): void => {},
    themeMode: ThemeMode.SYSTEM,
    setThemeMode: (): void => {},
    pureBlackMode: false,
    setPureBlackMode: (): void => {},
});
