/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import React from 'react';

interface DownloadStateIndicatorProps {
    download: IDownloadChapter;
}

const DownloadStateIndicator: React.FC<DownloadStateIndicatorProps> = ({ download }) => (
    <Box
        sx={{
            position: 'relative',
            display: 'inline-flex',
            width: '50px',
            justifyContent: 'center',
        }}
    >
        {download.progress !== 0 && <CircularProgress variant="determinate" value={download.progress * 100} />}
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
            <Typography variant="caption" component="div" color="text.secondary">
                {download.progress !== 0 && `${Math.round(download.progress * 100)}%`}
                {download.progress === 0 && download.state}
            </Typography>
        </Box>
    </Box>
);

export default DownloadStateIndicator;
