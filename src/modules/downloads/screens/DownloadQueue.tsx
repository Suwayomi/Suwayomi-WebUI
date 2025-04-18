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
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Virtuoso } from 'react-virtuoso';
import CardContent from '@mui/material/CardContent';
import Refresh from '@mui/icons-material/Refresh';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ChapterDownloadStatus, ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { DownloaderState, DownloadState } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';

const DownloadChapterItem = memo(
    ({
        item,
        handleDelete,
        handleRetry,
    }: {
        item: ChapterDownloadStatus;
        handleDelete: (chapter: ChapterIdInfo) => void;
        handleRetry: (chapter: ChapterIdInfo) => void;
    }) => {
        const { t } = useTranslation();

        return (
            <Box sx={{ p: 1, pb: 0 }}>
                <Card>
                    <CardActionArea component={Link} to={AppRoutes.manga.path(item.manga.id)}>
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.5,
                            }}
                        >
                            <IconButton {...MUIUtil.preventRippleProp()} sx={{ pointerEvents: 'none' }}>
                                <DragHandle />
                            </IconButton>
                            <Stack sx={{ flex: 1, ml: 1 }} direction="column">
                                <Typography variant="h6" component="h3">
                                    {item.manga.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                    }}
                                >
                                    {item.chapter.name}
                                </Typography>
                            </Stack>
                            <DownloadStateIndicator chapterId={item.chapter.id} />
                            {item.state === DownloadState.Error && (
                                <CustomTooltip title={t('global.button.retry')}>
                                    <IconButton
                                        {...MUIUtil.preventRippleProp()}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRetry(item.chapter);
                                        }}
                                    >
                                        <Refresh />
                                    </IconButton>
                                </CustomTooltip>
                            )}
                            <CustomTooltip title={t('chapter.action.download.delete.label.action')}>
                                <IconButton
                                    {...MUIUtil.preventRippleProp()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDelete(item.chapter);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CustomTooltip>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        );
    },
);

export const DownloadQueue: React.FC = () => {
    const { t } = useTranslation();

    const [reorderDownload, { reset: revertReorder }] = requestManager.useReorderChapterInDownloadQueue();

    const {
        data: downloadStatusData,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetDownloadStatus({ notifyOnNetworkStatusChange: true });
    const downloaderData = downloadStatusData?.downloadStatus;

    const queue = downloaderData?.queue ?? [];
    const status = downloaderData?.state ?? 'STARTED';
    const isQueueEmpty = !queue.length;

    const { setTitle, setAction } = useNavBarContext();

    const dndItems = useMemo(() => queue.map((download) => download.chapter), [queue]);
    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveDownload, setDndActiveDownload] = useState<ChapterDownloadStatus | null>(null);

    const clearQueue = async () => {
        try {
            await requestManager.clearDownloads().response;
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_delete_all'), 'error', getErrorMessage(e));
        }
    };

    const toggleQueueStatus = () => {
        if (status === DownloaderState.Stopped) {
            requestManager.startDownloads();
        } else {
            requestManager.stopDownloads();
        }
    };

    useLayoutEffect(() => {
        setTitle(t('download.queue.title'));
        setAction(
            <>
                <CustomTooltip title={t('download.queue.label.delete_all')}>
                    <IconButton onClick={clearQueue} color="inherit">
                        <DeleteSweepIcon />
                    </IconButton>
                </CustomTooltip>

                <CustomTooltip
                    title={t(status === DownloaderState.Started ? 'global.button.start' : 'global.button.stop')}
                    disabled={isQueueEmpty}
                >
                    <IconButton onClick={toggleQueueStatus} disabled={isQueueEmpty} color="inherit">
                        {status === DownloaderState.Stopped ? <PlayArrowIcon /> : <PauseIcon />}
                    </IconButton>
                </CustomTooltip>
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

    const categoryReorder = (list: ChapterDownloadStatus[], from: number, to: number) => {
        if (from === to) {
            return;
        }

        reorderDownload({ variables: { input: { chapterId: list[from].chapter.id, to } } }).catch(() => {
            revertReorder();
        });
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveDownload(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = queue.findIndex((download) => download.chapter.id === active.id);
        const newIndex = queue.findIndex((download) => download.chapter.id === over.id);

        categoryReorder(queue, oldIndex, newIndex);
    };

    const handleRetry = useCallback(async (chapter: ChapterIdInfo) => {
        try {
            await requestManager.addChapterToDownloadQueue(chapter.id).response;
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_to_remove'), 'error', getErrorMessage(e));
        }
    }, []);

    const handleDelete = useCallback(async (chapter: ChapterIdInfo) => {
        const isRunning = status === DownloaderState.Started;

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
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_to_remove'), 'error', getErrorMessage(e));
        }

        if (!isRunning) {
            return;
        }

        requestManager.startDownloads().response.catch(defaultPromiseErrorHandler('DownloadQueue::startDownloads'));
    }, []);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadQueue::refetch'))}
            />
        );
    }

    if (isQueueEmpty) {
        return <EmptyViewAbsoluteCentered message={t('download.queue.label.no_downloads')} />;
    }

    return (
        <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragStart={(event) =>
                setDndActiveDownload(queue.find((download) => download.chapter.id === event.active.id) ?? null)
            }
            onDragEnd={onDragEnd}
            onDragCancel={() => setDndActiveDownload(null)}
            onDragAbort={() => setDndActiveDownload(null)}
        >
            <SortableContext items={dndItems} strategy={verticalListSortingStrategy}>
                <Virtuoso
                    useWindowScroll
                    overscan={window.innerHeight * 0.5}
                    totalCount={queue.length}
                    computeItemKey={(index) => queue[index].chapter.id}
                    itemContent={(index) => (
                        <DndSortableItem
                            id={queue[index].chapter.id}
                            isDragging={queue[index].chapter.id === dndActiveDownload?.chapter.id}
                        >
                            <DownloadChapterItem
                                item={queue[index]}
                                handleDelete={handleDelete}
                                handleRetry={handleRetry}
                            />
                        </DndSortableItem>
                    )}
                />
            </SortableContext>
            <DndOverlayItem isActive={!!dndActiveDownload}>
                <DownloadChapterItem item={dndActiveDownload!} handleDelete={noOp} handleRetry={noOp} />
            </DndOverlayItem>
        </DndContext>
    );
};
