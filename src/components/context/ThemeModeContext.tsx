/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';

export enum ThemeMode {
    SYSTEM = 'system',
    DARK = 'dark',
    LIGHT = 'light',
}

type ContextType = {
    themeMode: ThemeMode;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
    pureBlackMode: boolean;
    setPureBlackMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ThemeModeContext = React.createContext<ContextType>({
    themeMode: ThemeMode.SYSTEM,
    setThemeMode: (): void => {},
    pureBlackMode: false,
    setPureBlackMode: (): void => {},
});
