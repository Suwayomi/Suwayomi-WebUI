/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppContext from 'components/context/AppContext';
import DefaultNavBar from 'components/navbar/DefaultNavBar';
import React from 'react';
import { Redirect, Route, Routes } from 'react-router-dom';
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
import LibrarySettings from 'screens/settings/LibrarySettings';

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
            <Routes>
                {/* General Routes */}
                <Route path="/" element={<Redirect to="/library" />} />
                <Route path="settings/about" element={<About />} />
                <Route path="settings/categories" element={<Categories />} />
                <Route path="settings/defaultReaderSettings" element={<DefaultReaderSettings />} />
                <Route path="settings/librarySettings" element={<LibrarySettings />} />
                <Route path="settings/backup" element={<Backup />} />
                <Route path="settings" element={<Settings />} />

                {/* Manga Routes */}

                <Route path="sources/:sourceId" element={<SourceMangas />} />
                <Route path="sources/:sourceId/configure/" element={<SourceConfigure />} />
                <Route path="sources/all/search/" element={<SearchAll />} />
                <Route path="downloads" element={<DownloadQueue />} />
                <Route path="/manga/:mangaId/chapter/:chapterNum" />
                <Route path="manga/:id" element={<Manga />} />
                <Route path="library" element={<Library />} />
                <Route path="updates" element={<Updates />} />
                <Route path="sources" element={<Sources />} />
                <Route path="extensions" element={<Extensions />} />
                <Route path="browse" element={<Browse />} />
            </Routes>
        </Container>
        <Routes>
            <Route path="manga/:mangaId/chapter/:chapterIndex" element={<Reader />} />
        </Routes>
    </AppContext>
);

export default App;
