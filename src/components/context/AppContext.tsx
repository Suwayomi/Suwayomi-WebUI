/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Direction, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import React, { useMemo, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { useTranslation } from 'react-i18next';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { createTheme } from '@/theme';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { DarkTheme } from '@/components/context/DarkTheme';
import { NavBarContextProvider } from '@/components/navbar/NavBarContextProvider';
import { LibraryOptionsContextProvider } from '@/components/library/LibraryOptionsProvider';
import { ActiveDevice, DEFAULT_DEVICE, setActiveDevice } from '@/util/device.ts';

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

    const [darkTheme, setDarkTheme] = useLocalStorage<boolean>('darkTheme', true);
    const [activeDevice, setActiveDeviceContext] = useLocalStorage('activeDevice', DEFAULT_DEVICE);

    const darkThemeContext = useMemo(
        () => ({
            darkTheme,
            setDarkTheme,
        }),
        [darkTheme],
    );

    const activeDeviceContext = useMemo(
        () => ({ activeDevice, setActiveDevice: setActiveDeviceContext }),
        [activeDevice],
    );

    const theme = useMemo(() => createTheme(darkTheme, currentDirection), [darkTheme, currentDirection]);

    setActiveDevice(activeDevice);

    return (
        <Router>
            <StyledEngineProvider injectFirst>
                <CacheProvider value={directionToCache[currentDirection]}>
                    <ThemeProvider theme={theme}>
                        <DarkTheme.Provider value={darkThemeContext}>
                            <QueryParamProvider adapter={ReactRouter6Adapter}>
                                <LibraryOptionsContextProvider>
                                    <NavBarContextProvider>
                                        <ActiveDevice.Provider value={activeDeviceContext}>
                                            {children}
                                        </ActiveDevice.Provider>
                                    </NavBarContextProvider>
                                </LibraryOptionsContextProvider>
                            </QueryParamProvider>
                        </DarkTheme.Provider>
                    </ThemeProvider>
                </CacheProvider>
            </StyledEngineProvider>
        </Router>
    );
};
