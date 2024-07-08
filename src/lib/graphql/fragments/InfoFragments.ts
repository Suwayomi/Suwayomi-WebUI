/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

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
