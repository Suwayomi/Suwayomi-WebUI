/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CssBaseline from '@mui/material/CssBaseline';
import React, { useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { loadable } from 'react-lazily/loadable';
import Box from '@mui/material/Box';
import { AppContext } from '@/modules/core/contexts/AppContext.tsx';
import '@/i18n';
import { DefaultNavBar } from '@/modules/navigation-bar/components/DefaultNavBar.tsx';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { WebUIUpdateChecker } from '@/modules/app-updates/components/WebUIUpdateChecker.tsx';
import { ServerUpdateChecker } from '@/modules/app-updates/components/ServerUpdateChecker.tsx';
import { lazyLoadFallback } from '@/modules/core/utils/LazyLoad.tsx';
import { ErrorBoundary } from '@/modules/core/components/ErrorBoundary.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

const { Browse } = loadable(() => import('@/modules/browse/screens/Browse.tsx'), lazyLoadFallback);
const { DownloadQueue } = loadable(() => import('@/modules/downloads/screens/DownloadQueue.tsx'), lazyLoadFallback);
const { Library } = loadable(() => import('@/modules/library/screens/Library.tsx'), lazyLoadFallback);
const { Manga } = loadable(() => import('@/modules/manga/screens/Manga.tsx'), lazyLoadFallback);
const { Reader } = loadable(() => import('@/modules/reader/screens/Reader.tsx'), lazyLoadFallback);
const { SearchAll } = loadable(() => import('@/modules/global-search/screens/SearchAll.tsx'), lazyLoadFallback);
const { Settings } = loadable(() => import('@/modules/settings/screens/Settings.tsx'), lazyLoadFallback);
const { About } = loadable(() => import('@/modules/settings/screens/About.tsx'), lazyLoadFallback);
const { Backup } = loadable(() => import('@/modules/backup/screens/Backup.tsx'), lazyLoadFallback);
const { CategorySettings } = loadable(
    () => import('@/modules/category/screens/CategorySettings.tsx'),
    lazyLoadFallback,
);
const { DefaultReaderSettings } = loadable(
    () => import('@/modules/reader/screens/DefaultReaderSettings.tsx'),
    lazyLoadFallback,
);
const { SourceConfigure } = loadable(() => import('@/modules/source/screens/SourceConfigure.tsx'), lazyLoadFallback);
const { SourceMangas } = loadable(() => import('@/modules/source/screens/SourceMangas.tsx'), lazyLoadFallback);
const { Updates } = loadable(() => import('@/modules/updates/screens/Updates.tsx'), lazyLoadFallback);
const { LibrarySettings } = loadable(() => import('@/modules/library/screens/LibrarySettings.tsx'), lazyLoadFallback);
const { DownloadSettings } = loadable(
    () => import('@/modules/downloads/screens/DownloadSettings.tsx'),
    lazyLoadFallback,
);
const { ServerSettings } = loadable(() => import('@/modules/settings/screens/ServerSettings.tsx'), lazyLoadFallback);
const { BrowseSettings } = loadable(() => import('@/modules/browse/screens/BrowseSettings.tsx'), lazyLoadFallback);
const { WebUISettings } = loadable(() => import('@/modules/settings/screens/WebUISettings.tsx'), lazyLoadFallback);
const { Migrate } = loadable(() => import('@/modules/migration/screens/Migrate.tsx'), lazyLoadFallback);
const { DeviceSetting } = loadable(() => import('@/modules/device/screens/DeviceSetting.tsx'), lazyLoadFallback);
const { TrackingSettings } = loadable(() => import('@/modules/tracker/screens/TrackingSettings.tsx'), lazyLoadFallback);
const { TrackerOAuthLogin } = loadable(
    () => import('@/modules/tracker/screens/TrackerOAuthLogin.tsx'),
    lazyLoadFallback,
);
const { LibraryDuplicates } = loadable(
    () => import('@/modules/library/screens/LibraryDuplicates.tsx'),
    lazyLoadFallback,
);
const { Appearance } = loadable(() => import('@/modules/settings/screens/Appearance.tsx'), lazyLoadFallback);

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

const MainApp = () => {
    const { navBarWidth, appBarHeight, bottomBarHeight } = useNavBarContext();

    return (
        <Box
            id="appMainContainer"
            component="main"
            sx={{
                minHeight: `calc(100vh - ${appBarHeight + bottomBarHeight}px)`,
                width: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                minWidth: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                maxWidth: `calc(100vw - (100vw - 100%) - ${navBarWidth}px)`,
                position: 'relative',
                mt: `${appBarHeight}px`,
                mb: `${bottomBarHeight}px`,
            }}
        >
            <ErrorBoundary>
                <Routes>
                    {/* General Routes */}
                    <Route path="/" element={<Navigate to="/library" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="settings">
                        <Route index element={<Settings />} />
                        <Route path="about" element={<About />} />
                        <Route path="categories" element={<CategorySettings />} />
                        <Route path="defaultReaderSettings" element={<DefaultReaderSettings />} />
                        <Route path="librarySettings">
                            <Route index element={<LibrarySettings />} />
                            <Route path="duplicates" element={<LibraryDuplicates />} />
                        </Route>
                        <Route path="downloadSettings" element={<DownloadSettings />} />
                        <Route path="backup" element={<Backup />} />
                        <Route path="server" element={<ServerSettings />} />
                        <Route path="webUI" element={<WebUISettings />} />
                        <Route path="browseSettings" element={<BrowseSettings />} />
                        <Route path="device" element={<DeviceSetting />} />
                        <Route path="trackingSettings" element={<TrackingSettings />} />
                        <Route path="appearance" element={<Appearance />} />
                    </Route>

                    {/* Manga Routes */}

                    <Route path="sources">
                        <Route index element={<Navigate to="/" replace />} />
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
                    <Route path="browse" element={<Browse />} />
                    <Route path="migrate/source/:sourceId">
                        <Route index element={<Migrate />} />
                        <Route path="manga/:mangaId/search" element={<SearchAll />} />
                    </Route>
                    <Route path="tracker/login/oauth" element={<TrackerOAuthLogin />} />
                </Routes>
            </ErrorBoundary>
        </Box>
    );
};

const ReaderApp = () => (
    <ErrorBoundary>
        <Routes>
            <Route path="manga/:mangaId/chapter/:chapterIndex" element={<Reader />} />
            <Route path="*" element={null} />
        </Routes>
    </ErrorBoundary>
);

export const App: React.FC = () => (
    <AppContext>
        <ScrollToTop />
        <ServerUpdateChecker />
        <WebUIUpdateChecker />
        <BackgroundSubscriptions />
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ flexShrink: 0 }}>
                <DefaultNavBar />
            </Box>
            <MainApp />
            <ReaderApp />
        </Box>
    </AppContext>
);
