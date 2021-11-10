/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, {
    useContext, useEffect, useState, useRef,
} from 'react';
import { useHistory } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    icon: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        flex: '0 0 auto',
        marginRight: 16,
        imageRendering: 'pixelated',
    },
    card: {
        margin: '10px',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        '&:active': {
            backgroundColor: theme.palette.action.selected,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
    },
}));

function epochToDate(epoch: number) {
    const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epoch);
    return date;
}

function isTheSameDay(first: Date, second: Date) {
    return (
        first.getDate() === second.getDate()
        && first.getMonth() === second.getMonth()
        && first.getFullYear() === second.getFullYear()
    );
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

function groupByDate(updates: IMangaChapter[]): [string, IMangaChapter[]][] {
    if (updates.length === 0) return [];

    const groups = {};
    updates.forEach((item) => {
        const key = getDateString(epochToDate(item.chapter.fetchedAt));
        // @ts-ignore
        if (groups[key] === undefined) groups[key] = [];
        // @ts-ignore
        groups[key].push(item);
    });

    // @ts-ignore
    return Object.keys(groups).map((key) => [key, groups[key]]);
}

function resolveDateGroups(prev:[string, IMangaChapter[]][],
    newGroup:[string, IMangaChapter[]][])
    :[string, IMangaChapter[]][] {
    const lastDateGroup = prev[prev.length - 1];
    if (lastDateGroup[0] === newGroup[0][0]) {
        lastDateGroup[1] = lastDateGroup[1].concat(newGroup[0][1]);
    }
    return [...prev, ...newGroup.slice(1)];
}

const baseWebsocketUrl = JSON.parse(
    window.localStorage.getItem('serverBaseURL')!,
).replace('http', 'ws');
const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

export default function Updates() {
    const classes = useStyles();
    const history = useHistory();

    const { setTitle, setAction } = useContext(NavbarContext);
    const [updateEntries, setUpdateEntries] = useState<
    [string, IMangaChapter[]][]
    >([]);

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    const [, setWsClient] = useState<WebSocket>();
    const [{ queue }, setQueueState] = useState<IQueue>(initialQueue);

    const [pageNum, setPageNum] = useState(0);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    // eslint-disable-next-line max-len

    const [lastElement, setLastElement] = useState<Element | null>(null);

    const observer = useRef(
        new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting) {
                if (hasNextPage) setPageNum((no) => no + 1);
            }
        }),
    );

    useEffect(() => {
        const wsc = new WebSocket(`${baseWebsocketUrl}/api/v1/downloads`);
        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as IQueue;
            setQueueState(data);
        };

        setWsClient(wsc);

        return () => wsc.close();
    }, []);

    const getUpdates = async () => client
        .get(`/api/v1/update/recentChapters/${pageNum}`)
        .then((response) => {
            setHasNextPage(response.data.hasNextPage);
            return response.data.page as IMangaChapter[];
        });

    useEffect(() => {
        setTitle('Updates');

        setAction(<></>);
        getUpdates();
    }, []);

    useEffect(() => {
        async function setUpdates() {
            const newEntries = await getUpdates();
            setUpdateEntries((prev) => {
                const newGroups = groupByDate(newEntries);
                // for firstTime
                if (prev.length === 0) return newGroups;
                return resolveDateGroups(prev, newGroups);
            });
        }
        setUpdates();
    }, [pageNum]);

    // This will set an observer on the last dateGroup
    // which will trigger an increment in pageNum when the last DateElement is visible
    // which will trigger the next request
    useEffect(() => {
        const currentElement = lastElement;
        const currentObserver = observer.current;

        if (currentElement) {
            currentObserver.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [lastElement]);

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
            {updateEntries.map((dateGroup, i) => (
                <div key={dateGroup[0]}>
                    {i === updateEntries.length - 1 && hasNextPage ? (
                    // eslint-disable-next-line max-len
                        <h1 ref={setLastElement} style={{ marginLeft: 25 }}>
                            {dateGroup[0]}
                        </h1>
                    ) : (
                        <h1 style={{ marginLeft: 25 }}>{dateGroup[0]}</h1>
                    )}
                    {dateGroup[1].map(({ chapter, manga }) => (
                        <Card
                            key={`${manga.title}-${chapter.name}`}
                            className={classes.card}
                            onClick={() => history.push(
                                `/manga/${chapter.mangaId}/chapter/${chapter.index}`,
                            )}
                        >
                            <CardContent className={classes.root}>
                                <div style={{ display: 'flex' }}>
                                    <Avatar
                                        variant="rounded"
                                        className={classes.icon}
                                        src={`${serverAddress}${manga.thumbnailUrl}?useCache=${useCache}`}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h5" component="h2">
                                            {manga.title}
                                        </Typography>
                                        <Typography variant="caption" display="block" gutterBottom>
                                            {chapter.name}
                                            {downloadStatusStringFor(chapter)}
                                        </Typography>
                                    </div>
                                </div>
                                {downloadStatusStringFor(chapter) === '' && (
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
                        </Card>
                    ))}
                </div>
            ))}
        </>
    );
}
