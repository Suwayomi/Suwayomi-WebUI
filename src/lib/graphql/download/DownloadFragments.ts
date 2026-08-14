/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { SOURCE_BASE_FIELDS } from '@/lib/graphql/source/SourceFragments.ts';
import { MANGA_BASE_FIELDS } from '@/lib/graphql/manga/MangaFragments.ts';
import { CHAPTER_BASE_FIELDS } from '@/lib/graphql/chapter/ChapterFragments.ts';

export const DOWNLOAD_TYPE_FIELDS = gql`
    ${MANGA_BASE_FIELDS}
    ${SOURCE_BASE_FIELDS}
    ${CHAPTER_BASE_FIELDS}

    fragment DOWNLOAD_TYPE_FIELDS on DownloadType {
        chapter {
            ...CHAPTER_BASE_FIELDS
            isDownloaded
            pageCount
        }

        manga {
            ...MANGA_BASE_FIELDS
            downloadCount
            source {
                ...SOURCE_BASE_FIELDS
            }
        }

        progress
        state
        tries
        position
    }
`;

export const DOWNLOAD_STATUS_FIELDS = gql`
    ${DOWNLOAD_TYPE_FIELDS}

    fragment DOWNLOAD_STATUS_FIELDS on DownloadStatus {
        state

        queue {
            ...DOWNLOAD_TYPE_FIELDS
        }
    }
`;

export const DOWNLOAD_UPDATES_FIELDS = gql`
    ${DOWNLOAD_TYPE_FIELDS}

    fragment DOWNLOAD_UPDATES_FIELDS on DownloadUpdates {
        state
        omittedUpdates

        updates {
            type
            download {
                ...DOWNLOAD_TYPE_FIELDS
            }
        }
    }
`;
