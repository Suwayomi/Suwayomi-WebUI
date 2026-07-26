/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { Collapsable } from '@/base/components/Collapsable.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import Stack from '@mui/material/Stack';
import { Metadata } from '@/base/components/texts/Metadata.tsx';
import { STABLE_EMPTY_ARRAY, STABLE_EMPTY_OBJECT } from '@/base/Base.constants.ts';
import type { ServerSettings } from '@/features/settings/Settings.types.ts';
import { epochToDate } from '@/base/utils/DateHelper.ts';
import dayjs from 'dayjs';
import { getReaderSettings, useDefaultReaderSettings } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { getActiveDevice } from '@/features/device/services/Device.ts';
import {
    READING_MODE_VALUE_TO_DISPLAY_DATA,
    READING_MODE_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { IReaderSettings, ReadingMode } from '@/features/reader/Reader.types.ts';
import { Sources } from '@/features/source/services/Sources.ts';
import omitBy from 'lodash/fp/omitBy';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { indent } from '@/base/utils/Strings.ts';
import Button from '@mui/material/Button';
import { assertIsDefined } from '@/base/Asserts.ts';
import { copyToClipboard, getRenderedText } from '@/lib/HelperFunctions.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { MIGRATION_LOCAL_STORAGE_KEY } from '@/features/migration/Migration.constants.ts';
import type { MigrationState } from '@/features/migration/Migration.types.ts';
import { useNetwork, useOrientation, useViewportSize } from '@mantine/hooks';
import type {
    GetCategoriesLibraryQuery,
    GetCategoriesLibraryQueryVariables,
    GetMangasCountQuery,
    GetMangasCountQueryVariables,
    GetTrackersSettingsQuery,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGAS_COUNT } from '@/lib/graphql/manga/MangaQuery.ts';
import { GET_CATEGORIES_LIBRARY } from '@/lib/graphql/category/CategoryQuery.ts';
import { getCategoryMetadata } from '@/features/category/services/CategoryMetadata.ts';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';

const PRIVACY_UNSAFE_SERVER_SETTINGS: (keyof ServerSettings)[] = [
    'socksProxyUsername',
    'socksProxyPassword',
    'authUsername',
    'authPassword',
    'downloadConversions',
    'serveConversions',
    'databaseUrl',
    'databaseUsername',
    'databasePassword',
    'syncYomiApiKey',
    'jwtAudience',
];
const getBrowserDebugInfo = async (serverAddress: string) => {
    const nav = navigator;

    const serviceWorkerRegistration =
        'serviceWorker' in navigator
            ? await navigator.serviceWorker.getRegistration().catch(() => undefined)
            : undefined;

    return {
        page: {
            protocol: window.location.protocol,
            localhost: window.location.hostname.includes('localhost'),
            matchesServerAddress: window.location.origin === serverAddress,
        },

        connection:
            'connection' in nav
                ? {
                      effectiveType: (nav.connection as any).effectiveType,
                      downlink: (nav.connection as any).downlink,
                      rtt: (nav.connection as any).rtt,
                      saveData: (nav.connection as any).saveData,
                      type: (nav.connection as any).type,
                  }
                : 'Unknown',

        security: {
            secureContext: window.isSecureContext,
            https: window.location.protocol === 'https:',
            localhost: window.location.hostname.includes('localhost'),
        },

        protocols: {
            http: true,
            https: window.location.protocol === 'https:',
            websocket: typeof WebSocket !== 'undefined',
            webRTC: typeof RTCPeerConnection !== 'undefined',
        },

        browser: {
            userAgent: nav.userAgent,
            language: nav.language,
            languages: nav.languages,
            platform: 'userAgentData' in nav ? (nav.userAgentData as any)?.platform : nav.platform,
            vendor: nav.vendor,
            online: nav.onLine,
        },

        device: {
            hardwareConcurrency: nav.hardwareConcurrency ?? 'Unknown',
            deviceMemory: 'deviceMemory' in nav ? `${nav.deviceMemory} GB` : 'Unknown',
            maxTouchPoints: nav.maxTouchPoints,
            touchSupported: 'ontouchstart' in window || nav.maxTouchPoints > 0,
        },

        screen: {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: screen.orientation?.type ?? 'Unknown',
        },

        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },

        locale: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
        },

        storage: {
            localStorage: (() => {
                try {
                    localStorage.setItem('__test', '1');
                    localStorage.removeItem('__test');
                    return true;
                } catch {
                    return false;
                }
            })(),
            sessionStorage: (() => {
                try {
                    sessionStorage.setItem('__test', '1');
                    sessionStorage.removeItem('__test');
                    return true;
                } catch {
                    return false;
                }
            })(),
        },

        features: {
            serviceWorker: 'serviceWorker' in navigator,
            webGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch {
                    return false;
                }
            })(),
        },

        pwa: {
            installed:
                window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true,

            displayMode: {
                browser: window.matchMedia('(display-mode: browser)').matches,
                standalone: window.matchMedia('(display-mode: standalone)').matches,
                minimalUi: window.matchMedia('(display-mode: minimal-ui)').matches,
                fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
                windowControlsOverlay: window.matchMedia('(display-mode: window-controls-overlay)').matches,
            },

            iosStandalone: (navigator as any).standalone ?? false,

            serviceWorker: {
                supported: 'serviceWorker' in navigator,
                controller: !!navigator.serviceWorker?.controller,
                registered: !!serviceWorkerRegistration,
                active: !!serviceWorkerRegistration?.active,
                waiting: !!serviceWorkerRegistration?.waiting,
                installing: !!serviceWorkerRegistration?.installing,
            },

            beforeInstallPromptSupported: 'onbeforeinstallprompt' in window,

            manifest: {
                linked: !!document.querySelector('link[rel="manifest"]'),
            },
        },
    };
};
const mapObjectToMetadata = (obj: object, tabs: number = 0) => (
    <Stack>
        {Object.entries(obj).map(([key, value], index, array) =>
            !!value && typeof value === 'object' && !Array.isArray(value) ? (
                <Fragment key={key}>
                    {index >= 1 && <br />}
                    <TypographyMaxLines component="span">{indent(key, tabs, ' ')}</TypographyMaxLines>
                    {mapObjectToMetadata(value, tabs + 2)}
                    {array[index + 1] && typeof array[index + 1]?.[1] !== 'object' && <br />}
                </Fragment>
            ) : (
                <Metadata
                    key={key}
                    title={indent(key, tabs, ' ')}
                    value={indent(JSON.stringify(value), 1, ' ')}
                    titleProps={{ component: 'span' }}
                    valueProps={{ component: 'span' }}
                    stackProps={{ sx: { display: 'inline-block' } }}
                />
            ),
        )}
    </Stack>
);

export const DebugInformation = () => {
    const { t } = useLingui();

    const [baseUrl] = requestManager.useBaseUrl();

    const aboutRequest = requestManager.useGetAbout();
    const categoriesRequest = requestManager.useGetCategories<
        GetCategoriesLibraryQuery,
        GetCategoriesLibraryQueryVariables
    >(GET_CATEGORIES_LIBRARY, {});
    const libraryMangasCountRequest = requestManager.useGetMangas<GetMangasCountQuery, GetMangasCountQueryVariables>(
        GET_MANGAS_COUNT,
        { condition: { inLibrary: true } },
    );
    const nonLibraryCategoryMangasCountRequest = requestManager.useGetMangas<
        GetMangasCountQuery,
        GetMangasCountQueryVariables
    >(GET_MANGAS_COUNT, { condition: { inLibrary: true }, filter: { categoryId: { isNull: false } } });
    const extensionStoresRequest = requestManager.useGetExtensionStores();
    const extensionsRequest = requestManager.useGetExtensionList({ variables: { condition: { isInstalled: true } } });
    const sourcesRequest = requestManager.useGetSourceList();
    const serverSettingsRequest = requestManager.useGetServerSettings();
    const clientSettings = useMetadataServerSettings();
    const defaultReaderSettings = useDefaultReaderSettings();
    const webUIUpdateStatusRequest = requestManager.useGetWebUIUpdateStatus();
    const globalUpdateRequest = requestManager.useGetGlobalUpdateSummary();
    const downloadStatusRequest = requestManager.useGetDownloadStatus();
    const syncStatusRequest = requestManager.useGetSyncStatus();
    const trackersRequest = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);

    const [migrationState] = useLocalStorage<{ state: MigrationState }>(MIGRATION_LOCAL_STORAGE_KEY);

    const contentTextRef = useRef<HTMLDivElement>(null);

    const [readerSettingsByReadingMode, setReaderSettingsByReadingMode] =
        useState<Record<ReadingMode, IReaderSettings>>(STABLE_EMPTY_OBJECT);
    const [browserDebugInfo, setBrowserDebugInfo] =
        useState<Awaited<ReturnType<typeof getBrowserDebugInfo>>>(STABLE_EMPTY_OBJECT);

    const aboutServer = aboutRequest.data?.aboutServer;
    const aboutWebUI = aboutRequest.data?.aboutWebUI;

    const categories = categoriesRequest.data?.categories.nodes ?? STABLE_EMPTY_ARRAY;

    const libraryMangasCount = libraryMangasCountRequest.data?.mangas.totalCount ?? 0;
    const nonLibraryMangasInCategoriesCount = nonLibraryCategoryMangasCountRequest.data?.mangas.totalCount ?? 0;

    const extensionStoresCount = extensionStoresRequest.data?.extensionStores.totalCount ?? 0;
    const extensions = extensionsRequest.data?.extensions.nodes ?? STABLE_EMPTY_ARRAY;
    const sources = sourcesRequest.data?.sources.nodes ?? STABLE_EMPTY_ARRAY;

    const areFromMultipleStores = useMemo(() => Sources.areFromMultipleStores(sources), [sources]);
    const disabledSourcesCount = useMemo(() => Sources.filter(sources, { enabled: false }).length, [sources]);
    const nsfwSourcesCount = useMemo(() => Sources.filter(sources, { isNsfw: true }).length, [sources]);
    const pinnedSourcesCount = useMemo(() => Sources.filter(sources, { pinned: true }).length, [sources]);

    const webUIUpdateStatus = webUIUpdateStatusRequest.data?.getWebUIUpdateStatus;
    const globalUpdateStatus = globalUpdateRequest.data?.libraryUpdateStatus;
    const downloadStatus = downloadStatusRequest.data?.downloadStatus;
    const syncStatus = syncStatusRequest.data?.lastSyncStatus;

    const trackers = trackersRequest.data?.trackers.nodes ?? STABLE_EMPTY_ARRAY;

    const activeDevice = getActiveDevice();

    const debugInfo = useMemo(
        () => ({
            About: {
                Server: {
                    Version: aboutServer?.version,
                    Channel: aboutServer?.buildType,
                    'Build time': aboutServer?.buildTime
                        ? epochToDate(Number(aboutServer.buildTime)).toISOString()
                        : '-',
                },
                WebUI: {
                    Version: aboutWebUI?.tag,
                    Channel: aboutWebUI?.channel,
                    'Update timestamp': aboutWebUI?.updateTimestamp
                        ? dayjs(Number(aboutWebUI.updateTimestamp)).toISOString()
                        : '-',
                },
            },
            Settings: {
                Server: omitBy(
                    (_value, key) => PRIVACY_UNSAFE_SERVER_SETTINGS.includes(key as keyof ServerSettings),
                    serverSettingsRequest.data?.settings ?? STABLE_EMPTY_OBJECT,
                ),
                WebUI: {
                    'Active Device': activeDevice,
                    ...clientSettings.settings,
                    Reader: {
                        Default: defaultReaderSettings.settings,
                        ...Object.fromEntries(
                            READING_MODE_VALUES.map((readingMode) => [
                                READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode].title.message ?? readingMode,
                                omitBy(
                                    (value, key) =>
                                        JSON.stringify(defaultReaderSettings.settings[key as keyof IReaderSettings]) ===
                                        JSON.stringify(value),
                                    readerSettingsByReadingMode[readingMode],
                                ),
                            ]),
                        ),
                    },
                },
            },
            'Extensions/Sources': {
                'Extension stores': extensionStoresCount,
                'Extensions installed': extensions.length,
                'Extensions outdated': extensions.filter((extension) => extension.hasUpdate && !extension.isObsolete)
                    .length,
                'Extension obsolete': extensions.filter((extension) => extension.isObsolete).length,
                'Sources from different stores': areFromMultipleStores,
                'Sources disabled': disabledSourcesCount,
                'Sources NSFW': nsfwSourcesCount,
                'Sources pinned': pinnedSourcesCount,
                'Show NSFW': clientSettings.settings.showNsfw,
                'Browse languages': clientSettings.settings.browseLanguages,
            },
            Library: {
                Entries: libraryMangasCount,
                'Non library entries in categories': nonLibraryMangasInCategoriesCount,
                Categories: mapValues(
                    (items) => (items as unknown[])[0],
                    groupBy(
                        'id',
                        categories.map((category) => ({
                            id: category.id,
                            entries: category.mangas.totalCount ?? 0,
                            metas: getCategoryMetadata(category),
                        })),
                    ),
                ),
            },
            Trackers: {
                'Logged in': Trackers.getLoggedIn(trackers).length,
                'Tokens expired': trackers.filter((tracker) => tracker.isTokenExpired).length,
                ...mapValues((items) => (items as unknown[])[0], groupBy('name', trackers)),
            },
            'Update Status': globalUpdateStatus?.jobsInfo,
            'Download Status': {
                State: downloadStatus?.state,
                Entries: {
                    Total: downloadStatus?.queue.length,
                    ...mapValues((items) => (items as unknown[]).length, groupBy('state', downloadStatus?.queue)),
                },
            },
            'Sync status': syncStatus,
            'WebUI update status': webUIUpdateStatus,
            'Migration state': migrationState?.state,
            Client: browserDebugInfo,
        }),
        [
            aboutServer,
            aboutWebUI,
            serverSettingsRequest.data?.settings,
            activeDevice,
            clientSettings.settings,
            defaultReaderSettings.settings,
            readerSettingsByReadingMode,
            extensionStoresCount,
            extensions.length,
            areFromMultipleStores,
            disabledSourcesCount,
            nsfwSourcesCount,
            pinnedSourcesCount,
            browserDebugInfo,
            migrationState,
            categories,
            libraryMangasCount,
            nonLibraryMangasInCategoriesCount,
            webUIUpdateStatus,
            globalUpdateStatus,
            downloadStatus,
            syncStatus,
            trackers,
        ],
    );

    useEffect(() => {
        const settingsByReadingModeEntries = READING_MODE_VALUES.map(
            (readingMode) =>
                [
                    readingMode,
                    getReaderSettings(
                        'global',
                        { meta: defaultReaderSettings.metadata },
                        defaultReaderSettings.settings,
                        undefined,
                        readingMode,
                    ),
                ] satisfies [ReadingMode, IReaderSettings],
        );
        const settingsByReadingMode = Object.fromEntries(settingsByReadingModeEntries) as Record<
            ReadingMode,
            IReaderSettings
        >;

        setReaderSettingsByReadingMode(settingsByReadingMode);
    }, [defaultReaderSettings.metadata, defaultReaderSettings.settings]);

    const viewportSize = useViewportSize();
    const orientation = useOrientation();
    const network = useNetwork();
    useEffect(() => {
        getBrowserDebugInfo(baseUrl)
            .then(setBrowserDebugInfo)
            .catch(defaultPromiseErrorHandler('DebugInformation::getBrowserDebugInfo'));
    }, [baseUrl, viewportSize, orientation, network]);

    const isLoading =
        aboutRequest.loading ||
        extensionStoresRequest.loading ||
        extensionsRequest.loading ||
        sourcesRequest.loading ||
        serverSettingsRequest.loading ||
        clientSettings.loading ||
        defaultReaderSettings.loading ||
        categoriesRequest.loading ||
        libraryMangasCountRequest.loading ||
        nonLibraryCategoryMangasCountRequest.loading ||
        webUIUpdateStatusRequest.loading ||
        downloadStatusRequest.loading ||
        syncStatusRequest.loading ||
        trackersRequest.loading;
    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    const hasError =
        aboutRequest.error ||
        extensionStoresRequest.error ||
        extensionsRequest.error ||
        sourcesRequest.error ||
        serverSettingsRequest.error ||
        clientSettings.request.error ||
        defaultReaderSettings.request.error ||
        categoriesRequest.error ||
        libraryMangasCountRequest.error ||
        nonLibraryCategoryMangasCountRequest.error ||
        webUIUpdateStatusRequest.error ||
        downloadStatusRequest.error ||
        syncStatusRequest.error ||
        trackersRequest.error;
    if (hasError) {
        return (
            <EmptyView
                message={t`Could not load data`}
                retry={() => {
                    if (aboutRequest.error) {
                        aboutRequest.refetch().catch(defaultPromiseErrorHandler('DebugInformation::aboutRequest'));
                    }

                    if (extensionStoresRequest.error) {
                        extensionStoresRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::extensionStoresRequest'));
                    }

                    if (extensionsRequest.error) {
                        extensionsRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::extensionsRequest'));
                    }

                    if (sourcesRequest.error) {
                        sourcesRequest.refetch().catch(defaultPromiseErrorHandler('DebugInformation::sourcesRequest'));
                    }

                    if (serverSettingsRequest.error) {
                        serverSettingsRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::serverSettingsRequest'));
                    }

                    if (clientSettings.request.error) {
                        clientSettings.request
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::clientSettings'));
                    }

                    if (defaultReaderSettings.request.error) {
                        defaultReaderSettings.request
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::defaultReaderSettings'));
                    }

                    if (categoriesRequest.error) {
                        categoriesRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::categoriesRequest'));
                    }

                    if (libraryMangasCountRequest.error) {
                        libraryMangasCountRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::libraryMangasCountRequest'));
                    }

                    if (nonLibraryCategoryMangasCountRequest.error) {
                        nonLibraryCategoryMangasCountRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::nonLibraryCategoriesRequest'));
                    }

                    if (webUIUpdateStatusRequest.error) {
                        webUIUpdateStatusRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::webUIUpdateStatusRequest'));
                    }

                    if (downloadStatusRequest.error) {
                        downloadStatusRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::downloadStatusRequest'));
                    }

                    if (syncStatusRequest.error) {
                        syncStatusRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::syncStatusRequest'));
                    }

                    if (trackersRequest.error) {
                        trackersRequest
                            .refetch()
                            .catch(defaultPromiseErrorHandler('DebugInformation::trackersRequest'));
                    }
                }}
            />
        );
    }

    return (
        <Collapsable
            slots={{
                headerWrapper: { sx: { alignItems: 'center' } },
                collapse: {
                    slotProps: { wrapperInner: { sx: { whiteSpace: 'pre', textWrap: 'pretty' } } },
                },
            }}
            header={
                <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    {t`Show`}
                    {!!navigator.clipboard && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={async (e) => {
                                e.stopPropagation();
                                assertIsDefined(contentTextRef.current?.innerText);
                                copyToClipboard(getRenderedText(contentTextRef.current, 'white-space: pre;'));
                            }}
                        >{t`Copy`}</Button>
                    )}
                </Stack>
            }
            collapse={<Stack ref={contentTextRef}>{mapObjectToMetadata(debugInfo, 2)}</Stack>}
        />
    );
};
