/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CssBaseline from '@mui/material/CssBaseline';
import type { PropsWithChildren, ReactNode } from 'react';
import type React from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { loadable } from 'react-lazily/loadable';
import Box from '@mui/material/Box';
import { AwaitableComponent } from 'awaitable-component';
import { AppContext } from '@/contexts/base/AppContext.tsx';
import { DefaultNavBar } from '@/views/navigation-bar/components/DefaultNavBar.tsx';
import { WebUIUpdateChecker } from '@/views/app-updates/components/WebUIUpdateChecker.tsx';
import { ServerUpdateChecker } from '@/views/app-updates/components/ServerUpdateChecker.tsx';
import { lazyLoadFallback } from '@/utils/base/LazyLoad.tsx';
import { ErrorBoundary } from '@/views/base/components/feedback/ErrorBoundary.tsx';
import { useNavBarContext } from '@/contexts/navigation-bar/NavbarContext.tsx';
import { AppRoutes } from '@/models/base/AppRoute.constants.ts';
import { useMetadataServerSettings } from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import { MediaQuery } from '@/utils/base/MediaQuery.tsx';
import { BrowseTab } from '@/models/browse/Browse.types.ts';
import { LoginPage } from '@/views/authentication/screens/LoginPage.tsx';
import { SearchParam } from '@/models/base/Base.types.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AuthManager } from '@/controllers/authentication/services/AuthManager.ts';
import { ImageProcessingType } from '@/models/settings/Settings.types.ts';
import { MigrationFABIndicator } from '@/views/migration/components/MigrationFABIndicator.tsx';
import { SplashScreen } from '@/views/authentication/components/SplashScreen.tsx';
import { OffsetContainer } from '@/views/base/components/OffsetComponent.tsx';
import { AppInitializer } from '@/controllers/base/services/AppInitializer.ts';
import { useLingui } from '@lingui/react/macro';
import { TypographyMaxLines } from '@/views/base/components/texts/TypographyMaxLines.tsx';
import Stack from '@mui/material/Stack';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

const { Browse } = loadable(() => import('@/views/browse/screens/Browse.tsx'), lazyLoadFallback);
const { DownloadQueue } = loadable(() => import('@/views/downloads/screens/DownloadQueue.tsx'), lazyLoadFallback);
const { Library } = loadable(() => import('@/views/library/screens/Library.tsx'), lazyLoadFallback);
const { Manga } = loadable(() => import('@/views/manga/screens/Manga.tsx'), lazyLoadFallback);
const { SearchAll } = loadable(() => import('@/views/global-search/screens/SearchAll.tsx'), lazyLoadFallback);
const { MigrationManualSearch } = loadable(
    () => import('@/views/migration/screens/MigrationManualSearch.tsx'),
    lazyLoadFallback,
);
const { Settings, SettingsIndex } = loadable(() => import('@/views/settings/screens/Settings.tsx'), lazyLoadFallback);
const { About } = loadable(() => import('@/views/settings/screens/About.tsx'), lazyLoadFallback);
const { Backup } = loadable(() => import('@/views/backup/screens/Backup.tsx'), lazyLoadFallback);
const { CategorySettings } = loadable(() => import('@/views/category/screens/CategorySettings.tsx'), lazyLoadFallback);
const { SourceConfigure } = loadable(
    () => import('@/views/source/screens/configuration/SourceConfigure.tsx'),
    lazyLoadFallback,
);
const { SourceMangas } = loadable(() => import('@/views/source/screens/browse/SourceMangas.tsx'), lazyLoadFallback);
const { ExtensionInfo } = loadable(() => import('@/views/extension/screens/info/ExtensionInfo.tsx'), lazyLoadFallback);
const { Updates } = loadable(() => import('@/views/updates/screens/Updates.tsx'), lazyLoadFallback);
const { History } = loadable(() => import('@/views/history/screens/History.tsx'), lazyLoadFallback);
const { LibrarySettings } = loadable(() => import('@/views/library/screens/LibrarySettings.tsx'), lazyLoadFallback);
const { DownloadSettings } = loadable(() => import('@/views/downloads/screens/DownloadSettings.tsx'), lazyLoadFallback);
const { ImagesSettings } = loadable(() => import('@/views/settings/screens/ImagesSettings.tsx'), lazyLoadFallback);
const { ImageProcessingSetting } = loadable(
    () => import('@/views/settings/screens/ImageProcessingSetting.tsx'),
    lazyLoadFallback,
);
const { ServerSettings } = loadable(() => import('@/views/settings/screens/ServerSettings.tsx'), lazyLoadFallback);
const { BrowseSettings } = loadable(() => import('@/views/browse/screens/BrowseSettings.tsx'), lazyLoadFallback);
const { WebUISettings } = loadable(() => import('@/views/settings/screens/WebUISettings.tsx'), lazyLoadFallback);
const { Migration } = loadable(() => import('@/views/migration/screens/Migration.tsx'), lazyLoadFallback);
const { DeviceSetting } = loadable(() => import('@/views/device/screens/DeviceSetting.tsx'), lazyLoadFallback);
const { TrackingSettings } = loadable(() => import('@/views/tracker/screens/TrackingSettings.tsx'), lazyLoadFallback);
const { TrackerOAuthLogin } = loadable(() => import('@/views/tracker/screens/TrackerOAuthLogin.tsx'), lazyLoadFallback);
const { LibraryDuplicates } = loadable(() => import('@/views/library/screens/LibraryDuplicates.tsx'), lazyLoadFallback);
const { Appearance } = loadable(() => import('@/views/settings/screens/Appearance.tsx'), lazyLoadFallback);
const { GlobalReaderSettings } = loadable(
    () => import('@/views/reader/screens/settings/GlobalReaderSettings.tsx'),
    lazyLoadFallback,
);
const { More } = loadable(() => import('@/views/settings/screens/More.tsx'), lazyLoadFallback);
const { Reader } = loadable(() => import('@/views/reader/screens/Reader.tsx'), lazyLoadFallback);
const { HistorySettings } = loadable(() => import('@/views/history/screens/HistorySettings.tsx'), lazyLoadFallback);
const { ExtensionStores } = loadable(
    () => import('@/views/extension/screens/store/ExtensionStores.tsx'),
    lazyLoadFallback,
);

if (import.meta.env.DEV) {
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

const InitializeGuard = ({ children }: PropsWithChildren) => {
    const { t } = useLingui();
    const { accessToken, refreshToken, isAuthRequired } = AuthManager.useSession();

    const { initialized, actions } = AppInitializer.useStatus();

    useEffect(() => {
        void AppInitializer.start();

        return () => {
            AppInitializer.stop();
        };
    }, []);

    if (!accessToken && !refreshToken && isAuthRequired) {
        return <LoginPage redirect={false} />;
    }

    if (!initialized) {
        const activeAction = actions.find((action) => action.required && action.active);
        const message = activeAction?.message;
        const errorMessage = activeAction?.errorMessage;
        const error = activeAction?.error;

        return (
            <SplashScreen
                message={
                    <Stack sx={{ pt: 4, alignItems: 'center' }}>
                        <TypographyMaxLines>{!!message && t(message)}</TypographyMaxLines>
                        <TypographyMaxLines color="textSecondary" variant="body2">
                            {!!error && !!errorMessage && t(errorMessage)}
                        </TypographyMaxLines>
                        <TypographyMaxLines color="textSecondary" variant="body2">
                            {getErrorMessage(error)}
                        </TypographyMaxLines>
                    </Stack>
                }
            />
        );
    }

    return children;
};

const ReactRouterSetter = () => {
    const navigate = useNavigate();

    useEffect(() => {
        ReactRouter.setNavigateFn(navigate);
    }, []);

    return null;
};

const PrivateRoutes = () => {
    const isAuthenticated = AuthManager.useIsAuthenticated();

    if (!isAuthenticated) {
        return (
            <Navigate
                to={{
                    pathname: AppRoutes.authentication.children.login.path,
                    search: `${SearchParam.REDIRECT}=${window.location.pathname}`,
                }}
                replace
            />
        );
    }

    return <Outlet />;
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
                position: 'relative',
                pr: 'env(safe-area-inset-right)',
            }}
            style={{
                minHeight: `calc(100dvh - ${appBarHeight + bottomBarHeight}px)`,
                width: `calc(100dvw - (100dvw - 100%) - ${navBarWidth}px)`,
                minWidth: `calc(100dvw - (100dvw - 100%) - ${navBarWidth}px)`,
                maxWidth: `calc(100dvw - (100dvw - 100%) - ${navBarWidth}px)`,
                marginTop: `${appBarHeight}px`,
                paddingBottom: `calc(${bottomBarHeight}px + ${!bottomBarHeight ? 'env(safe-area-inset-bottom)' : '0px'})`,
            }}
        >
            <ErrorBoundary>
                <Routes>
                    <Route path={AppRoutes.authentication.match}>
                        <Route path={AppRoutes.authentication.children.login.match} element={<LoginPage />} />
                    </Route>

                    <Route element={<PrivateRoutes />}>
                        {/* General Routes */}
                        <Route
                            path={AppRoutes.root.match}
                            element={<Navigate to={AppRoutes.library.path()} replace />}
                        />
                        <Route
                            path={AppRoutes.matchAll.match}
                            element={<Navigate to={AppRoutes.root.path} replace />}
                        />
                        {isMobileWidth && <Route path={AppRoutes.more.match} element={<More />} />}
                        <Route path={AppRoutes.about.match} element={<About />} />
                        <Route path={AppRoutes.settings.match} element={<Settings />}>
                            <Route index element={<SettingsIndex />} />
                            <Route path={AppRoutes.settings.children.categories.match} element={<CategorySettings />} />
                            <Route path={AppRoutes.settings.children.reader.match} element={<GlobalReaderSettings />} />
                            <Route path={AppRoutes.settings.children.library.match}>
                                <Route index element={<LibrarySettings />} />
                                <Route
                                    path={AppRoutes.settings.children.library.children.duplicates.match}
                                    element={<LibraryDuplicates />}
                                />
                            </Route>
                            <Route path={AppRoutes.settings.children.download.match}>
                                <Route index element={<DownloadSettings />} />
                                {/* TODO: deprecated - got moved to "settings/images/processing/downloads" */}
                                <Route
                                    path={AppRoutes.settings.children.download.children.conversions.match}
                                    element={
                                        <Navigate
                                            to={AppRoutes.settings.children.images.children.processingDownloads.path}
                                            replace
                                        />
                                    }
                                />
                            </Route>
                            <Route path={AppRoutes.settings.children.images.match}>
                                <Route index element={<ImagesSettings />} />
                                <Route
                                    path={AppRoutes.settings.children.images.children.processingDownloads.match}
                                    element={<ImageProcessingSetting type={ImageProcessingType.DOWNLOAD} />}
                                />
                                <Route
                                    path={AppRoutes.settings.children.images.children.processingServe.match}
                                    element={<ImageProcessingSetting type={ImageProcessingType.SERVE} />}
                                />
                            </Route>
                            <Route path={AppRoutes.settings.children.backup.match} element={<Backup />} />
                            <Route path={AppRoutes.settings.children.server.match} element={<ServerSettings />} />
                            <Route path={AppRoutes.settings.children.webui.match} element={<WebUISettings />} />
                            <Route path={AppRoutes.settings.children.browse.match}>
                                <Route index element={<BrowseSettings />} />
                                <Route
                                    path={AppRoutes.settings.children.browse.children.extensionStores.match}
                                    element={<ExtensionStores />}
                                />
                            </Route>
                            <Route path={AppRoutes.settings.children.history.match} element={<HistorySettings />} />
                            <Route path={AppRoutes.settings.children.device.match} element={<DeviceSetting />} />
                            <Route path={AppRoutes.settings.children.tracking.match} element={<TrackingSettings />} />
                            <Route path={AppRoutes.settings.children.appearance.match} element={<Appearance />} />
                        </Route>

                        {/* Manga Routes */}

                        <Route path={AppRoutes.sources.match}>
                            {/* TODO: deprecated - "source" and "extension" page got merged into "browse" */}
                            <Route index element={<Navigate to={AppRoutes.browse.path(BrowseTab.SOURCES)} replace />} />
                            <Route path={AppRoutes.sources.children.browse.match} element={<SourceMangas />} />
                            <Route path={AppRoutes.sources.children.configure.match} element={<SourceConfigure />} />
                            <Route path={AppRoutes.sources.children.searchAll.match} element={<SearchAll />} />
                        </Route>
                        <Route path={AppRoutes.extension.match}>
                            {/* TODO: deprecated - "source" and "extension" page got merged into "browse" */}
                            <Route
                                index
                                element={<Navigate to={AppRoutes.browse.path(BrowseTab.EXTENSIONS)} replace />}
                            />
                            <Route path={AppRoutes.extension.children.info.match} element={<ExtensionInfo />} />
                        </Route>
                        <Route path={AppRoutes.downloads.match} element={<DownloadQueue />} />
                        <Route path={AppRoutes.manga.match}>
                            <Route path={AppRoutes.manga.children.reader.match} element={null} />
                            <Route index element={<Manga />} />
                        </Route>
                        <Route path={AppRoutes.library.match} element={<Library />} />
                        <Route path={AppRoutes.updates.match} element={<Updates />} />
                        {!hideHistory && <Route path={AppRoutes.history.match} element={<History />} />}
                        <Route path={AppRoutes.browse.match} element={<Browse />} />
                        <Route path={AppRoutes.browse.match} element={<Browse />} />
                        <Route path={AppRoutes.migrate.match}>
                            <Route index element={<Migration />} />
                            <Route
                                path={AppRoutes.migrate.children.manualSearch.match}
                                element={<MigrationManualSearch />}
                            />
                        </Route>
                        <Route path={AppRoutes.tracker.match} element={<TrackerOAuthLogin />} />
                    </Route>
                </Routes>
            </ErrorBoundary>
        </Box>
    );
};

const ReaderApp = () => (
    <ErrorBoundary>
        <Routes>
            <Route element={<PrivateRoutes />}>
                <Route path={AppRoutes.matchAll.match} element={<Reader />} />
            </Route>
        </Routes>
    </ErrorBoundary>
);

const OffsetContainerRoot = ({ children }: { children?: ReactNode }) => {
    const { appBarHeight } = useNavBarContext();

    return <OffsetContainer topOffset={appBarHeight}>{children}</OffsetContainer>;
};

export const App: React.FC = () => (
    <AppContext>
        <ScrollToTop />
        <AwaitableComponent.Root />

        <ReactRouterSetter />

        <CssBaseline enableColorScheme />

        <InitializeGuard>
            <ServerUpdateChecker />
            <WebUIUpdateChecker />

            <Box sx={{ display: 'flex' }}>
                <OffsetContainerRoot>
                    <Box sx={{ flexShrink: 0, position: 'relative', height: '100dvh' }}>
                        <DefaultNavBar />
                    </Box>
                    <Routes>
                        <Route path={AppRoutes.matchAll.match} element={<MainApp />} />
                        <Route path={AppRoutes.reader.match} element={<ReaderApp />} />
                    </Routes>
                </OffsetContainerRoot>
            </Box>
            <MigrationFABIndicator />
        </InitializeGuard>
    </AppContext>
);
