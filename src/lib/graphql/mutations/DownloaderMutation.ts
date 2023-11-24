/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { FULL_DOWNLOAD_STATUS } from '@/lib/graphql/Fragments';

export const CLEAR_DOWNLOADER = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation CLEAR_DOWNLOADER($input: ClearDownloaderInput = {}) {
        clearDownloader(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const DELETE_DOWNLOADED_CHAPTER = gql`
    mutation DELETE_DOWNLOADED_CHAPTER($input: DeleteDownloadedChapterInput!) {
        deleteDownloadedChapter(input: $input) {
            clientMutationId
            chapters {
                id
                isDownloaded
            }
        }
    }
`;

export const DELETE_DOWNLOADED_CHAPTERS = gql`
    mutation DELETE_DOWNLOADED_CHAPTERS($input: DeleteDownloadedChaptersInput!) {
        deleteDownloadedChapters(input: $input) {
            clientMutationId
            chapters {
                id
                isDownloaded
            }
        }
    }
`;

export const DEQUEUE_CHAPTER_DOWNLOAD = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation DEQUEUE_CHAPTER_DOWNLOAD($input: DequeueChapterDownloadInput!) {
        dequeueChapterDownload(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const DEQUEUE_CHAPTER_DOWNLOADS = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation DEQUEUE_CHAPTER_DOWNLOADS($input: DequeueChapterDownloadsInput!) {
        dequeueChapterDownloads(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const ENQUEUE_CHAPTER_DOWNLOAD = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation ENQUEUE_CHAPTER_DOWNLOAD($input: EnqueueChapterDownloadInput!) {
        enqueueChapterDownload(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const ENQUEUE_CHAPTER_DOWNLOADS = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation ENQUEUE_CHAPTER_DOWNLOADS($input: EnqueueChapterDownloadsInput!) {
        enqueueChapterDownloads(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const REORDER_CHAPTER_DOWNLOAD = gql`
    ${FULL_DOWNLOAD_STATUS}
    mutation REORDER_CHAPTER_DOWNLOAD($input: ReorderChapterDownloadInput!) {
        reorderChapterDownload(input: $input) {
            clientMutationId
            downloadStatus {
                ...FULL_DOWNLOAD_STATUS
            }
        }
    }
`;

export const START_DOWNLOADER = gql`
    mutation START_DOWNLOADER($input: StartDownloaderInput = {}) {
        startDownloader(input: $input) {
            clientMutationId
            downloadStatus {
                state
            }
        }
    }
`;

export const STOP_DOWNLOADER = gql`
    mutation STOP_DOWNLOADER($input: StopDownloaderInput = {}) {
        stopDownloader(input: $input) {
            clientMutationId
            downloadStatus {
                state
            }
        }
    }
`;

export const DOWNLOAD_AHEAD = gql`
    mutation DOWNLOAD_AHEAD($input: DownloadAheadInput!) {
        downloadAhead(input: $input) {
            clientMutationId
        }
    }
`;
