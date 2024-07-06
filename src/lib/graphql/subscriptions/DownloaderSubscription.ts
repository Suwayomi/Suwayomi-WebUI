/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { DOWNLOAD_STATUS_FIELDS } from '@/lib/graphql/fragments/DownloadFragments.ts';

export const DOWNLOAD_STATUS_SUBSCRIPTION = gql`
    ${DOWNLOAD_STATUS_FIELDS}

    subscription DOWNLOAD_STATUS_SUBSCRIPTION {
        downloadChanged {
            ...DOWNLOAD_STATUS_FIELDS
        }
    }
`;
