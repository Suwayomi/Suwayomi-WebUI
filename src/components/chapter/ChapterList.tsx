/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, styled } from '@mui/system';
import { Virtuoso } from 'react-virtuoso';
import Typography from '@mui/material/Typography';
import { CircularProgress, Stack } from '@mui/material';
import makeToast from 'components/util/Toast';
import ChapterOptions from 'components/chapter/ChapterOptions';
import ChapterCard from 'components/chapter/ChapterCard';
import { useReducerLocalStorage } from 'util/useLocalStorage';
import {
    chapterOptionsReducer, defaultChapterOptions, findFirstUnreadChapter,
    filterAndSortChapters,
} from 'components/chapter/util';
import ResumeFab from 'components/chapter/ResumeFAB';
import useFetchChapters from './useFetchChapters';

const CustomVirtuoso = styled(Virtuoso)(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    minHeight: '200px',
    [theme.breakpoints.up('md')]: {
        width: '50vw',
        // 64px for the Appbar, 40px for the ChapterCount Header
        height: 'calc(100vh - 64px - 40px)',
        margin: 0,
    },
}));

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');
const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

interface IProps {
    id: string
}

export default function ChapterList(props: IProps) {
    const { id } = props;

    const [chapters, triggerChaptersUpdate, noChaptersFound] = useFetchChapters(id);
    const [firstUnreadChapter, setFirstUnreadChapter] = useState<IChapter>();
    const [filteredChapters, setFilteredChapters] = useState<IChapter[]>([]);
    // eslint-disable-next-line max-len
    const [options, optionsDispatch] = useReducerLocalStorage<ChapterListOptions, ChapterOptionsReducerAction>(
        chapterOptionsReducer, `${id}filterOptions`, defaultChapterOptions,
    );

    const [, setWsClient] = useState<WebSocket>();
    const [{ queue }, setQueueState] = useState<IQueue>(initialQueue);

    useEffect(() => {
        const wsc = new WebSocket(`${baseWebsocketUrl}/api/v1/downloads`);
        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as IQueue;
            setQueueState(data);
        };

        setWsClient(wsc);

        return () => wsc.close();
    }, []);

    useEffect(() => {
        triggerChaptersUpdate();
    }, [queue.length]);

    const downloadStatusStringFor = useCallback((chapter: IChapter) => {
        let rtn = '';
        if (chapter.downloaded) {
            rtn = ' • Downloaded';
        }
        queue.forEach((q) => {
            if (chapter.index === q.chapterIndex && chapter.mangaId === q.mangaId) {
                rtn = ` • Downloading (${(q.progress * 100).toFixed(2)}%)`;
            }
        });
        return rtn;
    }, [queue]);

    useEffect(() => {
        const filtered = filterAndSortChapters(chapters, options);
        setFilteredChapters(filtered);
        setFirstUnreadChapter(findFirstUnreadChapter(filtered));
    }, [options, chapters]);

    useEffect(() => {
        if (noChaptersFound) {
            makeToast('No chapters found', 'warning');
        }
    }, [noChaptersFound]);

    if (chapters.length === 0 || noChaptersFound) {
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

    return (
        <>
            <Stack direction="column">
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', px: 1.5, mt: 1,
                }}
                >
                    <Typography variant="h5">
                        {`${filteredChapters.length} Chapters`}
                    </Typography>
                    <ChapterOptions options={options} optionsDispatch={optionsDispatch} />
                </Box>

                <CustomVirtuoso
                    style={{ // override Virtuoso default values and set them with class
                        height: 'undefined',
                        // 900 is the md breakpoint in MUI
                        overflowY: window.innerWidth < 900 ? 'visible' : 'auto',
                    }}
                    totalCount={filteredChapters.length}
                    itemContent={(index:number) => (
                        <ChapterCard
                            showChapterNumber={options.showChapterNumber}
                            chapter={filteredChapters[index]}
                            downloadStatusString={downloadStatusStringFor(filteredChapters[index])}
                            triggerChaptersUpdate={triggerChaptersUpdate}
                        />
                    )}
                    useWindowScroll={window.innerWidth < 900}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {firstUnreadChapter && <ResumeFab chapter={firstUnreadChapter} mangaId={id} />}
        </>
    );
}
