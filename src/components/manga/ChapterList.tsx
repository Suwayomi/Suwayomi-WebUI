/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { CircularProgress, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import {
    Box, styled,
} from '@mui/system';
import useSubscription from 'components/library/useSubscription';
import ChapterCard from 'components/manga/ChapterCard';
import ResumeFab from 'components/manga/ResumeFAB';
import { filterAndSortChapters } from 'components/manga/util';
import EmptyView from 'components/util/EmptyView';
import React, {
    useCallback, useEffect, useMemo, useRef,
} from 'react';
import { Virtuoso } from 'react-virtuoso';

const StyledVirtuoso = styled(Virtuoso)(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    minHeight: '200px',
    [theme.breakpoints.up('md')]: {
        width: '50vw',
        // 64px for the Appbar, 48px for the ChapterCount Header
        height: 'calc(100vh - 64px - 48px)',
        margin: 0,
    },
}));

interface IProps {
    id: string
    chapters: IChapter[]
    onRefresh: () => void;
    options: ChapterListOptions;
    loading: boolean;
}

const ChapterList: React.FC<IProps> = ({
    id, chapters, onRefresh, options, loading,
}) => {
    const prevQueueRef = useRef<IDownloadChapter[]>();
    const queue = useSubscription<IQueue>('/api/v1/downloads').data?.queue;

    const downloadStatusStringFor = useCallback((chapter: IChapter) => {
        let rtn = '';
        if (chapter.downloaded) {
            rtn = ' • Downloaded';
        }
        queue?.forEach((q) => {
            if (chapter.index === q.chapterIndex && chapter.mangaId === q.mangaId) {
                rtn = ` • Downloading (${(q.progress * 100).toFixed(2)}%)`;
            }
        });
        return rtn;
    }, [queue]);

    useEffect(() => {
        if (prevQueueRef.current && queue) {
            const prevQueue = prevQueueRef.current;
            const changedDownloads = queue.filter((cd) => {
                const prevChapterDownload = prevQueue
                    .find((pcd) => cd.chapterIndex === pcd.chapterIndex
                        && cd.mangaId === pcd.mangaId);
                if (!prevChapterDownload) return true;
                return cd.state !== prevChapterDownload.state;
            });

            if (changedDownloads.length > 0) {
                onRefresh();
            }
        }

        prevQueueRef.current = queue;
    }, [queue]);

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), //
        [chapters, options]);

    const firstUnreadChapter = useMemo(() => visibleChapters.slice()
        .reverse()
        .find((c) => c.read === false),
    [visibleChapters]);

    if (loading) {
        return (
            <div style={{
                margin: '10px auto',
                display: 'flex',
                justifyContent: 'center',
            }}
            >
                <CircularProgress thickness={5} />
            </div>
        );
    }

    const noChaptersFound = chapters.length === 0;
    const noChaptersMatchingFilter = !noChaptersFound && visibleChapters.length === 0;

    return (
        <>
            <Stack direction="column" sx={{ position: 'relative' }}>
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', px: 1.5, mt: 1,
                }}
                >
                    <Typography variant="h5">
                        {`${visibleChapters.length} Chapter${visibleChapters.length === 1 ? '' : 's'}`}
                    </Typography>
                </Box>

                {noChaptersFound && (
                    <EmptyView message="No chapters found" />
                )}
                {noChaptersMatchingFilter && (
                    <EmptyView message="No chapters matching filter" />
                )}

                <StyledVirtuoso
                    style={{ // override Virtuoso default values and set them with class
                        height: 'undefined',
                        // 900 is the md breakpoint in MUI
                        overflowY: window.innerWidth < 900 ? 'visible' : 'auto',
                    }}
                    totalCount={visibleChapters.length}
                    itemContent={(index:number) => (
                        <ChapterCard
                            showChapterNumber={options.showChapterNumber}
                            chapter={visibleChapters[index]}
                            downloadStatusString={downloadStatusStringFor(visibleChapters[index])}
                            triggerChaptersUpdate={onRefresh}
                        />
                    )}
                    useWindowScroll={window.innerWidth < 900}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {firstUnreadChapter && <ResumeFab chapter={firstUnreadChapter} mangaId={id} />}
        </>
    );
};

export default ChapterList;
