/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import DownloadIcon from '@mui/icons-material/Download';
import { CardActionArea } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import NavbarContext from 'components/context/NavbarContext';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import React, {
    useContext, useEffect, useRef, useState,
} from 'react';
import { Link, useHistory } from 'react-router-dom';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';

function epochToDate(epoch: number) {
    const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epoch);
    return date;
}

function isTheSameDay(first:Date, second:Date) {
    return first.getDate() === second.getDate()
    && first.getMonth() === second.getMonth()
    && first.getFullYear() === second.getFullYear();
}

function getDateString(date: Date) {
    const today = new Date();
    if (isTheSameDay(today, date)) return 'TODAY';
    // calculate yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isTheSameDay(yesterday, date)) return 'YESTERDAY';
    return date.toLocaleDateString();
}

function groupByDate(updates: IMangaChapter[]):
[string, { item: IMangaChapter, globalIdx: number }[] ][] {
    if (updates.length === 0) return [];

    const groups = {};
    updates.forEach((item, globalIdx) => {
        const key = getDateString(epochToDate(item.chapter.fetchedAt));
        // @ts-ignore
        if (groups[key] === undefined) groups[key] = [];
        // @ts-ignore
        groups[key].push({ item, globalIdx });
    });

    // @ts-ignore
    return Object.keys(groups).map((key) => [key, groups[key]]);
}

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');
const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

const Updates: React.FC = () => {
    const history = useHistory();

    const { setTitle, setAction } = useContext(NavbarContext);
    const [updateEntries, setUpdateEntries] = useState<IMangaChapter[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [fetched, setFetched] = useState(false);
    const [lastPageNum, setLastPageNum] = useState(0);

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

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
        setTitle('Updates');

        setAction(<></>);
    }, []);

    useEffect(() => {
        if (hasNextPage) {
            client.get(`/api/v1/update/recentChapters/${lastPageNum}`)
                .then((response) => response.data)
                .then(({ hasNextPage: fetchedHasNextPage, page }: PaginatedList<IMangaChapter>) => {
                    setUpdateEntries([
                        ...updateEntries,
                        ...page,
                    ]);
                    setHasNextPage(fetchedHasNextPage);
                    setFetched(true);
                });
        }
    }, [lastPageNum]);

    const lastEntry = useRef<HTMLDivElement>(null);

    const scrollHandler = () => {
        if (lastEntry.current) {
            const rect = lastEntry.current.getBoundingClientRect();
            if (((rect.y + rect.height) / window.innerHeight < 2) && hasNextPage) {
                setLastPageNum(lastPageNum + 1);
            }
        }
    };
    useEffect(() => {
        window.addEventListener('scroll', scrollHandler, true);
        return () => {
            window.removeEventListener('scroll', scrollHandler, true);
        };
    }, [hasNextPage, updateEntries]);

    if (!fetched) { return <LoadingPlaceholder />; }
    if (fetched && updateEntries.length === 0) { return <EmptyView message="You don't have any updates yet." />; }

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

    const downloadChapter = (chapter: IChapter) => {
        client.get(`/api/v1/download/${chapter.mangaId}/chapter/${chapter.index}`);
    };

    return (
        <>
            {groupByDate(updateEntries).map((dateGroup) => (
                <div key={dateGroup[0]}>
                    <Typography
                        variant="h5"
                        sx={{
                            ml: 3,
                            my: 2,
                            fontWeight: 700,
                        }}
                    >
                        {dateGroup[0]}
                    </Typography>
                    {dateGroup[1].map(({ item: { chapter, manga }, globalIdx }) => (
                        <Card
                            ref={globalIdx === updateEntries.length - 1 ? lastEntry : undefined}
                            key={globalIdx}
                            sx={{ margin: '10px' }}
                        >
                            <CardActionArea
                                component={Link}
                                to={{ pathname: `/manga/${chapter.mangaId}/chapter/${chapter.index}`, state: history.location.state }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex' }}>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                flex: '0 0 auto',
                                                marginRight: 2,
                                                imageRendering: 'pixelated',
                                            }}
                                            src={`${serverAddress}${manga.thumbnailUrl}?useCache=${useCache}`}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="h5" component="h2">
                                                {manga.title}
                                            </Typography>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                {chapter.name}
                                                {downloadStatusStringFor(chapter)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {downloadStatusStringFor(chapter) === ''
                                        && (
                                            <IconButton
                                                onClick={(e) => {
                                                    downloadChapter(chapter);
                                                    // prevent parent tags from getting the event
                                                    e.stopPropagation();
                                                }}
                                                size="large"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </div>
            ))}
        </>
    );
};

export default Updates;
