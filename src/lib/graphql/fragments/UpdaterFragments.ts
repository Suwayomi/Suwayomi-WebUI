/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_MANGA_FIELDS } from '@/lib/graphql/Fragments.ts';

const UPDATER_MANGA_FIELDS = gql`
    fragment UPDATER_MANGA_FIELDS on MangaType {
        id
        title
        thumbnailUrl
    }
`;

export const UPDATER_SUBSCRIPTION_FIELDS = gql`
    ${UPDATER_MANGA_FIELDS}
    ${FULL_MANGA_FIELDS}

    fragment UPDATER_SUBSCRIPTION_FIELDS on UpdateStatus {
        isRunning

        completeJobs {
            mangas {
                totalCount
                nodes {
                    ...FULL_MANGA_FIELDS
                }
            }
        }
        failedJobs {
            mangas {
                totalCount
                nodes {
                    ...UPDATER_MANGA_FIELDS
                }
            }
        }
        pendingJobs {
            mangas {
                totalCount
                nodes {
                    ...UPDATER_MANGA_FIELDS
                }
            }
        }
        runningJobs {
            mangas {
                totalCount
                nodes {
                    ...UPDATER_MANGA_FIELDS
                }
            }
        }
    }
`;

export const UPDATER_START_STOP_FIELDS = gql`
    fragment UPDATER_START_STOP_FIELDS on UpdateStatus {
        isRunning
    }
`;
