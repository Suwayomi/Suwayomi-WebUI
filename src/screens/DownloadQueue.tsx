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
import { Card, CardActionArea, Stack, Box, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useContext, useEffect } from 'react';
import { DragDropContext, Draggable, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Virtuoso } from 'react-virtuoso';
import { BoxProps } from '@mui/material/Box/Box';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { StrictModeDroppable } from '@/lib/StrictModeDroppable';
import { makeToast } from '@/components/util/Toast';
import { DownloadStateIndicator } from '@/components/molecules/DownloadStateIndicator';
import { EmptyView } from '@/components/util/EmptyView';
import { ChapterType, DownloadType } from '@/lib/graphql/generated/graphql.ts';
import { TChapter } from '@/typings.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

const HeightPreservingItem = ({ children, ...props }: BoxProps) => (
    // the height is necessary to prevent the item container from collapsing, which confuses Virtuoso measurements
    <Box {...props} style={{ height: props['data-known-size' as keyof typeof props] || undefined }}>
        {children}
    </Box>
);

const DownloadChapterItem = ({
    provided,
    item,
    isDragging,
    handleDelete,
}: {
    provided: DraggableProvided;
    item: DownloadType;
    isDragging: boolean;
    handleDelete: (chapter: ChapterType) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Box {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} sx={{ p: 1, pb: 2 }}>
            <Card
                sx={{
                    backgroundColor: isDragging ? 'custom.light' : undefined,
                }}
            >
                <CardActionArea
                    component={Link}
                    to={`/manga/${item.chapter.manga.id}`}
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
                    <Tooltip title={t('chapter.action.download.delete.label.action')}>
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
                    </Tooltip>
                </CardActionArea>
            </Card>
        </Box>
    );
};

const DownloadQueue: React.FC = () => {
    const { t } = useTranslation();

    const [reorderDownload, { reset: revertReorder }] = requestManager.useReorderChapterInDownloadQueue();

    const { data: downloadStatusData, loading: isLoading } = requestManager.useGetDownloadStatus();
    const downloaderData = downloadStatusData?.downloadStatus;

    const queue = (downloaderData?.queue as DownloadType[]) ?? [];
    const status = downloaderData?.state ?? 'STARTED';
    const isQueueEmpty = !queue.length;

    const { setTitle, setAction } = useContext(NavBarContext);

    const clearQueue = async () => {
        try {
            await requestManager.clearDownloads().response;
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_delete_all'), 'error');
        }
    };

    const toggleQueueStatus = () => {
        if (status === 'STOPPED') {
            requestManager.startDownloads();
        } else {
            requestManager.stopDownloads();
        }
    };

    useEffect(() => {
        setTitle(t('download.queue.title'));
        setAction(
            <>
                <Tooltip title={t('download.queue.label.delete_all')}>
                    <IconButton onClick={clearQueue} size="large" disabled={isQueueEmpty}>
                        <DeleteSweepIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t(status === 'STOPPED' ? 'global.button.start' : 'global.button.stop')}>
                    <IconButton onClick={toggleQueueStatus} size="large" disabled={isQueueEmpty}>
                        {status === 'STOPPED' ? <PlayArrowIcon /> : <PauseIcon />}
                    </IconButton>
                </Tooltip>
            </>,
        );

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, status, isQueueEmpty]);

    useEffect(() => {
        const ignoreError = (e: WindowEventMap['error']) => {
            if (
                e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
                e.message === 'ResizeObserver loop limit exceeded'
            ) {
                e.stopImmediatePropagation();
            }
        };

        // Virtuoso's resize observer can throw this error,
        // which is caught by DnD and aborts dragging.
        window.addEventListener('error', ignoreError);

        return () => window.removeEventListener('error', ignoreError);
    }, []);

    const categoryReorder = (list: DownloadType[], from: number, to: number) => {
        if (from === to) {
            return;
        }

        reorderDownload({ variables: { input: { chapterId: list[from].chapter.id, to } } }).catch(() => {
            revertReorder();
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        categoryReorder(queue, result.source.index, result.destination.index);
    };

    const handleDelete = async (chapter: TChapter) => {
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

        requestManager.startDownloads().response.catch(defaultPromiseErrorHandler('DownloadQueue::startDownloads'));
    };

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (isQueueEmpty) {
        return <EmptyView message={t('download.queue.label.no_downloads')} />;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <StrictModeDroppable
                droppableId="droppable"
                mode="virtual"
                renderClone={(provided, snapshot, rubric) => (
                    <DownloadChapterItem
                        provided={provided}
                        item={queue[rubric.source.index]}
                        isDragging={snapshot.isDragging}
                        handleDelete={handleDelete}
                    />
                )}
            >
                {(droppableProvided) => (
                    <Box ref={droppableProvided.innerRef} sx={{ pt: 1 }}>
                        <Virtuoso
                            useWindowScroll
                            overscan={window.innerHeight * 0.5}
                            data={queue}
                            components={{
                                Item: HeightPreservingItem,
                            }}
                            itemContent={(index, item) => (
                                <Draggable
                                    key={`${item.chapter.manga.id}-${item.chapter.sourceOrder}`}
                                    draggableId={`${item.chapter.manga.id}-${item.chapter.sourceOrder}`}
                                    index={index}
                                >
                                    {(draggableProvided) => (
                                        <DownloadChapterItem
                                            provided={draggableProvided}
                                            item={item}
                                            isDragging={false}
                                            handleDelete={handleDelete}
                                        />
                                    )}
                                </Draggable>
                            )}
                        />
                    </Box>
                )}
            </StrictModeDroppable>
        </DragDropContext>
    );
};
export default DownloadQueue;
