/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

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
        downloadConversions {
            mimeType
            target
            compressionLevel
        }

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
        authMode
        authPassword
        authUsername

        # misc
        debugLogsEnabled
        systemTrayEnabled
        maxLogFileSize
        maxLogFiles
        maxLogFolderSize

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
        flareSolverrAsResponseFallback

        # OPDS
        opdsUseBinaryFileSizes
        opdsItemsPerPage
        opdsEnablePageReadProgress
        opdsMarkAsReadOnDownload
        opdsShowOnlyUnreadChapters
        opdsShowOnlyDownloadedChapters
        opdsChapterSortOrder
    }
`;
