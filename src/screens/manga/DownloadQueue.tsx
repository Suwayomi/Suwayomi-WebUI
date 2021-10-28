/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import NavbarContext from 'context/NavbarContext';
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
import ListItemText from '@mui/material/ListItemText';
import EmptyView from 'components/EmptyView';

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
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style,
                                                theme.palette,
                                            )}
                                            ref={provided.innerRef}
                                        >
                                            <ListItemIcon>
                                                <DragHandleIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    `${item.chapter.name} | `
                                                + ` (${(item.progress * 100).toFixed(2)}%)`
                                                + ` => state: ${item.state}`
                                                }
                                            />
                                            <IconButton
                                                onClick={() => {
                                                // deleteCategory(index);
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
