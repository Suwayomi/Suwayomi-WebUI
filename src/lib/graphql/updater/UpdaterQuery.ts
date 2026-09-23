/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { UPDATER_STATUS_FIELDS } from '@/lib/graphql/updater/UpdaterFragments.ts';

export const GET_UPDATE_STATUS = gql`
    ${UPDATER_STATUS_FIELDS}

    query GET_UPDATE_STATUS($contentType: SourceContentType = MANGA) {
        libraryUpdateStatus(contentType: $contentType) {
            ...UPDATER_STATUS_FIELDS
        }
    }
`;

export const GET_LAST_UPDATE_TIMESTAMP = gql`
    query GET_LAST_UPDATE_TIMESTAMP {
        lastUpdateTimestamp {
            timestamp
        }
    }
`;

export const GET_LAST_MANGA_UPDATE_TIMESTAMP = gql`
    query GET_LAST_MANGA_UPDATE_TIMESTAMP {
        lastUpdateTimestamp: lastMangaUpdateTimestamp {
            timestamp
        }
    }
`;

export const GET_LAST_NOVEL_UPDATE_TIMESTAMP = gql`
    query GET_LAST_NOVEL_UPDATE_TIMESTAMP {
        lastUpdateTimestamp: lastNovelUpdateTimestamp {
            timestamp
        }
    }
`;
