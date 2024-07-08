/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

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
