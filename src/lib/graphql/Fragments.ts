/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_BASE_FIELDS } from '@/lib/graphql/fragments/SourceFragments.ts';
import { TRACKER_BIND_FIELDS } from '@/lib/graphql/fragments/TrackFragments.ts';
import { TRACK_RECORD_BIND_FIELDS } from '@/lib/graphql/fragments/TrackRecordFragments.ts';

export const PAGE_INFO = gql`
    fragment PAGE_INFO on PageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
    }
`;

export const GLOBAL_METADATA = gql`
    fragment GLOBAL_METADATA on GlobalMetaType {
        key
        value
    }
`;

export const FULL_CATEGORY_FIELDS = gql`
    fragment FULL_CATEGORY_FIELDS on CategoryType {
        default
        id
        includeInUpdate
        includeInDownload
        name
        order
        meta {
            key
            value
        }
        mangas {
            totalCount
        }
    }
`;

export const FULL_TRACK_RECORD_FIELDS = gql`
    ${TRACK_RECORD_BIND_FIELDS}
    ${TRACKER_BIND_FIELDS}

    fragment FULL_TRACK_RECORD_FIELDS on TrackRecordType {
        ...TRACK_RECORD_BIND_FIELDS
        tracker {
            ...TRACKER_BIND_FIELDS
        }
    }
`;

export const BASE_MANGA_FIELDS = gql`
    ${SOURCE_BASE_FIELDS}
    ${FULL_TRACK_RECORD_FIELDS}
    fragment BASE_MANGA_FIELDS on MangaType {
        artist
        author
        chaptersLastFetchedAt
        description
        genre
        id
        inLibrary
        inLibraryAt
        initialized
        lastFetchedAt
        meta {
            key
            value
        }
        realUrl
        source {
            ...SOURCE_BASE_FIELDS
        }
        status
        thumbnailUrl
        thumbnailUrlLastFetched
        title
        url
        trackRecords {
            totalCount
            nodes {
                ...FULL_TRACK_RECORD_FIELDS
            }
        }
    }
`;

export const PARTIAL_MANGA_FIELDS = gql`
    ${BASE_MANGA_FIELDS}
    ${FULL_CATEGORY_FIELDS}
    fragment PARTIAL_MANGA_FIELDS on MangaType {
        ...BASE_MANGA_FIELDS
        unreadCount
        downloadCount
        bookmarkCount
        categories {
            nodes {
                ...FULL_CATEGORY_FIELDS
            }
            totalCount
        }
        chapters {
            totalCount
        }
    }
`;

export const FULL_CHAPTER_FIELDS = gql`
    fragment FULL_CHAPTER_FIELDS on ChapterType {
        chapterNumber
        fetchedAt
        id
        isBookmarked
        isDownloaded
        isRead
        lastPageRead
        lastReadAt
        mangaId
        manga {
            id
            title
            inLibrary
            thumbnailUrl
            lastFetchedAt
        }
        meta {
            key
            value
        }
        name
        pageCount
        realUrl
        scanlator
        sourceOrder
        uploadDate
        url
    }
`;

export const FULL_MANGA_FIELDS = gql`
    ${PARTIAL_MANGA_FIELDS}
    ${FULL_CHAPTER_FIELDS}
    fragment FULL_MANGA_FIELDS on MangaType {
        ...PARTIAL_MANGA_FIELDS
        lastReadChapter {
            ...FULL_CHAPTER_FIELDS
        }
        latestReadChapter {
            ...FULL_CHAPTER_FIELDS
        }
        latestFetchedChapter {
            ...FULL_CHAPTER_FIELDS
        }
        latestUploadedChapter {
            ...FULL_CHAPTER_FIELDS
        }
        firstUnreadChapter {
            ...FULL_CHAPTER_FIELDS
        }
    }
`;

export const FULL_EXTENSION_FIELDS = gql`
    fragment FULL_EXTENSION_FIELDS on ExtensionType {
        apkName
        repo
        hasUpdate
        iconUrl
        isInstalled
        isNsfw
        isObsolete
        lang
        name
        pkgName
        versionCode
        versionName
    }
`;

export const FULL_DOWNLOAD_STATUS = gql`
    fragment FULL_DOWNLOAD_STATUS on DownloadStatus {
        queue {
            chapter {
                id
                name
                sourceOrder
                isDownloaded
                manga {
                    id
                    title
                    downloadCount
                }
            }
            progress
            state
            tries
        }
        state
    }
`;

export const ABOUT_WEBUI = gql`
    fragment ABOUT_WEBUI on AboutWebUI {
        channel
        tag
    }
`;

export const WEBUI_UPDATE_CHECK = gql`
    fragment WEBUI_UPDATE_CHECK on WebUIUpdateCheck {
        channel
        tag
        updateAvailable
    }
`;

export const WEBUI_UPDATE_INFO = gql`
    fragment WEBUI_UPDATE_INFO on WebUIUpdateInfo {
        channel
        tag
    }
`;

export const WEBUI_UPDATE_STATUS = gql`
    ${WEBUI_UPDATE_INFO}
    fragment WEBUI_UPDATE_STATUS on WebUIUpdateStatus {
        info {
            ...WEBUI_UPDATE_INFO
        }
        progress
        state
    }
`;

export const SERVER_SETTINGS = gql`
    fragment SERVER_SETTINGS on SettingsType {
        # Server ip and port bindings
        ip
        port

        # Socks proxy
        socksProxyEnabled
        socksProxyVersion
        socksProxyHost
        socksProxyPort
        socksProxyUsername
        socksProxyPassword

        # webUI
        webUIFlavor
        initialOpenInBrowserEnabled
        webUIInterface
        electronPath
        webUIChannel
        webUIUpdateCheckInterval

        # downloader
        downloadAsCbz
        downloadsPath
        autoDownloadNewChapters
        excludeEntryWithUnreadChapters
        autoDownloadNewChaptersLimit
        autoDownloadIgnoreReUploads

        # extensions
        extensionRepos

        # requests
        maxSourcesInParallel

        # updater
        excludeUnreadChapters
        excludeNotStarted
        excludeCompleted
        globalUpdateInterval
        updateMangas

        # Authentication
        basicAuthEnabled
        basicAuthUsername
        basicAuthPassword

        # misc
        debugLogsEnabled
        gqlDebugLogsEnabled
        systemTrayEnabled

        # backup
        backupPath
        backupTime
        backupInterval
        backupTTL

        # local source
        localSourcePath

        # Cloudflare bypass
        flareSolverrEnabled
        flareSolverrUrl
        flareSolverrTimeout
        flareSolverrSessionName
        flareSolverrSessionTtl
    }
`;
