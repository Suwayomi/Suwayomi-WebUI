/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, CircularProgress, Stack, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import { TChapter, TManga, TranslationKey } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterCard, ChapterInfo } from '@/components/manga/ChapterCard';
import { ResumeFab } from '@/components/manga/ResumeFAB';
import { filterAndSortChapters, useChapterOptions } from '@/components/manga/util';
import { EmptyView } from '@/components/util/EmptyView';
import { makeToast } from '@/components/util/Toast';
import { ChaptersToolbarMenu } from '@/components/manga/ChaptersToolbarMenu';
import { SelectionFAB } from '@/components/manga/SelectionFAB';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab';
import { DownloadType, UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';

const StyledVirtuoso = styled(Virtuoso)(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    minHeight: '200px',
    [theme.breakpoints.up('md')]: {
        width: '50vw',
        // 64px for the Appbar, 48px for the ChapterCount Header
        height: 'calc(100vh - 64px - 48px)',
        margin: 0,
    },
}));

const actionsStrings: {
    [key in 'download' | 'delete' | 'bookmark' | 'unbookmark' | 'mark_as_read' | 'mark_as_unread']: {
        success: TranslationKey;
        error: TranslationKey;
    };
} = {
    download: {
        success: 'chapter.action.download.add.label.success',
        error: 'chapter.action.download.add.label.error',
    },
    delete: {
        success: 'chapter.action.download.delete.label.success',
        error: 'chapter.action.download.delete.label.error',
    },
    bookmark: {
        success: 'chapter.action.bookmark.add.label.success',
        error: 'chapter.action.bookmark.add.label.error',
    },
    unbookmark: {
        success: 'chapter.action.bookmark.remove.label.success',
        error: 'chapter.action.bookmark.remove.label.error',
    },
    mark_as_read: {
        success: 'chapter.action.mark_as_read.add.label.success',
        error: 'chapter.action.mark_as_read.add.label.error',
    },
    mark_as_unread: {
        success: 'chapter.action.mark_as_read.remove.label.success',
        error: 'chapter.action.mark_as_read.remove.label.error',
    },
};

export interface IChapterWithMeta {
    chapter: TChapter;
    downloadChapter: DownloadType | undefined;
    selected: boolean | null;
}

interface IProps {
    manga: TManga;
    isRefreshing: boolean;
}

export const ChapterList: React.FC<IProps> = ({ manga, isRefreshing }) => {
    const { t } = useTranslation();

    const [selection, setSelection] = useState<number[] | null>(null);
    const prevQueueRef = useRef<DownloadType[]>();
    const { data: downloaderData } = requestManager.useDownloadSubscription();
    const queue = (downloaderData?.downloadChanged.queue as DownloadType[]) ?? [];

    const [options, dispatch] = useChapterOptions(manga.id);
    const { data: chaptersData, loading: isLoading, refetch } = requestManager.useGetMangaChapters(manga.id);
    const chapters = useMemo(() => chaptersData?.chapters.nodes ?? [], [chaptersData?.chapters.nodes]);
    const mangaChapters: ChapterInfo[] = useMemo(
        () => chapters.map((chapter) => [chapter.id, chapter.isBookmarked, chapter.isDownloaded]),
        [chapters],
    );

    const { settings: metadataServerSettings } = useMetadataServerSettings();

    useEffect(() => {
        if (prevQueueRef.current && queue) {
            const prevQueue = prevQueueRef.current;
            const changedDownloads = queue.filter((cd) => {
                const prevChapterDownload = prevQueue.find(
                    (pcd) =>
                        cd.chapter.sourceOrder === pcd.chapter.sourceOrder &&
                        cd.chapter.manga.id === pcd.chapter.manga.id,
                );
                if (!prevChapterDownload) return true;
                return cd.state !== prevChapterDownload.state;
            });

            if (changedDownloads.length > 0 || prevQueue?.length !== queue.length) {
                refetch();
            }
        }

        prevQueueRef.current = queue;
    }, [queue]);

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), [chapters, options]);

    const nextChapterIndexToRead = (manga.lastReadChapter?.sourceOrder ?? 0) + 1;
    const isLatestChapterRead = manga.chapters.totalCount === manga.lastReadChapter?.sourceOrder;

    const handleSelection = (index: number) => {
        const chapter = visibleChapters[index];
        if (!chapter) return;

        if (selection === null) {
            setSelection([chapter.id]);
        } else if (selection.includes(chapter.id)) {
            const newSelection = selection.filter((cid) => cid !== chapter.id);
            setSelection(newSelection.length > 0 ? newSelection : null);
        } else {
            setSelection([...selection, chapter.id]);
        }
    };

    const handleSelectAll = () => {
        if (selection === null) return;
        setSelection(visibleChapters.map((c) => c.id));
    };

    const handleClear = () => {
        if (selection === null) return;
        setSelection(null);
    };

    const handleFabAction: ComponentProps<typeof SelectionFAB>['onAction'] = (action, actionChapters) => {
        if (actionChapters.length === 0) return;
        const chapterIds = actionChapters.map(({ chapter }) => chapter.id);

        let actionPromise: Promise<any>;

        if (action === 'download') {
            actionPromise = requestManager.addChaptersToDownloadQueue(chapterIds).response;
        } else {
            const change: UpdateChapterPatchInput = {};

            if (action === 'bookmark') change.isBookmarked = true;
            else if (action === 'unbookmark') change.isBookmarked = false;
            else if (action === 'mark_as_read' || action === 'mark_as_unread') {
                change.isRead = action === 'mark_as_read';
                change.lastPageRead = 0;
            }

            if (action === 'delete') {
                actionPromise = requestManager.deleteDownloadedChapters(chapterIds).response;
            } else {
                actionPromise = requestManager.updateChapters(chapterIds, change).response;
            }

            const shouldDeleteChapters =
                action === 'mark_as_read' && metadataServerSettings.deleteChaptersManuallyMarkedRead;
            if (shouldDeleteChapters) {
                const chapterIdsToDelete = actionChapters
                    .filter(
                        ({ chapter }) =>
                            chapter.isDownloaded &&
                            (!chapter.isBookmarked || metadataServerSettings.deleteChaptersWithBookmark),
                    )
                    .map(({ chapter }) => chapter.id);

                requestManager.deleteDownloadedChapters(chapterIdsToDelete).response.catch(() => {});
            }
        }

        actionPromise
            .then(() => makeToast(t(actionsStrings[action].success, { count: chapterIds.length }), 'success'))
            .catch(() => makeToast(t(actionsStrings[action].error, { count: chapterIds.length }), 'error'));
    };

    const noChaptersFound = chapters.length === 0;
    const noChaptersMatchingFilter = !noChaptersFound && visibleChapters.length === 0;

    const chaptersWithMeta: IChapterWithMeta[] = useMemo(
        () =>
            visibleChapters.map((chapter) => {
                const downloadChapter = queue?.find(
                    (cd) => cd.chapter.sourceOrder === chapter.sourceOrder && cd.chapter.manga.id === chapter.manga.id,
                );
                const selected = selection?.includes(chapter.id) ?? null;
                return {
                    chapter,
                    downloadChapter,
                    selected,
                };
            }),
        [queue, selection, visibleChapters],
    );

    const selectedChapters = useMemo(() => {
        if (!selection) {
            return null;
        }

        return chaptersWithMeta.filter(({ chapter }) => selection.includes(chapter.id));
    }, [selection, chapters]);

    const chapterListFAB = useMemo(() => {
        if (selectedChapters) {
            return <SelectionFAB selectedChapters={selectedChapters} onAction={handleFabAction} />;
        }

        if (!isLatestChapterRead) {
            return <ResumeFab chapterIndex={nextChapterIndexToRead} mangaId={manga.id} />;
        }

        return null;
    }, [selectedChapters, isLatestChapterRead]);

    if (isLoading || (noChaptersFound && isRefreshing)) {
        return (
            <div
                style={{
                    margin: '10px auto',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress thickness={5} />
            </div>
        );
    }

    return (
        <>
            <Stack direction="column" sx={{ position: 'relative' }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        m: 1,
                        mb: 0,
                        mr: 2,
                        minHeight: 40,
                    }}
                >
                    <Typography variant="h5">
                        {`${visibleChapters.length} ${t('chapter.title', {
                            count: visibleChapters.length,
                        })}`}
                    </Typography>

                    {selection === null ? (
                        <ChaptersToolbarMenu options={options} optionsDispatch={dispatch} />
                    ) : (
                        <Stack direction="row">
                            <Button size="small" onClick={handleSelectAll}>
                                {t('global.button.select_all')}
                            </Button>
                            <Button size="small" onClick={handleClear}>
                                {t('global.button.clear')}
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {noChaptersFound && <EmptyView message={t('chapter.error.label.no_chapter_found')} />}
                {noChaptersMatchingFilter && <EmptyView message={t('chapter.error.label.no_matches')} />}

                <StyledVirtuoso
                    style={{
                        // override Virtuoso default values and set them with class
                        height: 'undefined',
                        // 900 is the md breakpoint in MUI
                        overflowY: window.innerWidth < 900 ? 'visible' : 'auto',
                    }}
                    totalCount={visibleChapters.length + 1}
                    itemContent={(index: number) => {
                        // hacky way of adding padding to the bottom of the list, so the FAB doesn't overlay the last chapter
                        // since I was unable to find another solution on how to achieve this
                        if (index === visibleChapters.length) {
                            return (
                                <div
                                    style={{
                                        paddingBottom: DEFAULT_FULL_FAB_HEIGHT,
                                    }}
                                />
                            );
                        }

                        return (
                            <ChapterCard
                                {...chaptersWithMeta[index]}
                                allChapters={mangaChapters}
                                showChapterNumber={options.showChapterNumber}
                                onSelect={() => handleSelection(index)}
                            />
                        );
                    }}
                    useWindowScroll={window.innerWidth < 900}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {chapterListFAB}
        </>
    );
};
