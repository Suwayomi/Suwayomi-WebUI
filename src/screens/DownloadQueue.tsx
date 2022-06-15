/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import NavbarContext from 'components/context/NavbarContext';
import React, { useContext, useEffect, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import client from 'util/client';
import {
    DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle,
} from 'react-beautiful-dnd';
import { useTheme, Palette } from '@mui/material/styles';
import List from '@mui/material/List';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItem from '@mui/material/ListItem';
import { ListItemIcon } from '@mui/material';
import EmptyView from 'components/util/EmptyView';

import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');

const getItemStyle = (isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined, palette: Palette) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
        background: palette.mode === 'dark' ? '#424242' : 'rgb(235,235,235)',
    }),
});

const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

export default function DownloadQueue() {
    const [, setWsClient] = useState<WebSocket>();
    const [queueState, setQueueState] = useState<IQueue>(initialQueue);
    const { queue, status } = queueState;

    const history = useHistory();

    const theme = useTheme();

    const { setTitle, setAction } = useContext(NavbarContext);

    const toggleQueueStatus = () => {
        if (status === 'Stopped') {
            client.get('/api/v1/downloads/start');
        } else {
            client.get('/api/v1/downloads/stop');
        }
    };

    useEffect(() => {
        setTitle('Download Queue');

        setAction(() => {
            if (status === 'Stopped') {
                return (
                    <IconButton onClick={toggleQueueStatus} size="large">
                        <PlayArrowIcon />
                    </IconButton>
                );
            }
            return (
                <IconButton onClick={toggleQueueStatus} size="large">
                    <PauseIcon />
                </IconButton>
            );
        });
    }, [status]);

    useEffect(() => {
        const wsc = new WebSocket(`${baseWebsocketUrl}/api/v1/downloads`);
        wsc.onmessage = (e) => {
            setQueueState(JSON.parse(e.data));
        };

        setWsClient(wsc);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onDragEnd = (result: DropResult) => {
    };

    if (queue.length === 0) {
        return <EmptyView message="No downloads" />;
    }

    const callDeleteServer = (chapter: IChapter) => {
        // remove from download queue
        client.delete(`/api/v1/download/${chapter.mangaId}/chapter/${chapter.index}`);

        // delete partial download, should be handle server side?
        // bug: The folder and the last image downloaded are not deleted
        client.delete(`/api/v1/manga/${chapter.mangaId}/chapter/${chapter.index}`);
    };

    const deleteChapterQueue = (chapter: IChapter) => {
        // required to stop before deleting otherwise the download kept going. Server issue?
        client.get('/api/v1/downloads/stop')
            .then(() => callDeleteServer(chapter));
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <List ref={provided.innerRef}>
                            {queue.map((item, index) => (
                                <Draggable
                                    key={`${item.mangaId}-${item.chapterIndex}`}
                                    draggableId={`${item.mangaId}-${item.chapterIndex}`}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <ListItem
                                            ContainerProps={{ ref: provided.innerRef } as any}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                alignItems: 'flex-start',
                                                padding: 2,
                                                margin: '10px',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                    transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                                },
                                                '&:active': {
                                                    backgroundColor: 'action.selected',
                                                    transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                                },
                                            }}
                                            onClick={() => history.push(`/manga/${item.chapter.mangaId}`)}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style,
                                                theme.palette,
                                            )}
                                            ref={provided.innerRef}
                                        >
                                            <ListItemIcon sx={{ margin: 'auto 0' }}>
                                                <DragHandleIcon />
                                            </ListItemIcon>
                                            <Box sx={{ display: 'flex' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="h5" component="h2">
                                                        {item.manga.title}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" gutterBottom>
                                                        {`${item.chapter.name} `
                                                        + `(${(item.progress * 100).toFixed(2)}%)`
                                                        + ` => state: ${item.state}`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <IconButton
                                                sx={{ marginLeft: 'auto' }}
                                                onClick={(e) => {
                                                    // deleteCategory(index);
                                                    // prevent parent tags from getting the event
                                                    e.stopPropagation();

                                                    // delete chapter from download queue
                                                    deleteChapterQueue(item.chapter);
                                                }}
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    )}
                                </Draggable>

                            ))}
                            {provided.placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
}
