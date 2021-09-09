/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import client from 'util/client';

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
    },
    card: {
        margin: '10px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transition: 'background-color 0ms ease',
        },
        '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transition: 'background-color 100ms ease-out',
        },
    },
}));

interface IProps{
    episode: IEpisode
    triggerEpisodesUpdate: () => void
}

export default function EpisodeCard(props: IProps) {
    const classes = useStyles();
    const theme = useTheme();
    const { episode, triggerEpisodesUpdate } = props;

    const dateStr = episode.uploadDate && new Date(episode.uploadDate).toISOString().slice(0, 10);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const sendChange = (key: string, value: any) => {
        handleClose();

        const formData = new FormData();
        formData.append(key, value);
        client.patch(`/api/v1/anime/anime/${episode.animeId}/episode/${episode.index}`, formData)
            .then(() => triggerEpisodesUpdate());
    };

    const readChapterColor = theme.palette.mode === 'dark' ? '#acacac' : '#b0b0b0';
    return (
        <>
            <li>
                <Card className={classes.card}>
                    <CardContent className={classes.root}>
                        <Link
                            to={`/anime/${episode.animeId}/episode/${episode.index}`}
                            style={{
                                textDecoration: 'none',
                                color: episode.read ? readChapterColor : theme.palette.text.primary,
                            }}
                        >
                            <div style={{ display: 'flex' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" component="h2">
                                        <span style={{ color: theme.palette.primary.dark }}>
                                            {episode.bookmarked && <BookmarkIcon />}
                                        </span>
                                        {episode.name}
                                        {episode.episodeNumber > 0 && ` : ${episode.episodeNumber}`}
                                    </Typography>
                                    <Typography variant="caption" display="block" gutterBottom>
                                        {episode.scanlator}
                                        {episode.scanlator && ' '}
                                        {dateStr}
                                    </Typography>
                                </div>
                            </div>
                        </Link>

                        <IconButton aria-label="more" onClick={handleClick} size="large">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {/* <MenuItem onClick={handleClose}>Download</MenuItem> */}
                            <MenuItem onClick={() => sendChange('bookmarked', !episode.bookmarked)}>
                                {episode.bookmarked && 'Remove bookmark'}
                                {!episode.bookmarked && 'Bookmark'}
                            </MenuItem>
                            <MenuItem onClick={() => sendChange('read', !episode.read)}>
                                Mark as
                                {' '}
                                {episode.read && 'unread'}
                                {!episode.read && 'read'}
                            </MenuItem>
                            <MenuItem onClick={() => sendChange('markPrevRead', true)}>
                                Mark previous as Read
                            </MenuItem>
                        </Menu>
                    </CardContent>
                </Card>
            </li>
        </>
    );
}
