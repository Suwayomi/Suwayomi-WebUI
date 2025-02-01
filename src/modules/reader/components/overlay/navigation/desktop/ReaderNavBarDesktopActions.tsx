/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import { memo, useMemo, useRef } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';

const DownloadButton = ({ currentChapter }: Required<Pick<ReaderStateChapters, 'currentChapter'>>) => {
    const { t } = useTranslation();

    const downloadStatus = Chapters.useDownloadStatusFromCache(currentChapter?.id ?? -1);

    if (currentChapter && Chapters.isDownloaded(currentChapter)) {
        return (
            <CustomTooltip title={t(actionToTranslationKey.delete.action.single)}>
                <IconButton onClick={() => Chapters.performAction('delete', [currentChapter.id], {})} color="inherit">
                    <DeleteIcon />
                </IconButton>
            </CustomTooltip>
        );
    }

    if (downloadStatus) {
        return <DownloadStateIndicator chapterId={downloadStatus.chapter.id} />;
    }

    return (
        <CustomTooltip title={t(actionToTranslationKey.download.action.single)} disabled={!currentChapter}>
            <IconButton
                disabled={!currentChapter}
                onClick={() => Chapters.performAction('download', [currentChapter?.id ?? -1], {})}
                color="inherit"
            >
                <DownloadIcon />
            </IconButton>
        </CustomTooltip>
    );
};

const BaseReaderNavBarDesktopActions = memo(
    ({
        currentChapter,
        pageLoadStates,
        setPageLoadStates,
        setRetryFailedPagesKeyPrefix,
    }: Required<Pick<ReaderStateChapters, 'currentChapter'>> &
        Pick<ReaderStatePages, 'pageLoadStates' | 'setPageLoadStates' | 'setRetryFailedPagesKeyPrefix'>) => {
        const { id, isBookmarked, realUrl } = currentChapter ?? { id: -1, isBookmarked: false, realUrl: '' };

        const { t } = useTranslation();

        const pageRetryKeyPrefix = useRef<number>(0);

        const haveSomePagesFailedToLoad = useMemo(
            () => pageLoadStates.some((pageLoadState) => pageLoadState.error),
            [pageLoadStates],
        );

        const bookmarkAction: Extract<ChapterAction, 'unbookmark' | 'bookmark'> = isBookmarked
            ? 'unbookmark'
            : 'bookmark';

        return (
            <Stack sx={{ flexDirection: 'row', justifyContent: 'center', gap: 1 }}>
                <CustomTooltip title={t(actionToTranslationKey[bookmarkAction].action.single)}>
                    <IconButton onClick={() => Chapters.performAction(bookmarkAction, [id], {})} color="inherit">
                        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                </CustomTooltip>
                <CustomTooltip title={t('reader.button.retry_load_pages')} disabled={!haveSomePagesFailedToLoad}>
                    <IconButton
                        onClick={() => {
                            setPageLoadStates((statePageLoadStates) =>
                                statePageLoadStates.map((pageLoadState) => ({
                                    url: pageLoadState.url,
                                    loaded: pageLoadState.loaded,
                                })),
                            );
                            setRetryFailedPagesKeyPrefix(`${pageRetryKeyPrefix.current}`);
                            pageRetryKeyPrefix.current = (pageRetryKeyPrefix.current + 1) % 1000;
                        }}
                        disabled={!haveSomePagesFailedToLoad}
                        color="inherit"
                    >
                        <ReplayIcon />
                    </IconButton>
                </CustomTooltip>
                <DownloadButton currentChapter={currentChapter} />
                <CustomTooltip title={t('chapter.action.label.open_on_source')} disabled={!realUrl}>
                    <IconButton
                        disabled={!realUrl}
                        href={realUrl ?? ''}
                        rel="noreferrer"
                        target="_blank"
                        color="inherit"
                    >
                        <OpenInNewIcon />
                    </IconButton>
                </CustomTooltip>
            </Stack>
        );
    },
);

export const ReaderNavBarDesktopActions = withPropsFrom(
    BaseReaderNavBarDesktopActions,
    [useReaderStateChaptersContext, userReaderStatePagesContext],
    ['currentChapter', 'pageLoadStates', 'setPageLoadStates', 'setRetryFailedPagesKeyPrefix'],
);
