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
import { useMemo, useRef } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { DownloadStatusFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';

const DownloadButton = ({
    currentChapter,
    downloadChapter,
}: Required<Pick<ReaderStateChapters, 'currentChapter'>> & {
    downloadChapter?: DownloadStatusFieldsFragment['queue'][number];
}) => {
    const { t } = useTranslation();

    if (currentChapter && Chapters.isDownloaded(currentChapter)) {
        return (
            <Tooltip title={t(actionToTranslationKey.delete.action.single)}>
                <IconButton onClick={() => Chapters.performAction('delete', [currentChapter.id], {})} color="inherit">
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        );
    }

    if (downloadChapter) {
        return <DownloadStateIndicator download={downloadChapter} />;
    }

    return (
        <Tooltip title={t(actionToTranslationKey.download.action.single)}>
            <IconButton
                disabled={!currentChapter}
                onClick={() => Chapters.performAction('download', [currentChapter?.id ?? -1], {})}
                color="inherit"
            >
                <DownloadIcon />
            </IconButton>
        </Tooltip>
    );
};

export const ReaderNavBarDesktopActions = ({
    currentChapter,
    pageLoadStates,
    setPageLoadStates,
    setRetryFailedPagesKeyPrefix,
}: Required<Pick<ReaderStateChapters, 'currentChapter'>> &
    Pick<ReaderStatePages, 'pageLoadStates' | 'setPageLoadStates' | 'setRetryFailedPagesKeyPrefix'>) => {
    const { id, isBookmarked, realUrl } = currentChapter ?? { id: -1, isBookmarked: false, realUrl: '' };

    const { t } = useTranslation();

    const pageRetryKeyPrefix = useRef<number>(0);

    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const downloadChapter = useMemo(
        () => queue.find((queueItem) => queueItem.chapter.id === currentChapter?.id),
        [queue, id],
    );

    const haveSomePagesFailedToLoad = useMemo(
        () => pageLoadStates.some((pageLoadState) => pageLoadState.error),
        [pageLoadStates],
    );

    const bookmarkAction: Extract<ChapterAction, 'unbookmark' | 'bookmark'> = isBookmarked ? 'unbookmark' : 'bookmark';

    return (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'center', gap: 1 }}>
            <Tooltip title={t(actionToTranslationKey[bookmarkAction].action.single)}>
                <IconButton onClick={() => Chapters.performAction(bookmarkAction, [id], {})} color="inherit">
                    {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </Tooltip>
            <Tooltip title={t('reader.button.retry_load_pages')}>
                <IconButton
                    onClick={() => {
                        setPageLoadStates((statePageLoadStates) =>
                            statePageLoadStates.map((pageLoadState) => ({ loaded: pageLoadState.loaded })),
                        );
                        setRetryFailedPagesKeyPrefix(`${pageRetryKeyPrefix.current}`);
                        pageRetryKeyPrefix.current = (pageRetryKeyPrefix.current + 1) % 1000;
                    }}
                    disabled={!haveSomePagesFailedToLoad}
                    color="inherit"
                >
                    <ReplayIcon />
                </IconButton>
            </Tooltip>
            <DownloadButton currentChapter={currentChapter} downloadChapter={downloadChapter} />
            <Tooltip title={t('chapter.action.label.open_on_source')}>
                <IconButton disabled={!realUrl} href={realUrl ?? ''} rel="noreferrer" target="_blank" color="inherit">
                    <OpenInNewIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};
