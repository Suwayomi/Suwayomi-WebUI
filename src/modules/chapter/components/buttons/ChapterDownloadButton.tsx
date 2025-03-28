/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { ChapterIdInfo, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

export const ChapterDownloadButton = ({
    chapterId,
    isDownloaded,
}: {
    chapterId: ChapterIdInfo['id'];
    isDownloaded: boolean;
}) => {
    const { t } = useTranslation();
    const download = Chapters.useDownloadStatusFromCache(chapterId);

    const downloadChapter = () => {
        requestManager
            .addChapterToDownloadQueue(chapterId)
            .response.catch((e) =>
                makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
            );
    };

    if (download == null && isDownloaded) {
        return null;
    }

    return (
        <CustomTooltip title={t('chapter.action.download.add.label.action')}>
            <IconButton
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    downloadChapter();
                }}
            >
                <DownloadIcon />
            </IconButton>
        </CustomTooltip>
    );
};
