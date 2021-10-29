/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import {
    BrowserRouter as Router, Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { Container, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {
    createTheme, ThemeProvider, Theme, StyledEngineProvider,
} from '@mui/material/styles';
import NavBar from 'components/navbar/NavBar';
import NavbarContext from 'context/NavbarContext';
import DarkTheme from 'context/DarkTheme';
import useLocalStorage from 'util/useLocalStorage';
import Settings from 'screens/Settings';
import About from 'screens/settings/About';
import Categories from 'screens/settings/Categories';
import Backup from 'screens/settings/Backup';
import Library from 'screens/manga/Library';
import SearchSingle from 'screens/manga/SearchSingle';
import SourceConfigure from 'screens/manga/SourceConfigure';
import Manga from 'screens/manga/Manga';
import SourceMangas from 'screens/manga/SourceMangas';
import Reader from 'screens/manga/Reader';
import Updates from 'screens/manga/Updates';
import DownloadQueue from 'screens/manga/DownloadQueue';
import Browse from 'screens/manga/Browse';

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}

export default function App() {
    const [title, setTitle] = useState<string>('Tachidesk');
    const [action, setAction] = useState<any>(<div />);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });

    const [darkTheme, setDarkTheme] = useLocalStorage<boolean>('darkTheme', true);

    const navBarContext = {
        title,
        setTitle,
        action,
        setAction,
        override,
        setOverride,
    };
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
    // this can only be used after the theme object is created
    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Router>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <QueryParamProvider ReactRouterRoute={Route}>
                        <NavbarContext.Provider value={navBarContext}>
                            <CssBaseline />
                            <NavBar />
                            <Container
                                id="appMainContainer"
                                maxWidth={false}
                                disableGutters
                                style={{
                                    marginTop: theme.spacing(8),
                                    marginLeft: isMobileWidth ? '' : theme.spacing(8),
                                    marginBottom: isMobileWidth ? theme.spacing(8) : '',
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
                                        <DarkTheme.Provider value={darkThemeContext}>
                                            <Settings />
                                        </DarkTheme.Provider>
                                    </Route>

                                    {/* Manga Routes */}

                                    <Route path="/sources/:sourceId/search/">
                                        <SearchSingle />
                                    </Route>
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
                                    <Route path="/browse">
                                        <Browse />
                                    </Route>
                                </Switch>
                            </Container>
                            <Switch>
                                <Route
                                    path="/manga/:mangaId/chapter/:chapterIndex"
                                    // passing a key re-mounts the reader when changing chapters
                                    render={
                                        (props: any) => (
                                            <Reader
                                                key={props.match.params.chapterIndex}
                                            />
                                        )
                                    }
                                />
                            </Switch>
                        </NavbarContext.Provider>
                    </QueryParamProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </Router>
    );
}
