/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {
    createTheme,
    ThemeProvider,
    Theme,
    StyledEngineProvider,
} from '@mui/material/styles';
import DefaultNavBar from 'components/navbar/DefaultNavBar';
import DarkTheme from 'components/context/DarkTheme';
import useLocalStorage from 'util/useLocalStorage';
import Settings from 'screens/Settings';
import About from 'screens/settings/About';
import Categories from 'screens/settings/Categories';
import Backup from 'screens/settings/Backup';
import Library from 'screens/Library';
import SourceConfigure from 'screens/SourceConfigure';
import Manga from 'screens/Manga';
import SourceMangas from 'screens/SourceMangas';
import Reader from 'screens/Reader';
import Updates from 'screens/Updates';
import DownloadQueue from 'screens/DownloadQueue';
import Browse from 'screens/Browse';
import Sources from 'screens/Sources';
import Extensions from 'screens/Extensions';
import NavBarContextProvider from 'components/navbar/NavBarContextProvider';
import LibraryOptionsContextProvider from 'components/library/LibraryOptionsProvider';

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

export default function App() {
    const [darkTheme, setDarkTheme] = useLocalStorage<boolean>(
        'darkTheme',
        true,
    );

    const darkThemeContext = {
        darkTheme,
        setDarkTheme,
    };

    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode: darkTheme ? 'dark' : 'light',
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: `
                        *::-webkit-scrollbar {
                            width: 10px;
                            background: ${darkTheme ? '#222' : '#e1e1e1'};   
                        }
                        
                        *::-webkit-scrollbar-thumb {
                            background: ${darkTheme ? '#111' : '#aaa'};
                            border-radius: 5px;
                        }
                    `,
                },
            },
        }),
        [darkTheme],
    );

    return (
        <Router>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <QueryParamProvider ReactRouterRoute={Route}>
                        <LibraryOptionsContextProvider>
                            <NavBarContextProvider>
                                <CssBaseline />
                                <DefaultNavBar />
                                <Container
                                    id="appMainContainer"
                                    maxWidth={false}
                                    disableGutters
                                    sx={{
                                        mt: 8,
                                        ml: { sm: 8 },
                                        mb: { xs: 8, sm: 0 },
                                        width: 'auto',
                                        overflow: 'auto',
                                    }}
                                >
                                    <Switch>
                                        {/* General Routes */}
                                        <Route
                                            exact
                                            path="/"
                                            render={() => (
                                                <Redirect to="/library" />
                                            )}
                                        />
                                        <Route path="/settings/about">
                                            <About />
                                        </Route>
                                        <Route path="/settings/categories">
                                            <Categories />
                                        </Route>
                                        <Route path="/settings/backup">
                                            <Backup />
                                        </Route>
                                        <Route path="/settings">
                                            <DarkTheme.Provider
                                                value={darkThemeContext}
                                            >
                                                <Settings />
                                            </DarkTheme.Provider>
                                        </Route>

                                        {/* Manga Routes */}

                                        <Route path="/sources/:sourceId/popular/">
                                            <SourceMangas popular />
                                        </Route>
                                        <Route path="/sources/:sourceId/latest/">
                                            <SourceMangas popular={false} />
                                        </Route>
                                        <Route path="/sources/:sourceId/configure/">
                                            <SourceConfigure />
                                        </Route>
                                        <Route path="/downloads">
                                            <DownloadQueue />
                                        </Route>
                                        <Route path="/manga/:mangaId/chapter/:chapterNum">
                                            <></>
                                        </Route>
                                        <Route path="/manga/:id">
                                            <Manga />
                                        </Route>
                                        <Route path="/library">
                                            <Library />
                                        </Route>
                                        <Route path="/updates">
                                            <Updates />
                                        </Route>
                                        <Route path="/sources">
                                            <Sources />
                                        </Route>
                                        <Route path="/extensions">
                                            <Extensions />
                                        </Route>
                                        <Route path="/browse">
                                            <Browse />
                                        </Route>
                                    </Switch>
                                </Container>
                                <Switch>
                                    <Route
                                        path="/manga/:mangaId/chapter/:chapterIndex"
                                        // passing a key re-mounts the reader when changing chapters
                                        render={(props: any) => (
                                            <Reader
                                                key={
                                                    props.match.params
                                                        .chapterIndex
                                                }
                                            />
                                        )}
                                    />
                                </Switch>
                            </NavBarContextProvider>
                        </LibraryOptionsContextProvider>
                    </QueryParamProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </Router>
    );
}
