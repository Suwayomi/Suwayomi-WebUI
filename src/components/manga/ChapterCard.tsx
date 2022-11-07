/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkAdd from '@mui/icons-material/BookmarkAdd';
import BookmarkRemove from '@mui/icons-material/BookmarkRemove';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Delete from '@mui/icons-material/Delete';
import Done from '@mui/icons-material/Done';
import DoneAll from '@mui/icons-material/DoneAll';
import Download from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveDone from '@mui/icons-material/RemoveDone';
import {
    LinearProgress,
    Checkbox, ListItemIcon, ListItemText, Stack,
} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link } from 'react-router-dom';
import client from 'util/client';

interface IProps{
    chapter: IChapter
    triggerChaptersUpdate: () => void
    downloadChapter: IDownloadChapter | undefined
    showChapterNumber: boolean
    onSelect: (selected: boolean) => void
    selected: boolean | null
}

const ChapterCard: React.FC<IProps> = (props: IProps) => {
    const theme = useTheme();

    const {
        chapter, triggerChaptersUpdate, downloadChapter: dc, showChapterNumber, onSelect, selected,
    } = props;
    const isSelecting = selected !== null;

    const dateStr = chapter.uploadDate && new Date(chapter.uploadDate).toLocaleDateString();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // prevent parent tags from getting the event
        event.stopPropagation();
        event.preventDefault();

        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const sendChange = (key: string, value: any) => {
        handleClose();

        const formData = new FormData();
        formData.append(key, value);
        if (key === 'read') { formData.append('lastPageRead', '1'); }
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

    const handleSelect = () => {
        onSelect(true);
        handleClose();
    };

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isSelecting) {
            event.preventDefault();
            event.stopPropagation();
            onSelect(!selected);
        }
    };

    const isDownloaded = chapter.downloaded;
    const canBeDownloaded = !chapter.downloaded && dc === undefined;

    return (
        <li>
            <Card
                sx={{
                    position: 'relative',
                    margin: 1,
                    ':hover': {
                        backgroundColor: 'action.hover',
                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                        cursor: 'pointer',
                    },
                    ':active': {
                        backgroundColor: 'action.selected',
                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    },
                }}
            >
                <Link
                    to={`/manga/${chapter.mangaId}/chapter/${chapter.index}`}
                    style={{
                        textDecoration: 'none',
                        color: theme.palette.text[chapter.read ? 'disabled' : 'primary'],
                    }}
                    onClick={handleClick}
                >
                    <CardContent
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 2,
                            '&:last-child': { pb: 2 },
                        }}
                    >
                        <Stack direction="column" flex={1}>
                            <Typography variant="h5" component="h2">
                                {chapter.bookmarked && (
                                    <BookmarkIcon color="primary" sx={{ mr: 0.5, position: 'relative', top: '0.15em' }} />
                                )}
                                { showChapterNumber ? `Chapter ${chapter.chapterNumber}` : chapter.name}
                            </Typography>
                            <Typography variant="caption">
                                {chapter.scanlator}
                            </Typography>
                            <Typography variant="caption">
                                {dateStr}
                                {isDownloaded && ' • Downloaded'}
                                {dc && ` • Downloading (${(dc.progress * 100).toFixed(2)}%)`}
                            </Typography>
                        </Stack>

                        {selected === null ? (
                            <IconButton aria-label="more" onClick={handleMenuClick} size="large">
                                <MoreVertIcon />
                            </IconButton>
                        ) : (
                            <Checkbox checked={selected} />
                        )}
                    </CardContent>
                </Link>
                {dc != null && (
                    <LinearProgress
                        sx={{
                            position: 'absolute', bottom: 0, width: '100%', opacity: 0.5,
                        }}
                        variant="determinate"
                        value={dc.progress * 100}
                        color="inherit"
                    />
                )}
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleSelect}>
                        <ListItemIcon>
                            <CheckBoxOutlineBlank fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                            Select
                        </ListItemText>
                    </MenuItem>
                    {isDownloaded && (
                        <MenuItem onClick={deleteChapter}>
                            <ListItemIcon>
                                <Delete fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                Delete
                            </ListItemText>
                        </MenuItem>
                    )}
                    {canBeDownloaded && (
                        <MenuItem onClick={downloadChapter}>
                            <ListItemIcon>
                                <Download fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                                Download
                            </ListItemText>
                        </MenuItem>
                    ) }
                    <MenuItem onClick={() => sendChange('bookmarked', !chapter.bookmarked)}>
                        <ListItemIcon>
                            {chapter.bookmarked && <BookmarkRemove fontSize="small" />}
                            {!chapter.bookmarked && <BookmarkAdd fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                            {chapter.bookmarked && 'Remove bookmark'}
                            {!chapter.bookmarked && 'Add bookmark'}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => sendChange('read', !chapter.read)}>
                        <ListItemIcon>
                            {chapter.read && <RemoveDone fontSize="small" />}
                            {!chapter.read && <Done fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                            {chapter.read && 'Mark as unread'}
                            {!chapter.read && 'Mark as read'}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => sendChange('markPrevRead', true)}>
                        <ListItemIcon>
                            <DoneAll fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                            Mark previous as Read
                        </ListItemText>
                    </MenuItem>
                </Menu>
            </Card>
        </li>
    );
};

export default ChapterCard;
