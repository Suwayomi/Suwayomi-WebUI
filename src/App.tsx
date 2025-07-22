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
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { WebUIUpdateChecker } from '@/modules/app-updates/components/WebUIUpdateChecker.tsx';
import { ServerUpdateChecker } from '@/modules/app-updates/components/ServerUpdateChecker.tsx';
import { lazyLoadFallback } from '@/modules/core/utils/LazyLoad.tsx';
import { ErrorBoundary } from '@/modules/core/components/feedback/ErrorBoundary.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';

import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { BrowseTab } from '@/modules/browse/Browse.types.ts';

const { Browse } = loadable(() => import('@/modules/browse/screens/Browse.tsx'), lazyLoadFallback);
const { DownloadQueue } = loadable(() => import('@/modules/downloads/screens/DownloadQueue.tsx'), lazyLoadFallback);
const { Library } = loadable(() => import('@/modules/library/screens/Library.tsx'), lazyLoadFallback);
const { Manga } = loadable(() => import('@/modules/manga/screens/Manga.tsx'), lazyLoadFallback);
const { SearchAll } = loadable(() => import('@/modules/global-search/screens/SearchAll.tsx'), lazyLoadFallback);
const { Settings } = loadable(() => import('@/modules/settings/screens/Settings.tsx'), lazyLoadFallback);
const { About } = loadable(() => import('@/modules/settings/screens/About.tsx'), lazyLoadFallback);
const { Backup } = loadable(() => import('@/modules/backup/screens/Backup.tsx'), lazyLoadFallback);
const { CategorySettings } = loadable(
    () => import('@/modules/category/screens/CategorySettings.tsx'),
    lazyLoadFallback,
);
const { SourceConfigure } = loadable(() => import('@/modules/source/screens/SourceConfigure.tsx'), lazyLoadFallback);
const { SourceMangas } = loadable(() => import('@/modules/source/screens/SourceMangas.tsx'), lazyLoadFallback);
const { ExtensionInfo } = loadable(() => import('@/modules/extension/screens/ExtensionInfo.tsx'), lazyLoadFallback);
const { Updates } = loadable(() => import('@/modules/updates/screens/Updates.tsx'), lazyLoadFallback);
const { History } = loadable(() => import('@/modules/history/screens/History.tsx'), lazyLoadFallback);
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
const { GlobalReaderSettings } = loadable(
    () => import('@/modules/reader/screens/GlobalReaderSettings.tsx'),
    lazyLoadFallback,
);
const { More } = loadable(() => import('@/modules/settings/screens/More.tsx'), lazyLoadFallback);
const { Reader } = loadable(() => import('@/modules/reader/screens/Reader.tsx'), lazyLoadFallback);
const { HistorySettings } = loadable(() => import('@/modules/history/screens/HistorySettings.tsx'), lazyLoadFallback);

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
    // load the full download status once on startup to fill the cache
    requestManager.useGetDownloadStatus({ nextFetchPolicy: 'standby' });
    requestManager.useDownloadSubscription();
    requestManager.useUpdaterSubscription();
    requestManager.useWebUIUpdateSubscription();

    return null;
};

const MainApp = () => {
    const { navBarWidth, appBarHeight, bottomBarHeight } = useNavBarContext();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const {
        settings: { hideHistory },
    } = useMetadataServerSettings();

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
                pb: `calc(${bottomBarHeight}px + ${!bottomBarHeight ? 'env(safe-area-inset-bottom)' : '0px'})`,
                pr: 'env(safe-area-inset-right)',
            }}
        >
            <ErrorBoundary>
                <Routes>
                    {/* General Routes */}
                    <Route path={AppRoutes.root.match} element={<Navigate to={AppRoutes.library.path()} replace />} />
                    <Route path={AppRoutes.matchAll.match} element={<Navigate to={AppRoutes.root.path} replace />} />
                    {isMobileWidth && <Route path={AppRoutes.more.match} element={<More />} />}
                    <Route path={AppRoutes.about.match} element={<About />} />
                    <Route path={AppRoutes.settings.match}>
                        <Route index element={<Settings />} />
                        <Route path={AppRoutes.settings.childRoutes.categories.match} element={<CategorySettings />} />
                        <Route path={AppRoutes.settings.childRoutes.reader.match} element={<GlobalReaderSettings />} />
                        <Route path={AppRoutes.settings.childRoutes.library.match}>
                            <Route index element={<LibrarySettings />} />
                            <Route
                                path={AppRoutes.settings.childRoutes.library.childRoutes.duplicates.match}
                                element={<LibraryDuplicates />}
                            />
                        </Route>
                        <Route path={AppRoutes.settings.childRoutes.download.match} element={<DownloadSettings />} />
                        <Route path={AppRoutes.settings.childRoutes.backup.match} element={<Backup />} />
                        <Route path={AppRoutes.settings.childRoutes.server.match} element={<ServerSettings />} />
                        <Route path={AppRoutes.settings.childRoutes.webui.match} element={<WebUISettings />} />
                        <Route path={AppRoutes.settings.childRoutes.browse.match} element={<BrowseSettings />} />
                        <Route path={AppRoutes.settings.childRoutes.history.match} element={<HistorySettings />} />
                        <Route path={AppRoutes.settings.childRoutes.device.match} element={<DeviceSetting />} />
                        <Route path={AppRoutes.settings.childRoutes.tracking.match} element={<TrackingSettings />} />
                        <Route path={AppRoutes.settings.childRoutes.appearance.match} element={<Appearance />} />
                    </Route>

                    {/* Manga Routes */}

                    <Route path={AppRoutes.sources.match}>
                        {/* TODO: deprecated - "source" and "extension" page got merged into "browse" */}
                        <Route index element={<Navigate to={AppRoutes.browse.path(BrowseTab.SOURCES)} replace />} />
                        <Route path={AppRoutes.sources.childRoutes.browse.match} element={<SourceMangas />} />
                        <Route path={AppRoutes.sources.childRoutes.configure.match} element={<SourceConfigure />} />
                        <Route path={AppRoutes.sources.childRoutes.searchAll.match} element={<SearchAll />} />
                    </Route>
                    <Route path={AppRoutes.extension.match}>
                        <Route index element={<Navigate to={AppRoutes.browse.path(BrowseTab.EXTENSIONS)} replace />} />
                        <Route path={AppRoutes.extension.childRoutes.info.match} element={<ExtensionInfo />} />
                    </Route>
                    <Route path={AppRoutes.downloads.match} element={<DownloadQueue />} />
                    <Route path={AppRoutes.manga.match}>
                        <Route path={AppRoutes.manga.childRoutes.reader.match} element={null} />
                        <Route index element={<Manga />} />
                    </Route>
                    <Route path={AppRoutes.library.match} element={<Library />} />
                    <Route path={AppRoutes.updates.match} element={<Updates />} />
                    {!hideHistory && <Route path={AppRoutes.history.match} element={<History />} />}
                    <Route path={AppRoutes.browse.match} element={<Browse />} />
                    <Route path={AppRoutes.migrate.match}>
                        <Route index element={<Migrate />} />
                        <Route path={AppRoutes.migrate.childRoutes.search.match} element={<SearchAll />} />
                    </Route>
                    <Route path={AppRoutes.tracker.match} element={<TrackerOAuthLogin />} />
                </Routes>
            </ErrorBoundary>
        </Box>
    );
};

const ReaderApp = () => (
    <ErrorBoundary>
        <Routes>
            <Route path={AppRoutes.matchAll.match} element={<Reader />} />
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
            <Box sx={{ flexShrink: 0, position: 'relative', height: '100vh' }}>
                <DefaultNavBar />
            </Box>
            <Routes>
                <Route path={AppRoutes.matchAll.match} element={<MainApp />} />
                <Route path={AppRoutes.reader.match} element={<ReaderApp />} />
            </Routes>
        </Box>
    </AppContext>
);
