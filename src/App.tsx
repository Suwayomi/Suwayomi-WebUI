/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { AppContext } from '@/components/context/AppContext';
import '@/i18n';
import { DefaultNavBar } from '@/components/navbar/DefaultNavBar';
import { ServerUpdateChecker } from '@/components/settings/ServerUpdateChecker.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
// Lazy imports
const Browse = React.lazy(() => import('@/screens/Browse'));
const DownloadQueue = React.lazy(() => import('@/screens/DownloadQueue'));
const Extensions = React.lazy(() => import('@/screens/Extensions'));
const Library = React.lazy(() => import('@/screens/Library'));
const Manga = React.lazy(() => import('@/screens/Manga'));
const Reader = React.lazy(() => import('@/screens/Reader'));
const SearchAll = React.lazy(() => import('@/screens/SearchAll'));
const Settings = React.lazy(() => import('@/screens/Settings'));
const About = React.lazy(() => import('@/screens/settings/About'));
const Backup = React.lazy(() => import('@/screens/settings/Backup'));
const Categories = React.lazy(() => import('@/screens/settings/Categories'));
const DefaultReaderSettings = React.lazy(() => import('@/screens/settings/DefaultReaderSettings'));
const SourceConfigure = React.lazy(() => import('@/screens/SourceConfigure'));
const SourceMangas = React.lazy(() => import('@/screens/SourceMangas'));
const Sources = React.lazy(() => import('@/screens/Sources'));
const Updates = React.lazy(() => import('@/screens/Updates'));
const LibrarySettings = React.lazy(() => import('@/screens/settings/LibrarySettings'));
const DownloadSettings = React.lazy(() => import('@/screens/settings/DownloadSettings'));
const ServerSettings = React.lazy(() => import('@/screens/settings/ServerSettings'));
const BrowseSettings = React.lazy(() => import('@/screens/settings/BrowseSettings'));
const WebUISettings = React.lazy(() => import('@/screens/settings/WebUISettings'));
const Migrate = React.lazy(() => import('@/screens/Migrate'));
const DeviceSetting = React.lazy(() => import('@/components/settings/DeviceSetting.tsx'));
const TrackingSettings = React.lazy(() => import('@/screens/settings/TrackingSettings'));
const TrackerOAuthLogin = React.lazy(() => import('@/screens/TrackerOAuthLogin'));

if (process.env.NODE_ENV !== 'production') {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
}

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

/**
 * Creates permanent subscriptions to always have the latest data.
 *
 * E.g. in case a view is open, which does not subscribe to the download updates, finished downloads are never received
 * and thus, data of existing chapters/mangas in the cache get outdated
 */
const BackgroundSubscriptions = () => {
    requestManager.useDownloadSubscription();
    requestManager.useUpdaterSubscription();
    requestManager.useWebUIUpdateSubscription();

    return null;
};

export const App: React.FC = () => (
    <AppContext>
        <ScrollToTop />
        <ServerUpdateChecker />
        <BackgroundSubscriptions />
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
            <React.Suspense fallback={<LoadingPlaceholder />}>
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
                        <Route path="webUI" element={<WebUISettings />} />
                        <Route path="browseSettings" element={<BrowseSettings />} />
                        <Route path="device" element={<DeviceSetting />} />
                        <Route path="trackingSettings" element={<TrackingSettings />} />
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
                    <Route path="migrate/source/:sourceId">
                        <Route index element={<Migrate />} />
                        <Route path="manga/:mangaId/search" element={<SearchAll />} />
                    </Route>
                    <Route path="tracker/login/oauth" element={<TrackerOAuthLogin />} />
                </Routes>
            </React.Suspense>
        </Container>
        <Routes>
            <Route path="manga/:mangaId/chapter/:chapterIndex" element={<Reader />} />
            <Route path="*" element={null} />
        </Routes>
    </AppContext>
);
