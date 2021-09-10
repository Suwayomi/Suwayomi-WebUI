/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavbarContext from 'context/NavbarContext';
import client from 'util/client';

const useStyles = makeStyles({
    root: {
        width: 'calc(100vw - 10px)',
        height: 'calc(100vh - 64px)',
    },

    loading: {
        margin: '50px auto',
        display: 'flex',
        justifyContent: 'center',
    },

    video: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
});

const initialEpisode = () => ({
    index: -1, episodeCount: 0, videos: [],
});

export default function Player() {
    const classes = useStyles();

    const { episodeIndex, animeId } = useParams<{ episodeIndex: string, animeId: string }>();
    const [episode, setEpisode] = useState<IEpisode | IPartialEpisode>(initialEpisode());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [episodeLink, setEpisodeLink] = useState<string>('');
    const { setTitle } = useContext(NavbarContext);

    useEffect(() => {
        setTitle('Reader');
        client.get(`/api/v1/anime/anime/${animeId}/`)
            .then((response) => response.data)
            .then((data: IAnime) => {
                setTitle(data.title);
            });
    }, [episodeIndex]);

    useEffect(() => {
        setEpisode(initialEpisode);
        client.get(`/api/v1/anime/anime/${animeId}/episode/${episodeIndex}`)
            .then((response) => response.data)
            .then((data:IEpisode) => {
                setEpisode(data);
            });
    }, [episodeIndex]);

    // return spinner while chpater data is loading
    if (episode.videos.length === 0) {
        return (
            <div className={classes.loading}>
                <CircularProgress thickness={5} />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video className={classes.video} controls>
                {episode.videos.map((it) => (
                    <source src={it.videoUrl} />
                ))}
            </video>
        </div>
    );
}
