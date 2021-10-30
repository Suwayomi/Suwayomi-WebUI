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
            backgroundColor: theme.palette.action.hover,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        '&:active': {
            backgroundColor: theme.palette.action.selected,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
    },
}));

interface IProps{
    chapter: IChapter
    triggerChaptersUpdate: () => void
    downloadStatusString: string
}

export default function ChapterCard(props: IProps) {
    const classes = useStyles();
    const theme = useTheme();
    const { chapter, triggerChaptersUpdate, downloadStatusString } = props;

    const dateStr = chapter.uploadDate && new Date(chapter.uploadDate).toISOString().slice(0, 10);

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
        client.patch(`/api/v1/manga/${chapter.mangaId}/chapter/${chapter.index}`, formData)
            .then(() => triggerChaptersUpdate());
    };

    const downloadChapter = () => {
        client.get(`/api/v1/download/${chapter.mangaId}/chapter/${chapter.index}`);
        handleClose();
    };

    const deleteChapter = () => {
        client.delete(`/api/v1/manga/${chapter.mangaId}/chapter/${chapter.index}`)
            .then(() => triggerChaptersUpdate());

        handleClose();
    };

    const readChapterColor = theme.palette.mode === 'dark' ? '#acacac' : '#b0b0b0';
    return (
        <>
            <li>
                <Card className={classes.card}>
                    <CardContent className={classes.root}>
                        <Link
                            to={`/manga/${chapter.mangaId}/chapter/${chapter.index}`}
                            style={{
                                textDecoration: 'none',
                                color: chapter.read ? readChapterColor : theme.palette.text.primary,
                            }}
                        >
                            <div style={{ display: 'flex' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" component="h2">
                                        <span style={{ color: theme.palette.primary.dark }}>
                                            {chapter.bookmarked && <BookmarkIcon />}
                                        </span>
                                        {chapter.name}
                                    </Typography>
                                    <Typography variant="caption" display="block" gutterBottom>
                                        {chapter.scanlator}
                                        {chapter.scanlator && ' '}
                                        {dateStr}
                                        {downloadStatusString}
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
                            {downloadStatusString.endsWith('Downloaded')
                            && <MenuItem onClick={deleteChapter}>Delete</MenuItem>}
                            {downloadStatusString.length === 0
                        && <MenuItem onClick={downloadChapter}>Download</MenuItem> }
                            <MenuItem onClick={() => sendChange('bookmarked', !chapter.bookmarked)}>
                                {chapter.bookmarked && 'Remove bookmark'}
                                {!chapter.bookmarked && 'Bookmark'}
                            </MenuItem>
                            <MenuItem onClick={() => sendChange('read', !chapter.read)}>
                                {`Mark as ${chapter.read && 'unread'} ${!chapter.read && 'read'}`}
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
