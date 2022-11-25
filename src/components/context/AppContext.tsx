/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    StyledEngineProvider, ThemeProvider,
} from '@mui/material/styles';
import LibraryOptionsContextProvider from 'components/library/LibraryOptionsProvider';
import NavBarContextProvider from 'components/navbar/NavBarContextProvider';
import React, { useMemo } from 'react';
import {
    BrowserRouter as Router, Route,
} from 'react-router-dom';
import { SWRConfig } from 'swr';
import createTheme from 'theme';
import { QueryParamProvider } from 'use-query-params';
import { fetcher } from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import DarkTheme from './DarkTheme';

interface Props {
    children: React.ReactNode
}

const AppContext: React.FC<Props> = ({ children }) => {
    const [darkTheme, setDarkTheme] = useLocalStorage<boolean>(
        'darkTheme',
        true,
    );

    const darkThemeContext = useMemo(() => ({
        darkTheme,
        setDarkTheme,
    }), [darkTheme]);

    const theme = useMemo(
        () => createTheme(darkTheme),
        [darkTheme],
    );

    return (
        <SWRConfig value={{ fetcher }}>
            <Router>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        <DarkTheme.Provider value={darkThemeContext}>
                            <QueryParamProvider ReactRouterRoute={Route}>
                                <LibraryOptionsContextProvider>
                                    <NavBarContextProvider>
                                        {children}
                                    </NavBarContextProvider>
                                </LibraryOptionsContextProvider>
                            </QueryParamProvider>
                        </DarkTheme.Provider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </Router>
        </SWRConfig>
    );
};

export default AppContext;
