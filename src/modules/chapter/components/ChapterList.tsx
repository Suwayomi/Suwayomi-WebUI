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
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { ChapterCard } from '@/modules/chapter/components/cards/ChapterCard.tsx';
import { ResumeFab } from '@/modules/manga/components/ResumeFAB.tsx';
import { filterAndSortChapters } from '@/modules/chapter/utils/ChapterList.util.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { ChaptersToolbarMenu } from '@/modules/chapter/components/ChaptersToolbarMenu.tsx';
import { SelectionFAB } from '@/modules/collection/components/SelectionFAB.tsx';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/modules/core/components/buttons/StyledFab.tsx';
import {
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
    MangaScreenFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import { useSelectableCollection } from '@/modules/collection/hooks/useSelectableCollection.ts';
import { SelectableCollectionSelectAll } from '@/modules/collection/components/SelectableCollectionSelectAll.tsx';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { ChaptersWithMeta, ChapterWithMetaType } from '@/modules/chapter/services/ChaptersWithMeta.ts';
import { ChapterActionMenuItems } from '@/modules/chapter/components/actions/ChapterActionMenuItems.tsx';
import { ChaptersDownloadActionMenuItems } from '@/modules/chapter/components/actions/ChaptersDownloadActionMenuItems.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/queries/ChapterQuery.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { shouldForwardProp } from '@/modules/core/utils/ShouldForwardProp.ts';
import { useChapterOptions } from '@/modules/chapter/hooks/useChapterOptions.tsx';

type ChapterListHeaderProps = {
    scrollbarWidth: number;
};
const ChapterListHeader = styled(Stack, {
    shouldForwardProp: shouldForwardProp<ChapterListHeaderProps>(['scrollbarWidth']),
})<ChapterListHeaderProps>(({ theme, scrollbarWidth }) => ({
    padding: theme.spacing(1),
    paddingRight: `calc(${scrollbarWidth}px + ${theme.spacing(1)})`,
    paddingBottom: 0,
    [theme.breakpoints.down('md')]: {
        paddingRight: theme.spacing(1),
    },
}));

type StyledVirtuosoProps = { topOffset: number };
const StyledVirtuoso = styled(Virtuoso, {
    shouldForwardProp: shouldForwardProp<StyledVirtuosoProps>(['topOffset']),
})<StyledVirtuosoProps>(({ theme, topOffset }) => ({
    listStyle: 'none',
    padding: 0,
    [theme.breakpoints.up('md')]: {
        height: `calc(100vh - ${topOffset}px)`,
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
    const { appBarHeight } = useNavBarContext();

    const isMobileWidth = MediaQuery.useIsBelowWidth('md');

    const [chapterListHeaderHeight, setChapterListHeaderHeight] = useState(50);
    const [chapterListHeaderRef, setChapterListHeaderRef] = useState<HTMLDivElement | null>(null);
    useResizeObserver(
        chapterListHeaderRef,
        useCallback(() => setChapterListHeaderHeight(chapterListHeaderRef?.offsetHeight ?? 0), [chapterListHeaderRef]),
    );

    const scrollbarWidth = MediaQuery.useGetScrollbarSize('width');

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
            <Stack direction="column" sx={{ position: 'relative', flexBasis: '60%' }}>
                <ChapterListHeader
                    ref={setChapterListHeaderRef}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    scrollbarWidth={scrollbarWidth}
                >
                    <Typography variant="h5" component="h3">
                        {`${visibleChapters.length} ${t('chapter.title_one', {
                            count: visibleChapters.length,
                        })}`}
                    </Typography>

                    <Stack direction="row">
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
                    topOffset={appBarHeight + chapterListHeaderHeight}
                    style={{
                        // override Virtuoso default values and set them with class
                        height: 'undefined',
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
                    useWindowScroll={isMobileWidth}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {chapterListFAB}
        </>
    );
};
