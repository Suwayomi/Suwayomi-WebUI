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
import { BatchChaptersChange, IChapter, IDownloadChapter, IQueue, TranslationKey } from '@/typings';
import requestManager from '@/lib/RequestManager';
import useSubscription from '@/components/library/useSubscription';
import ChapterCard from '@/components/manga/ChapterCard';
import ResumeFab from '@/components/manga/ResumeFAB';
import { filterAndSortChapters, useChapterOptions } from '@/components/manga/util';
import EmptyView from '@/components/util/EmptyView';
import makeToast from '@/components/util/Toast';
import ChaptersToolbarMenu from '@/components/manga/ChaptersToolbarMenu';
import SelectionFAB from '@/components/manga/SelectionFAB';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab';

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
    chapter: IChapter;
    downloadChapter: IDownloadChapter | undefined;
    selected: boolean | null;
}

interface IProps {
    mangaId: string;
}

const ChapterList: React.FC<IProps> = ({ mangaId }) => {
    const { t } = useTranslation();

    const [selection, setSelection] = useState<number[] | null>(null);
    const prevQueueRef = useRef<IDownloadChapter[]>();
    const queue = useSubscription<IQueue>('downloads').data?.queue;

    const [options, dispatch] = useChapterOptions(mangaId);
    const { data: chaptersData, mutate, isLoading } = requestManager.useGetMangaChapters(mangaId);
    const chapters = useMemo(() => chaptersData ?? [], [chaptersData]);

    useEffect(() => {
        if (prevQueueRef.current && queue) {
            const prevQueue = prevQueueRef.current;
            const changedDownloads = queue.filter((cd) => {
                const prevChapterDownload = prevQueue.find(
                    (pcd) => cd.chapterIndex === pcd.chapterIndex && cd.mangaId === pcd.mangaId,
                );
                if (!prevChapterDownload) return true;
                return cd.state !== prevChapterDownload.state;
            });

            if (changedDownloads.length > 0) {
                mutate();
            }
        }

        prevQueueRef.current = queue;
    }, [queue]);

    const visibleChapters = useMemo(
        () => filterAndSortChapters(chapters, options), //
        [chapters, options],
    );

    const firstUnreadChapter = useMemo(
        () =>
            chapters
                .slice()
                .reverse()
                .find((chapter) => !chapter.read),
        [chapters],
    );

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
            const change: BatchChaptersChange = {};

            if (action === 'delete') change.delete = true;
            else if (action === 'bookmark') change.isBookmarked = true;
            else if (action === 'unbookmark') change.isBookmarked = false;
            else if (action === 'mark_as_read' || action === 'mark_as_unread') {
                change.isRead = action === 'mark_as_read';
                change.lastPageRead = 0;
            }

            actionPromise = requestManager.updateChapters(chapterIds, change).response;
        }

        actionPromise
            .then(() => makeToast(t(actionsStrings[action].success, { count: chapterIds.length }), 'success'))
            .then(() => mutate())
            .catch(() => makeToast(t(actionsStrings[action].error, { count: chapterIds.length }), 'error'));
    };

    if (isLoading) {
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

    const noChaptersFound = chapters.length === 0;
    const noChaptersMatchingFilter = !noChaptersFound && visibleChapters.length === 0;

    const chaptersWithMeta: IChapterWithMeta[] = visibleChapters.map((chapter) => {
        const downloadChapter = queue?.find(
            (cd) => cd.chapterIndex === chapter.index && cd.mangaId === chapter.mangaId,
        );
        const selected = selection?.includes(chapter.id) ?? null;
        return {
            chapter,
            downloadChapter,
            selected,
        };
    });

    const selectedChapters =
        selection === null ? null : chaptersWithMeta.filter(({ chapter }) => selection.includes(chapter.id));

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
                                showChapterNumber={options.showChapterNumber}
                                triggerChaptersUpdate={() => mutate()}
                                onSelect={() => handleSelection(index)}
                            />
                        );
                    }}
                    useWindowScroll={window.innerWidth < 900}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {selectedChapters !== null ? (
                <SelectionFAB selectedChapters={selectedChapters} onAction={handleFabAction} />
            ) : (
                firstUnreadChapter && <ResumeFab chapter={firstUnreadChapter} mangaId={mangaId} />
            )}
        </>
    );
};

export default ChapterList;
