/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Direction, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { useTranslation } from 'react-i18next';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { SnackbarProvider } from 'notistack';
import { createAndSetTheme } from '@/theme.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { ThemeMode, ThemeModeContext } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { NavBarContextProvider } from '@/modules/navigation-bar/contexts/NavBarContextProvider.tsx';
import { LibraryOptionsContextProvider } from '@/modules/library/contexts/LibraryOptionsProvider.tsx';
import { ActiveDeviceContextProvider } from '@/modules/device/contexts/DeviceContext.tsx';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';
import { AppThemes, getTheme } from '@/modules/theme/services/AppThemes.ts';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';

interface Props {
    children: React.ReactNode;
}

const directionToCache: Record<Direction, EmotionCache> = {
    ltr: createCache({
        key: 'muiltr',
    }),
    rtl: createCache({
        key: 'muirtl',
        stylisPlugins: [prefixer, rtlPlugin],
    }),
};

export const AppContext: React.FC<Props> = ({ children }) => {
    const directionRef = useRef<Direction>('ltr');
    const { i18n } = useTranslation();

    const currentDirection = i18n.dir();

    if (directionRef.current !== currentDirection) {
        document.dir = currentDirection;
        directionRef.current = currentDirection;
    }

    const {
        settings: { customThemes },
    } = useMetadataServerSettings();

    const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(MediaQuery.getSystemThemeMode());
    useLayoutEffect(() => {
        const unsubscribe = MediaQuery.listenToSystemThemeChange(setSystemThemeMode);

        return () => unsubscribe();
    }, []);

    const [appTheme, setAppTheme] = useLocalStorage<AppThemes>('appTheme', 'default');
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', ThemeMode.SYSTEM);
    const [pureBlackMode, setPureBlackMode] = useLocalStorage<boolean>('pureBlackMode', false);

    const darkThemeContext = useMemo(
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
        () => createAndSetTheme(themeMode, getTheme(appTheme, customThemes), pureBlackMode, currentDirection),
        [themeMode, currentDirection, systemThemeMode, pureBlackMode, appTheme, customThemes],
    );

    return (
        <Router>
            <StyledEngineProvider injectFirst>
                <CacheProvider value={directionToCache[currentDirection]}>
                    <ThemeProvider theme={theme}>
                        <ThemeModeContext.Provider value={darkThemeContext}>
                            <QueryParamProvider adapter={ReactRouter6Adapter}>
                                <LibraryOptionsContextProvider>
                                    <NavBarContextProvider>
                                        <ActiveDeviceContextProvider>
                                            <SnackbarProvider>{children}</SnackbarProvider>
                                        </ActiveDeviceContextProvider>
                                    </NavBarContextProvider>
                                </LibraryOptionsContextProvider>
                            </QueryParamProvider>
                        </ThemeModeContext.Provider>
                    </ThemeProvider>
                </CacheProvider>
            </StyledEngineProvider>
        </Router>
    );
};
