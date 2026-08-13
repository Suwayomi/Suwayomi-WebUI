/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

export const DownloadStateIndicatorLinear = ({ chapterId }: { chapterId: ChapterIdInfo['id'] }) => {
    const download = Chapters.useDownloadStatusFromCache(chapterId);

    if (!download) {
        return null;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={download.progress * 100} />
        </Box>
    );
};
