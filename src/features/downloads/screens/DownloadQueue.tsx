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
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWindowEvent } from '@mantine/hooks';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { ChapterDownloadReorderInput } from '@/lib/graphql/generated/graphql-base.types.ts';
import { DownloaderState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';
import { DownloadQueueChapterCard } from '@/features/downloads/components/DownloadQueueChapterCard.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useAppAction } from '@/features/navigation-bar/hooks/useAppAction.ts';
import type { ChapterDownloadStatus } from '@/features/chapter/Chapter.types.ts';
import { VirtuosoPersisted } from '@/lib/virtuoso/Component/VirtuosoPersisted.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import groupBy from 'lodash/fp/groupBy';
import uniqBy from 'lodash/fp/uniqBy';
import mapValues from 'lodash/fp/mapValues';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { DownloadGroupHeader } from '@/features/downloads/components/DownloadGroupHeader.tsx';

export const DownloadQueue: React.FC = () => {
    const { t } = useLingui();

    useAppTitle(t`Download queue`);

    const [reorderDownloads, { reset: revertReorder }] = requestManager.useReorderChaptersInDownloadQueue();

    const { data: downloadStatusData, loading: isLoading, error, refetch } = requestManager.useGetDownloadStatus();
    const downloaderData = downloadStatusData?.downloadStatus;

    const queue = downloaderData?.queue ?? STABLE_EMPTY_ARRAY;
    const status = downloaderData?.state ?? DownloaderState.Started;
    const isQueueEmpty = !queue.length;

    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveSource, setDndActiveSource] = useState<any>(null);
    const [dndActiveDownload, setDndActiveDownload] = useState<ChapterDownloadStatus | null>(null);

    const sources = useMemo(
        () =>
            uniqBy(
                'id',
                queue.map(
                    (download) =>
                        download.manga.source ?? {
                            id: download.manga.sourceId,
                            name: download.manga.sourceId,
                            lang: undefined,
                        },
                ),
            ),
        [queue],
    );
    const downloadsBySource = useMemo(() => groupBy((download) => download.manga.sourceId, queue), [queue]);
    const chaptersBySource = useMemo(
        () => mapValues((downloads) => downloads.map((download) => download.chapter), downloadsBySource),
        [downloadsBySource],
    );

    const clearQueue = async () => {
        try {
            await requestManager.clearDownloads().response;
        } catch (e) {
            makeToast(t`Could not remove all downloads from the queue`, 'error', getErrorMessage(e));
        }
    };

    const toggleQueueStatus = () => {
        if (status === DownloaderState.Stopped) {
            requestManager.startDownloads();
        } else {
            requestManager.stopDownloads();
        }
    };

    const categoryReorder = (list: ChapterDownloadStatus[], reorders: ChapterDownloadReorderInput[]) => {
        const isOrderUnchanged = reorders.every(
            (reorder) => list.findIndex((item) => item.chapter.id === reorder.chapterId) === reorder.to,
        );
        if (isOrderUnchanged) {
            return;
        }

        reorderDownloads({ variables: { input: { reorders } } }).catch(() => {
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

        categoryReorder(queue, [{ chapterId: queue[oldIndex].chapter.id, to: newIndex }]);
    };

    const onDragEndSource = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveSource(null);

        if (!over || active.id === over.id) {
            return;
        }

        const newIndex = queue.findIndex((item) => item.manga.sourceId === over.id);

        categoryReorder(
            queue,
            chaptersBySource[active.id as SourceIdInfo['id']].map((chapter, index) => ({
                chapterId: chapter.id,
                to: newIndex + index,
            })),
        );
    };

    useAppAction(
        <>
            <CustomTooltip title={t`Delete all`}>
                <IconButton onClick={clearQueue} color="inherit">
                    <DeleteSweepIcon />
                </IconButton>
            </CustomTooltip>

            <CustomTooltip title={status === DownloaderState.Started ? t`Stop` : t`Start`} disabled={isQueueEmpty}>
                <IconButton onClick={toggleQueueStatus} disabled={isQueueEmpty} color="inherit">
                    {status === DownloaderState.Stopped ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
            </CustomTooltip>
        </>,
        [status, isQueueEmpty],
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
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadQueue::refetch'))}
            />
        );
    }

    if (isQueueEmpty) {
        return <EmptyViewAbsoluteCentered message={t`No downloads`} />;
    }

    return (
        <Box sx={{ pb: 1 }}>
            <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragStart={(event) =>
                    setDndActiveSource(sources.find((source) => source.id === event.active.id) ?? null)
                }
                onDragEnd={onDragEndSource}
                onDragCancel={() => setDndActiveSource(null)}
                onDragAbort={() => setDndActiveSource(null)}
            >
                <SortableContext items={sources} strategy={verticalListSortingStrategy}>
                    {sources.map((source, sourceIndex) => (
                        <DndSortableItem
                            key={`source-${source.id}`}
                            id={source.id}
                            isDragging={source.id === dndActiveSource?.id}
                        >
                            <DownloadGroupHeader
                                sourceIndex={sourceIndex}
                                title={source.name}
                                itemCount={chaptersBySource[source.id].length}
                                language={source.lang ? languageCodeToName(source.lang) : undefined}
                            />
                            <DndContext
                                sensors={dndSensors}
                                collisionDetection={closestCenter}
                                onDragStart={(event) =>
                                    setDndActiveDownload(
                                        queue.find((download) => download.chapter.id === event.active.id) ?? null,
                                    )
                                }
                                onDragEnd={onDragEnd}
                                onDragCancel={() => setDndActiveDownload(null)}
                                onDragAbort={() => setDndActiveDownload(null)}
                            >
                                <SortableContext
                                    items={chaptersBySource[source.id]}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <VirtuosoPersisted
                                        persistKey={`download-queue-${source.id}`}
                                        useWindowScroll
                                        overscan={window.innerHeight * 0.5}
                                        totalCount={!dndActiveSource ? chaptersBySource[source.id].length : 0}
                                        computeItemKey={(index) =>
                                            `source-${source.id}-chapter-${chaptersBySource[source.id][index].id}`
                                        }
                                        itemContent={(index) => (
                                            <DndSortableItem
                                                id={chaptersBySource[source.id][index].id}
                                                isDragging={
                                                    chaptersBySource[source.id][index].id ===
                                                    dndActiveDownload?.chapter.id
                                                }
                                            >
                                                <StyledGroupItemWrapper>
                                                    <DownloadQueueChapterCard
                                                        item={downloadsBySource[source.id][index]}
                                                        status={status}
                                                    />
                                                </StyledGroupItemWrapper>
                                            </DndSortableItem>
                                        )}
                                    />
                                </SortableContext>
                                <DndOverlayItem isActive={!!dndActiveDownload}>
                                    <DownloadQueueChapterCard item={dndActiveDownload!} status={status} />
                                </DndOverlayItem>
                            </DndContext>
                        </DndSortableItem>
                    ))}
                </SortableContext>
                <DndOverlayItem isActive={!!dndActiveSource}>
                    <DownloadGroupHeader
                        sourceIndex={sources.indexOf(dndActiveSource)}
                        title={dndActiveSource?.name}
                        itemCount={chaptersBySource[dndActiveSource?.id]?.length ?? -1}
                        language={dndActiveSource?.lang ? languageCodeToName(dndActiveSource.lang) : undefined}
                    />
                </DndOverlayItem>
            </DndContext>
        </Box>
    );
};
