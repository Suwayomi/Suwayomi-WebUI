/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { DownloadState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { useHover } from '@mantine/hooks';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

const DOWNLOAD_STATE_TO_TRANSLATION_MAP: { [state in DownloadState]: MessageDescriptor } = {
    DOWNLOADING: msg`Downloading`,
    ERROR: msg`Error`,
    FINISHED: msg`Finished`,
    QUEUED: msg`Queued`,
} as const;

export const DownloadStateIndicatorCircular = ({
    chapterId,
    color,
}: {
    chapterId: ChapterIdInfo['id'];
    color?: string;
}) => {
    const { t } = useLingui();

    const { ref, hovered } = useHover();

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
            ref={ref}
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
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color, position: 'absolute', opacity: Number(!hovered) }}
                >
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
                <CustomTooltip title={t`Cancel`}>
                    <IconButton
                        sx={{ opacity: Number(hovered) }}
                        color="inherit"
                        {...MUIUtil.preventRippleProp()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            Chapters.cancelDownload([chapterId]);
                        }}
                    >
                        <ClearIcon />
                    </IconButton>
                </CustomTooltip>
            </Box>
        </Box>
    );
};
