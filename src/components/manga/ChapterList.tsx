/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Box, CircularProgress, Stack, styled, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { ComponentProps, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { TChapter, TManga, TranslationKey } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterCard } from '@/components/manga/ChapterCard';
import { ResumeFab } from '@/components/manga/ResumeFAB';
import { filterAndSortChapters, useChapterOptions } from '@/components/manga/util';
import { EmptyView } from '@/components/util/EmptyView';
import { makeToast } from '@/components/util/Toast';
import { ChaptersToolbarMenu } from '@/components/manga/ChaptersToolbarMenu';
import { SelectionFAB } from '@/components/manga/SelectionFAB';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab';
import { DownloadType, UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { SelectableCollectionSelectAll } from '@/components/collection/SelectableCollectionSelectAll.tsx';
import { ChapterSelectionFABActionItems } from '@/components/manga/ChapterSelectionFABActionItems.tsx';

const ChapterListHeader = styled(Stack)(({ theme }) => ({
    margin: 8,
    marginBottom: 0,
    marginRight: '10px',
    minHeight: 40,
    [theme.breakpoints.down('md')]: {
        marginRight: 0,
    },
}));

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

    const { data: downloaderData } = requestManager.useDownloadSubscription();
    const queue = (downloaderData?.downloadChanged.queue as DownloadType[]) ?? [];

    const [options, dispatch] = useChapterOptions(manga.id);
    const { data: chaptersData, loading: isLoading } = requestManager.useGetMangaChapters(manga.id);
    const chapters = useMemo(() => chaptersData?.chapters.nodes ?? [], [chaptersData?.chapters.nodes]);

    const { areNoItemsSelected, areAllItemsSelected, selectedItemIds, handleSelectAll, handleSelection } =
        useSelectableCollection(chapters.length, { currentKey: 'default' });

    const { settings: metadataServerSettings } = useMetadataServerSettings();

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), [chapters, options]);

    const nextChapterIndexToRead = (manga.lastReadChapter?.sourceOrder ?? 0) + 1;
    const isLatestChapterRead = manga.chapters.totalCount === manga.lastReadChapter?.sourceOrder;

    const areAllChaptersRead = manga.unreadCount === 0;
    const areAllChaptersDownloaded = manga.downloadCount === manga.chapters.totalCount;

    const handleFabAction: ComponentProps<typeof ChapterSelectionFABActionItems>['onAction'] = (
        action,
        actionChapters,
    ) => {
        if (actionChapters.length === 0) return;
        const chapterIds = actionChapters
            .filter(({ chapter }) => {
                switch (action) {
                    case 'download':
                        return !chapter.isDownloaded;
                    case 'delete':
                        return chapter.isDownloaded;
                    case 'bookmark':
                        return !chapter.isBookmarked;
                    case 'unbookmark':
                        return chapter.isBookmarked;
                    case 'mark_as_read':
                        return !chapter.isRead;
                    case 'mark_as_unread':
                        return chapter.isRead;
                    default:
                        throw new Error(`ChapterList::handleFabAction: unknown action "${action}"`);
                }
            })
            .map(({ chapter }) => chapter.id);

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
                const shouldDeleteChapters =
                    action === 'mark_as_read' && metadataServerSettings.deleteChaptersManuallyMarkedRead;
                const chapterIdsToDelete = shouldDeleteChapters
                    ? actionChapters
                          .filter(
                              ({ chapter }) =>
                                  chapter.isDownloaded &&
                                  (!chapter.isBookmarked || metadataServerSettings.deleteChaptersWithBookmark),
                          )
                          .map(({ chapter }) => chapter.id)
                    : [];

                actionPromise = requestManager.updateChapters(chapterIds, { ...change, chapterIdsToDelete }).response;
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
                const selected = !areNoItemsSelected ? selectedItemIds.includes(chapter.id) : null;
                return {
                    chapter,
                    downloadChapter,
                    selected,
                };
            }),
        [queue, selectedItemIds, visibleChapters],
    );

    const chapterListFAB = useMemo(() => {
        const selectedChapters = chaptersWithMeta.filter((chapter) => chapter.selected);

        if (selectedChapters.length) {
            return (
                <SelectionFAB selectedItemsCount={selectedChapters.length} title="chapter.title">
                    {(handleClose) => (
                        <ChapterSelectionFABActionItems
                            selectedChapters={selectedChapters}
                            onAction={handleFabAction}
                            handleClose={handleClose}
                        />
                    )}
                </SelectionFAB>
            );
        }

        if (!isLatestChapterRead) {
            return <ResumeFab chapterIndex={nextChapterIndexToRead} mangaId={manga.id} />;
        }

        return null;
    }, [chaptersWithMeta, isLatestChapterRead]);

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
                <ChapterListHeader direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">
                        {`${visibleChapters.length} ${t('chapter.title', {
                            count: visibleChapters.length,
                        })}`}
                    </Typography>

                    <Stack direction="row" sx={{ paddingRight: '24px' }}>
                        <Tooltip title={t('chapter.action.mark_as_read.add.label.action.current')}>
                            <IconButton
                                disabled={areAllChaptersRead}
                                onClick={() => handleFabAction('mark_as_read', chaptersWithMeta)}
                            >
                                <DoneAllIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('chapter.action.download.add.label.action')}>
                            <IconButton
                                disabled={areAllChaptersDownloaded}
                                onClick={() => handleFabAction('download', chaptersWithMeta)}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <ChaptersToolbarMenu options={options} optionsDispatch={dispatch} />
                        <SelectableCollectionSelectAll
                            areAllItemsSelected={areAllItemsSelected}
                            areNoItemsSelected={areNoItemsSelected}
                            onChange={(checked) =>
                                handleSelectAll(checked, checked ? chapters.map((chapter) => chapter.id) : [])
                            }
                        />
                    </Stack>
                </ChapterListHeader>

                {noChaptersFound && <EmptyView message={t('chapter.error.label.no_chapter_found')} />}
                {noChaptersMatchingFilter && <EmptyView message={t('chapter.error.label.no_matches')} />}

                <StyledVirtuoso
                    style={{
                        // override Virtuoso default values and set them with class
                        height: 'undefined',
                        // 900 is the md breakpoint in MUI
                        overflowY: window.innerWidth < 900 ? 'visible' : 'auto',
                    }}
                    components={{ Footer: () => <Box sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }} /> }}
                    totalCount={visibleChapters.length}
                    itemContent={(index: number) => (
                        <ChapterCard
                            {...chaptersWithMeta[index]}
                            allChapters={chapters}
                            showChapterNumber={options.showChapterNumber}
                            onSelect={(selected) => handleSelection(chaptersWithMeta[index].chapter.id, selected)}
                        />
                    )}
                    useWindowScroll={window.innerWidth < 900}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {chapterListFAB}
        </>
    );
};
