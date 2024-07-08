/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ABOUT_WEBUI, WEBUI_UPDATE_CHECK, WEBUI_UPDATE_STATUS } from '@/lib/graphql/fragments/InfoFragments.ts';

export const GET_ABOUT = gql`
    ${ABOUT_WEBUI}
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
            ...ABOUT_WEBUI
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
    ${WEBUI_UPDATE_CHECK}
    query CHECK_FOR_WEBUI_UPDATE {
        checkForWebUIUpdate {
            ...WEBUI_UPDATE_CHECK
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
