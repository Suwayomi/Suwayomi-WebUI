/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DeleteIcon from '@mui/icons-material/Delete';
import DragHandle from '@mui/icons-material/DragHandle';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Card, CardActionArea, Stack, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useContext, useEffect } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';

import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import requestManager from '@/lib/requests/RequestManager.ts';
import StrictModeDroppable from '@/lib/StrictModeDroppable';
import makeToast from '@/components/util/Toast';
import { NavbarToolbar } from '@/components/navbar/DefaultNavBar';
import DownloadStateIndicator from '@/components/molecules/DownloadStateIndicator';
import EmptyView from '@/components/util/EmptyView';
import NavbarContext from '@/components/context/NavbarContext';
import { ChapterType, DownloadType } from '@/lib/graphql/generated/graphql.ts';

const DownloadQueue: React.FC = () => {
    const { t } = useTranslation();

    const { data: downloaderData } = requestManager.useDownloadSubscription();
    const queue = (downloaderData?.downloadChanged.queue as DownloadType[]) ?? [];
    const status = downloaderData?.downloadChanged.state ?? 'STARTED';

    const { setTitle, setAction } = useContext(NavbarContext);

    const toggleQueueStatus = () => {
        if (status === 'STOPPED') {
            requestManager.startDownloads();
        } else {
            requestManager.stopDownloads();
        }
    };

    useEffect(() => {
        setTitle(t('download.queue.title'));
        setAction(null);
    }, [t]);

    const onDragEnd = () => {};

    if (queue.length === 0) {
        return <EmptyView message={t('download.queue.label.no_downloads')} />;
    }

    const handleDelete = async (chapter: ChapterType) => {
        const isRunning = status === 'STARTED';

        try {
            if (isRunning) {
                // required to stop before deleting otherwise the download kept going. Server issue?
                await requestManager.stopDownloads().response;
            }

            await Promise.all([
                // remove from download queue
                requestManager.removeChapterFromDownloadQueue(chapter.id).response,
                // delete partial download, should be handle server side?
                // bug: The folder and the last image downloaded are not deleted
                requestManager.deleteDownloadedChapter(chapter.id).response,
            ]);
        } catch (error) {
            makeToast(t('download.queue.error.label.failed_to_remove'), 'error');
        }

        if (!isRunning) {
            return;
        }

        requestManager.startDownloads().response.catch(() => {});
    };

    return (
        <>
            <NavbarToolbar>
                <IconButton onClick={toggleQueueStatus} size="large">
                    {status === 'STOPPED' ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
            </NavbarToolbar>
            <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable droppableId="droppable">
                    {(droppableProvided) => (
                        <Box ref={droppableProvided.innerRef} sx={{ pt: 1 }}>
                            {queue.map((item, index) => (
                                <Draggable
                                    key={`${item.chapter.manga.id}-${item.chapter.sourceOrder}`}
                                    draggableId={`${item.chapter.manga.id}-${item.chapter.sourceOrder}`}
                                    index={index}
                                >
                                    {(draggableProvided, snapshot) => (
                                        <Box
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            ref={draggableProvided.innerRef}
                                            sx={{ p: 1, pb: 2 }}
                                        >
                                            <Card
                                                sx={{
                                                    backgroundColor: snapshot.isDragging ? 'custom.light' : undefined,
                                                }}
                                            >
                                                <CardActionArea
                                                    component={Link}
                                                    to={`/manga/${item.chapter.mangaId}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        p: 1,
                                                    }}
                                                >
                                                    <IconButton sx={{ pointerEvents: 'none' }}>
                                                        <DragHandle />
                                                    </IconButton>
                                                    <Stack sx={{ flex: 1, ml: 1 }} direction="column">
                                                        <Typography variant="h6">{item.chapter.manga.title}</Typography>
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
                            {droppableProvided.placeholder}
                        </Box>
                    )}
                </StrictModeDroppable>
            </DragDropContext>
        </>
    );
};

export default DownloadQueue;
