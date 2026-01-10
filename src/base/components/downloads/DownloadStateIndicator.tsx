/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { DownloadState } from '@/lib/graphql/generated/graphql.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

const DOWNLOAD_STATE_TO_TRANSLATION_MAP: { [state in DownloadState]: MessageDescriptor } = {
    DOWNLOADING: msg`Downloading`,
    ERROR: msg`Error`,
    FINISHED: msg`Finished`,
    QUEUED: msg`Queued`,
} as const;

export const DownloadStateIndicator = ({ chapterId, color }: { chapterId: ChapterIdInfo['id']; color?: string }) => {
    const { t } = useLingui();

    const download = Chapters.useDownloadStatusFromCache(chapterId);

    if (!download) {
        return null;
    }

    const isDownloading = download.state === DownloadState.Downloading;
    const isPartiallyDownloaded = download.progress !== 0;

    const progress = `${Math.round(download.progress * 100)}%`;
    const stateText = t(DOWNLOAD_STATE_TO_TRANSLATION_MAP[download.state]);

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                width: '50px',
                justifyContent: 'center',
            }}
        >
            {isDownloading && <CircularProgress variant="determinate" value={download.progress * 100} sx={{ color }} />}
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" sx={{ color }}>
                    <>
                        {isDownloading && progress}
                        {!isDownloading && (
                            <>
                                {stateText}
                                {isPartiallyDownloaded ? ` (${progress})` : ''}
                            </>
                        )}
                    </>
                </Typography>
            </Box>
        </Box>
    );
};
