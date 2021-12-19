/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect } from 'react';
import { Box, styled } from '@mui/system';
import { Virtuoso } from 'react-virtuoso';
import Typography from '@mui/material/Typography';
import { CircularProgress, Fab } from '@mui/material';
import { Link } from 'react-router-dom';
import makeToast from 'components/util/Toast';
import client from 'util/client';
import PlayArrow from '@mui/icons-material/PlayArrow';
import ChapterOptions from 'components/chapter/ChapterOptions';
import ChapterCard from 'components/chapter/ChapterCard';
import useLocalStorage from 'util/useLocalStorage';

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

function unreadFilter(unread: NullAndUndefined<boolean>, { read: isChapterRead }: IChapter) {
    switch (unread) {
        case true:
            return !isChapterRead;
        case false:
            return isChapterRead;
        default:
            return true;
    }
}

function downloadFilter(downloaded: NullAndUndefined<boolean>,
    { downloaded: chapterDownload }: IChapter) {
    switch (downloaded) {
        case true:
            return chapterDownload;
        case false:
            return !chapterDownload;
        default:
            return true;
    }
}

function bookmarkdFilter(bookmarked: NullAndUndefined<boolean>,
    { bookmarked: chapterBookmarked }: IChapter) {
    switch (bookmarked) {
        case true:
            return chapterBookmarked;
        case false:
            return !chapterBookmarked;
        default:
            return true;
    }
}

function findFirstUnreadChapter(chapters: IChapter[]): IChapter | undefined {
    for (let index = chapters.length - 1; index >= 0; index--) {
        if (!chapters[index].read) return chapters[index];
    }
    return undefined;
}

export default function ChapterList(props: IProps) {
    const { id } = props;

    const [chapters, setChapters] = useState<IChapter[]>([]);
    const [noChaptersFound, setNoChaptersFound] = useState(false);
    const [chapterUpdateTriggerer, setChapterUpdateTriggerer] = useState(0);
    const [fetchedOnline, setFetchedOnline] = useState(false);
    const [fetchedOffline, setFetchedOffline] = useState(false);
    const [firstUnreadChapter, setFirstUnreadChapter] = useState<IChapter>();
    const [filteredChapters, setFilteredChapters] = useState<IChapter[]>([]);
    const [options, setOptions] = useLocalStorage<ChapterListOptions>(
        `${id}filterOptions`,
        {
            active: false,
            unread: undefined,
            downloaded: undefined,
            bookmarked: undefined,
            reverse: false,
            sortBy: 'source',
            showChapterNumber: false,
        },
    );

    const [, setWsClient] = useState<WebSocket>();
    const [{ queue }, setQueueState] = useState<IQueue>(initialQueue);

    function triggerChaptersUpdate() {
        setChapterUpdateTriggerer(chapterUpdateTriggerer + 1);
    }

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

    const downloadStatusStringFor = (chapter: IChapter) => {
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
    };

    useEffect(() => {
        const shouldFetchOnline = fetchedOffline && !fetchedOnline;

        client.get(`/api/v1/manga/${id}/chapters?onlineFetch=${shouldFetchOnline}`)
            .then((response) => response.data)
            .then((data) => {
                if (data.length === 0 && fetchedOffline) {
                    makeToast('No chapters found', 'warning');
                    setNoChaptersFound(true);
                }
                setChapters(data);
            })
            .then(() => {
                if (shouldFetchOnline) {
                    setFetchedOnline(true);
                } else setFetchedOffline(true);
            });
    }, [fetchedOnline, fetchedOffline, chapterUpdateTriggerer]);

    useEffect(() => {
        const filtered = options.active
            ? chapters.filter((chp) => unreadFilter(options.unread, chp)
            && downloadFilter(options.downloaded, chp)
            && bookmarkdFilter(options.bookmarked, chp))
            : [...chapters];
        const Sorted = options.sortBy === 'fetchedAt'
            ? filtered.sort((a, b) => a.fetchedAt - b.fetchedAt)
            : filtered;
        if (options.reverse) {
            Sorted.reverse();
        }
        setFilteredChapters(Sorted);

        setFirstUnreadChapter(findFirstUnreadChapter(filtered));
    }, [options, chapters]);

    const ResumeFab = () => (firstUnreadChapter === undefined ? null
        : (
            <Fab
                sx={{ position: 'fixed', bottom: '2em', right: '3em' }}
                component={Link}
                variant="extended"
                color="primary"
                to={`/manga/${id}/chapter/${firstUnreadChapter.index}/page/${firstUnreadChapter.lastPageRead}`}
            >
                <PlayArrow />
                {firstUnreadChapter.index === 1 ? 'Start' : 'Resume' }
            </Fab>
        ));

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
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
            >
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', px: 1.5, mt: 1,
                }}
                >
                    <Typography variant="h5">
                        {`${filteredChapters.length} Chapters`}
                    </Typography>
                    <ChapterOptions options={options} setOptions={setOptions} />
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
            </Box>
            <ResumeFab />
        </>
    );
}
