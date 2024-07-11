/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { WEBUI_UPDATE_INFO, WEBUI_UPDATE_STATUS } from '@/lib/graphql/fragments/InfoFragments.ts';

export const UPDATE_WEBUI = gql`
    ${WEBUI_UPDATE_STATUS}
    mutation UPDATE_WEBUI($input: WebUIUpdateInput = {}) {
        updateWebUI(input: $input) {
            updateStatus {
                ...WEBUI_UPDATE_STATUS
            }
        }
    }
`;

export const RESET_WEBUI_UPDATE_STATUS = gql`
    ${WEBUI_UPDATE_INFO}
    mutation RESET_WEBUI_UPDATE_STATUS {
        resetWebUIUpdateStatus {
            info {
                ...WEBUI_UPDATE_INFO
            }
            state
        }
    }
`;
