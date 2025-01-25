/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Direction, ThemeProvider, useColorScheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { AppThemeContext, ThemeMode } from '@/modules/theme/contexts/AppThemeContext.tsx';
import { DIRECTION_TO_CACHE } from '@/modules/theme/ThemeDirectionCache.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { AppThemes, getTheme } from '@/modules/theme/services/AppThemes.ts';
import { createAndSetTheme } from '@/modules/theme/services/ThemeCreator.ts';

export const AppThemeContextProvider = ({ children }: { children: ReactNode }) => {
    const { i18n } = useTranslation();
    const { mode } = useColorScheme();
    const {
        settings: { customThemes },
    } = useMetadataServerSettings();
    const [appTheme, setAppTheme] = useLocalStorage<AppThemes>('appTheme', 'default');
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', ThemeMode.SYSTEM);
    const [pureBlackMode, setPureBlackMode] = useLocalStorage<boolean>('pureBlackMode', false);

    const directionRef = useRef<Direction>('ltr');

    const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(MediaQuery.getSystemThemeMode());

    const actualThemeMode = mode ?? themeMode ?? 'dark';
    const currentDirection = i18n.dir();

    const appThemeContext = useMemo(
        () => ({
            appTheme,
            setAppTheme,
            themeMode,
            setThemeMode,
            pureBlackMode,
            setPureBlackMode,
        }),
        [themeMode, pureBlackMode, appTheme],
    );

    const theme = useMemo(
        () =>
            createAndSetTheme(
                actualThemeMode as ThemeMode,
                getTheme(appTheme, customThemes),
                pureBlackMode,
                currentDirection,
            ),
        [actualThemeMode, currentDirection, systemThemeMode, pureBlackMode, appTheme, customThemes],
    );

    useLayoutEffect(() => {
        const unsubscribe = MediaQuery.listenToSystemThemeChange(setSystemThemeMode);

        return () => unsubscribe();
    }, []);

    if (directionRef.current !== currentDirection) {
        document.dir = currentDirection;
        directionRef.current = currentDirection;
    }

    return (
        <AppThemeContext.Provider value={appThemeContext}>
            <CacheProvider value={DIRECTION_TO_CACHE[currentDirection]}>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </CacheProvider>
        </AppThemeContext.Provider>
    );
};
