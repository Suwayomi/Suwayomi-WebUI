/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppContext from 'components/context/AppContext';
import DefaultNavBar from 'components/navbar/DefaultNavBar';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Browse from 'screens/Browse';
import DownloadQueue from 'screens/DownloadQueue';
import Extensions from 'screens/Extensions';
import Library from 'screens/Library';
import Manga from 'screens/Manga';
import Reader from 'screens/Reader';
import SearchAll from 'screens/SearchAll';
import Settings from 'screens/Settings';
import About from 'screens/settings/About';
import Backup from 'screens/settings/Backup';
import Categories from 'screens/settings/Categories';
import DefaultReaderSettings from 'screens/settings/DefaultReaderSettings';
import SourceConfigure from 'screens/SourceConfigure';
import SourceMangas from 'screens/SourceMangas';
import Sources from 'screens/Sources';
import Updates from 'screens/Updates';
import 'i18n';

const App: React.FC = () => (
    <AppContext>
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
                <Route exact path="/" render={() => <Redirect to="/library" />} />
                <Route path="/settings/about">
                    <About />
                </Route>
                <Route path="/settings/categories">
                    <Categories />
                </Route>
                <Route path="/settings/defaultReaderSettings">
                    <DefaultReaderSettings />
                </Route>
                <Route path="/settings/backup">
                    <Backup />
                </Route>
                <Route path="/settings">
                    <Settings />
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
                <Route path="/sources/all/search/">
                    <SearchAll />
                </Route>
                <Route path="/downloads">
                    <DownloadQueue />
                </Route>
                <Route path="/manga/:mangaId/chapter/:chapterNum" />
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
                // passing a key re-mounts the reader
                // when changing chapters
                render={(props: any) => <Reader key={props.match.params.chapterIndex} />}
            />
        </Switch>
    </AppContext>
);

export default App;
