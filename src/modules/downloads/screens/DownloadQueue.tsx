/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Virtuoso } from 'react-virtuoso';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWindowEvent } from '@mantine/hooks';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ChapterDownloadStatus } from '@/modules/chapter/services/Chapters.ts';
import { DownloaderState } from '@/lib/graphql/generated/graphql.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';
import { DownloadQueueChapterCard } from '@/modules/downloads/components/DownloadQueueChapterCard.tsx';
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';
import { useAppAction } from '@/modules/navigation-bar/hooks/useAppAction.ts';

export const DownloadQueue: React.FC = () => {
    const { t } = useTranslation();

    useAppTitle(t('download.queue.title'));

    const [reorderDownload, { reset: revertReorder }] = requestManager.useReorderChapterInDownloadQueue();

    const {
        data: downloadStatusData,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetDownloadStatus({ notifyOnNetworkStatusChange: true });
    const downloaderData = downloadStatusData?.downloadStatus;

    const queue = downloaderData?.queue ?? [];
    const status = downloaderData?.state ?? DownloaderState.Started;
    const isQueueEmpty = !queue.length;

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

    useAppAction(
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

    // Virtuoso's resize observer can throw this error,
    // which is caught by DnD and aborts dragging.
    useWindowEvent('error', (e) => {
        if (
            e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
            e.message === 'ResizeObserver loop limit exceeded'
        ) {
            e.stopImmediatePropagation();
        }
    });

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
        <Box sx={{ pb: 1 }}>
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
                                <DownloadQueueChapterCard item={queue[index]} status={status} />
                            </DndSortableItem>
                        )}
                    />
                </SortableContext>
                <DndOverlayItem isActive={!!dndActiveDownload}>
                    <DownloadQueueChapterCard item={dndActiveDownload!} status={status} />
                </DndOverlayItem>
            </DndContext>
        </Box>
    );
};
