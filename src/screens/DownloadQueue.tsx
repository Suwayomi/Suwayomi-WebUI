/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import DeleteIcon from '@mui/icons-material/Delete';
import DragHandle from '@mui/icons-material/DragHandle';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    Card, CardActionArea, Stack,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import NavbarContext from 'components/context/NavbarContext';
import EmptyView from 'components/util/EmptyView';
import React, { useContext, useEffect } from 'react';
import {
    DragDropContext, Draggable, Droppable, DropResult,
} from 'react-beautiful-dnd';
import client from 'util/client';

import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import useSubscription from 'components/library/useSubscription';
import DownloadStateIndicator from 'components/molecules/DownloadStateIndicator';
import { NavbarToolbar } from 'components/navbar/DefaultNavBar';
import { Link } from 'react-router-dom';
import { BACK } from 'util/useBackTo';

const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

const DownloadQueue: React.FC = () => {
    const { data: queueState } = useSubscription<IQueue>('/api/v1/downloads');
    const { queue, status } = queueState ?? initialQueue;

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
        setAction(null);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onDragEnd = (result: DropResult) => {
    };

    if (queue.length === 0) {
        return <EmptyView message="No downloads" />;
    }

    const handleDelete = (chapter: IChapter) => {
        // required to stop before deleting otherwise the download kept going. Server issue?
        client.get('/api/v1/downloads/stop')
            .then(() => Promise.all([
                // remove from download queue
                client.delete(`/api/v1/download/${chapter.mangaId}/chapter/${chapter.index}`),
                // delete partial download, should be handle server side?
                // bug: The folder and the last image downloaded are not deleted
                client.delete(`/api/v1/manga/${chapter.mangaId}/chapter/${chapter.index}`),
            ]));
    };

    return (
        <>
            <NavbarToolbar>
                <IconButton onClick={toggleQueueStatus} size="large">
                    {status === 'Stopped' ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
            </NavbarToolbar>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <Box ref={provided.innerRef} sx={{ pt: 1 }}>
                            {queue.map((item, index) => (
                                <Draggable
                                    key={`${item.mangaId}-${item.chapterIndex}`}
                                    draggableId={`${item.mangaId}-${item.chapterIndex}`}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <Box
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                            sx={{ p: 1, pb: 2 }}
                                        >
                                            <Card
                                                sx={{
                                                    backgroundColor: snapshot.isDragging ? 'custom.light' : undefined,
                                                }}
                                            >
                                                <CardActionArea
                                                    component={Link}
                                                    to={{ pathname: `/manga/${item.chapter.mangaId}`, state: { backLink: BACK } }}
                                                    sx={{ display: 'flex', alignItems: 'center', p: 1 }}
                                                >
                                                    <IconButton sx={{ pointerEvents: 'none' }}>
                                                        <DragHandle />
                                                    </IconButton>
                                                    <Stack sx={{ flex: 1, ml: 1 }} direction="column">
                                                        <Typography variant="h6">
                                                            {item.manga.title}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" gutterBottom>
                                                            {item.chapter.name}
                                                        </Typography>
                                                    </Stack>
                                                    <DownloadStateIndicator download={item} />
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDelete(item.chapter);
                                                        }}
                                                        size="large"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </CardActionArea>
                                            </Card>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
};

export default DownloadQueue;
