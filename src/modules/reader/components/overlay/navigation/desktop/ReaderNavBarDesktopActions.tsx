/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { actionToTranslationKey } from '@/modules/chapter/services/Chapters.ts';

export const ReaderNavBarDesktopActions = ({ chapter }: Pick<ReaderNavBarDesktopProps, 'chapter'>) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'center', gap: 1 }}>
            <Tooltip title={t(actionToTranslationKey[chapter.isBookmarked ? 'unbookmark' : 'bookmark'].action.single)}>
                <IconButton color="inherit">
                    {chapter.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('reader.button.retry_load_pages')}>
                <IconButton color="inherit">
                    <ReplayIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={t(actionToTranslationKey.download.action.single)}>
                <IconButton color="inherit">
                    <DownloadIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={t('chapter.action.label.open_on_source')}>
                <IconButton color="inherit">
                    <OpenInNewIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};
