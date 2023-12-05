/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { WEBUI_UPDATE_STATUS } from '@/lib/graphql/Fragments';

export const GET_ABOUT = gql`
    query GET_ABOUT {
        aboutServer {
            buildTime
            buildType
            discord
            github
            name
            revision
            version
        }
        aboutWebUI {
            channel
            tag
        }
    }
`;

export const CHECK_FOR_SERVER_UPDATES = gql`
    query CHECK_FOR_SERVER_UPDATES {
        checkForServerUpdates {
            channel
            tag
            url
        }
    }
`;

export const CHECK_FOR_WEBUI_UPDATE = gql`
    query CHECK_FOR_WEBUI_UPDATE {
        checkForWebUIUpdate {
            channel
            tag
            updateAvailable
        }
    }
`;

export const GET_WEBUI_UPDATE_STATUS = gql`
    ${WEBUI_UPDATE_STATUS}
    query GET_WEBUI_UPDATE_STATUS {
        getWebUIUpdateStatus {
            ...WEBUI_UPDATE_STATUS
        }
    }
`;
