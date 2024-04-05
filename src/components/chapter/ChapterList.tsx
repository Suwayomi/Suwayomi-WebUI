/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Box, CircularProgress, Stack, styled, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { TChapter, TManga } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterCard } from '@/components/chapter/ChapterCard.tsx';
import { ResumeFab } from '@/components/manga/ResumeFAB.tsx';
import { filterAndSortChapters, useChapterOptions } from '@/components/chapter/util.tsx';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { SelectionFAB } from '@/components/collection/SelectionFAB.tsx';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab.tsx';
import { DownloadType } from '@/lib/graphql/generated/graphql.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { SelectableCollectionSelectAll } from '@/components/collection/SelectableCollectionSelectAll.tsx';
import { Chapters } from '@/lib/data/Chapters.ts';
import { ChaptersWithMeta } from '@/lib/data/ChaptersWithMeta.ts';
import { ChapterActionMenuItems } from '@/components/chapter/ChapterActionMenuItems.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { ChaptersToolbarMenu } from '@/components/chapter/ChaptersToolbarMenu';

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

    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = (downloaderData?.downloadStatus.queue as DownloadType[]) ?? [];

    const [options, dispatch] = useChapterOptions(manga.id);
    const { data: chaptersData, loading: isLoading } = requestManager.useGetMangaChapters(manga.id);
    const chapters = useMemo(() => chaptersData?.chapters.nodes ?? [], [chaptersData?.chapters.nodes]);

    const chapterIds = useMemo(() => chapters.map((chapter) => chapter.id), [chapters]);

    const { areNoItemsSelected, areAllItemsSelected, selectedItemIds, handleSelectAll, handleSelection } =
        useSelectableCollection(chapters.length, { itemIds: chapterIds, currentKey: 'default' });

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), [chapters, options]);

    const nextChapterIndexToRead = manga.firstUnreadChapter?.sourceOrder ?? 1;
    const isLatestChapterRead = manga.chapters.totalCount === manga.latestReadChapter?.sourceOrder;

    const areAllChaptersRead = manga.unreadCount === 0;
    const areAllChaptersDownloaded = manga.downloadCount === manga.chapters.totalCount;

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
                        <ChapterActionMenuItems selectedChapters={selectedChapters} onClose={handleClose} />
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
                                onClick={() =>
                                    Chapters.markAsRead(
                                        ChaptersWithMeta.getChapters(ChaptersWithMeta.getNonRead(chaptersWithMeta)),
                                        true,
                                    )
                                }
                            >
                                <DoneAllIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('chapter.action.download.add.label.action')}>
                            <IconButton
                                disabled={areAllChaptersDownloaded}
                                onClick={() =>
                                    Chapters.download(
                                        ChaptersWithMeta.getIds(ChaptersWithMeta.getNonDownloaded(chaptersWithMeta)),
                                    ).catch(defaultPromiseErrorHandler('ChapterList::download'))
                                }
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
                            onSelect={(selected, selectRange) =>
                                handleSelection(chaptersWithMeta[index].chapter.id, selected, { selectRange })
                            }
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
