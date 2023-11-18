/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { __DEV__ } from '@apollo/client/utilities/globals';
import { AppContext } from '@/components/context/AppContext';
import { Browse } from '@/screens/Browse';
import { DownloadQueue } from '@/screens/DownloadQueue';
import { Extensions } from '@/screens/Extensions';
import { Library } from '@/screens/Library';
import { Manga } from '@/screens/Manga';
import { Reader } from '@/screens/Reader';
import { SearchAll } from '@/screens/SearchAll';
import { Settings } from '@/screens/Settings';
import { About } from '@/screens/settings/About';
import { Backup } from '@/screens/settings/Backup';
import { Categories } from '@/screens/settings/Categories';
import { DefaultReaderSettings } from '@/screens/settings/DefaultReaderSettings';
import { SourceConfigure } from '@/screens/SourceConfigure';
import { SourceMangas } from '@/screens/SourceMangas';
import { Sources } from '@/screens/Sources';
import { Updates } from '@/screens/Updates';
import '@/i18n';
import { LibrarySettings } from '@/screens/settings/LibrarySettings';
import { DefaultNavBar } from '@/components/navbar/DefaultNavBar';
import { DownloadSettings } from '@/screens/settings/DownloadSettings.tsx';
import { ServerSettings } from '@/screens/settings/ServerSettings.tsx';

if (__DEV__) {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
}
export const App: React.FC = () => (
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
                <Route path="/" element={<Navigate to="/library" replace />} />
                <Route path="settings">
                    <Route index element={<Settings />} />
                    <Route path="about" element={<About />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="defaultReaderSettings" element={<DefaultReaderSettings />} />
                    <Route path="librarySettings" element={<LibrarySettings />} />
                    <Route path="downloadSettings" element={<DownloadSettings />} />
                    <Route path="backup" element={<Backup />} />
                    <Route path="server" element={<ServerSettings />} />
                </Route>

                {/* Manga Routes */}

                <Route path="sources">
                    <Route index element={<Sources />} />
                    <Route path=":sourceId" element={<SourceMangas />} />
                    <Route path=":sourceId/configure/" element={<SourceConfigure />} />
                    <Route path="all/search/" element={<SearchAll />} />
                </Route>
                <Route path="downloads" element={<DownloadQueue />} />
                <Route path="manga/:id">
                    <Route path="chapter/:chapterNum" element={null} />
                    <Route index element={<Manga />} />
                </Route>
                <Route path="library" element={<Library />} />
                <Route path="updates" element={<Updates />} />
                <Route path="extensions" element={<Extensions />} />
                <Route path="browse" element={<Browse />} />
            </Routes>
        </Container>
        <Routes>
            <Route path="manga/:mangaId/chapter/:chapterIndex" element={<Reader />} />
            <Route path="*" element={null} />
        </Routes>
    </AppContext>
);
