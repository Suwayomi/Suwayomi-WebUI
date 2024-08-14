/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ComponentProps, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterCard } from '@/components/chapter/ChapterCard.tsx';
import { ResumeFab } from '@/components/manga/ResumeFAB.tsx';
import { filterAndSortChapters, useChapterOptions } from '@/components/chapter/util.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { ChaptersToolbarMenu } from '@/components/chapter/ChaptersToolbarMenu.tsx';
import { SelectionFAB } from '@/components/collection/SelectionFAB.tsx';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab.tsx';
import {
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
    MangaScreenFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { SelectableCollectionSelectAll } from '@/components/collection/SelectableCollectionSelectAll.tsx';
import { Chapters } from '@/lib/data/Chapters.ts';
import { ChaptersWithMeta, ChapterWithMetaType } from '@/lib/data/ChaptersWithMeta.ts';
import { ChapterActionMenuItems } from '@/components/chapter/ChapterActionMenuItems.tsx';
import { ChaptersDownloadActionMenuItems } from '@/components/chapter/ChaptersDownloadActionMenuItems.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/queries/ChapterQuery.ts';
import { Mangas } from '@/lib/data/Mangas';

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

export interface IChapterWithMeta extends ChapterWithMetaType<ComponentProps<typeof ChapterCard>['chapter']> {
    selected: boolean | null;
}

export const ChapterList = ({
    manga,
    isRefreshing,
}: {
    manga: Pick<MangaScreenFieldsFragment, 'id' | 'firstUnreadChapter' | 'chapters' | 'unreadCount' | 'downloadCount'>;
    isRefreshing: boolean;
}) => {
    const { t } = useTranslation();

    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const [options, dispatch] = useChapterOptions(manga.id);
    const {
        data: chaptersData,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetMangaChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
        GET_CHAPTERS_MANGA,
        manga.id,
        { notifyOnNetworkStatusChange: true },
    );
    const chapters = useMemo(() => chaptersData?.chapters.nodes ?? [], [chaptersData?.chapters.nodes]);

    const chapterIds = useMemo(() => chapters.map((chapter) => chapter.id), [chapters]);

    const { areNoItemsSelected, areAllItemsSelected, selectedItemIds, handleSelectAll, handleSelection } =
        useSelectableCollection(chapters.length, { itemIds: chapterIds, currentKey: 'default' });

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), [chapters, options]);

    const nextChapterIndexToRead = manga.firstUnreadChapter?.sourceOrder;

    const areAllChaptersRead = Mangas.isFullyRead(manga);
    const areAllChaptersDownloaded = Mangas.isFullyDownloaded(manga);

    const noChaptersFound = chapters.length === 0;
    const noChaptersMatchingFilter = !noChaptersFound && visibleChapters.length === 0;

    const chaptersWithMeta: IChapterWithMeta[] = useMemo(
        () =>
            visibleChapters.map((chapter) => {
                const downloadChapter = queue?.find((cd) => cd.chapter.id === chapter.id);
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
                <SelectionFAB selectedItemsCount={selectedChapters.length} title="chapter.title_one">
                    {(handleClose) => (
                        <ChapterActionMenuItems selectedChapters={selectedChapters} onClose={handleClose} />
                    )}
                </SelectionFAB>
            );
        }

        if (nextChapterIndexToRead !== undefined) {
            return <ResumeFab chapterIndex={nextChapterIndexToRead} mangaId={manga.id} />;
        }

        return null;
    }, [chaptersWithMeta]);

    if (isLoading || (noChaptersFound && isRefreshing)) {
        return (
            <Stack sx={{ justifyContent: 'center', alignItems: 'center', position: 'relative', flexGrow: 1 }}>
                <LoadingPlaceholder />
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack sx={{ justifyContent: 'center', position: 'relative', flexGrow: 1 }}>
                <EmptyViewAbsoluteCentered
                    message={t('global.error.label.failed_to_load_data')}
                    messageExtra={error.message}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('ChapterList::refetch'))}
                />
            </Stack>
        );
    }

    return (
        <>
            <Stack direction="column" sx={{ position: 'relative' }}>
                <ChapterListHeader direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">
                        {`${visibleChapters.length} ${t('chapter.title_one', {
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
                                        manga.id,
                                    )
                                }
                            >
                                <DoneAllIcon />
                            </IconButton>
                        </Tooltip>
                        <PopupState variant="popover" popupId="chapterlist-download-button">
                            {(popupState) => (
                                <>
                                    <Tooltip title={t('chapter.action.download.add.label.action')}>
                                        <IconButton disabled={areAllChaptersDownloaded} {...bindTrigger(popupState)}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {popupState.isOpen && (
                                        <Menu {...bindMenu(popupState)}>
                                            <ChaptersDownloadActionMenuItems
                                                mangaIds={[manga.id]}
                                                closeMenu={popupState.close}
                                            />
                                        </Menu>
                                    )}
                                </>
                            )}
                        </PopupState>

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

                {noChaptersFound && <EmptyViewAbsoluteCentered message={t('chapter.error.label.no_chapter_found')} />}
                {noChaptersMatchingFilter && (
                    <EmptyViewAbsoluteCentered message={t('chapter.error.label.no_matches')} />
                )}

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
