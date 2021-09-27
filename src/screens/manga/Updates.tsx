/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import NavbarContext from 'context/NavbarContext';
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

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');
const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

export default function Updates() {
    const classes = useStyles();
    const history = useHistory();

    const { setTitle, setAction } = useContext(NavbarContext);
    const [updateEntries, setUpdateEntries] = useState<IMangaChapter[]>([]);

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
        client.get('/api/v1/update/recentChapters')
            .then((response) => response.data)
            .then((updates: IMangaChapter[]) => {
                setUpdateEntries(updates);
            });
    }, []);

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
                    <h1 style={{ marginLeft: 25 }}>
                        {dateGroup[0]}
                    </h1>
                    {dateGroup[1].map(({ chapter, manga }) => (
                        <Card
                            key={`${manga.title}-${chapter.name}`}
                            className={classes.card}
                            onClick={() => history.push(`/manga/${chapter.mangaId}/chapter/${chapter.index}`)}
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
                        </Card>
                    ))}
                </div>
            ))}
        </>
    );
}
