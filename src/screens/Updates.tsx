/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Refresh from '@mui/icons-material/Refresh';
import { requestManager } from '@/lib/requests/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ChapterType, DownloadState } from '@/lib/graphql/generated/graphql.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { UpdateChecker } from '@/modules/core/components/UpdateChecker.tsx';
import { StyledGroupedVirtuoso } from '@/modules/core/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/modules/core/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { dateTimeFormatter, epochToDate, getDateString } from '@/util/DateHelper.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { ChapterIdInfo, ChapterMangaInfo } from '@/modules/chapter/services/Chapters.ts';
import { makeToast } from '@/lib/ui/Toast.ts';

const groupByDate = (updates: Pick<ChapterType, 'fetchedAt'>[]): [date: string, items: number][] => {
    if (!updates.length) {
        return [];
    }

    const dateToItemMap = new Map<string, number>();
    updates.forEach((item) => {
        const date = getDateString(epochToDate(Number(item.fetchedAt)));
        dateToItemMap.set(date, (dateToItemMap.get(date) ?? 0) + 1);
    });

    return [...dateToItemMap.entries()];
};

export const Updates: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const { setTitle, setAction } = useContext(NavBarContext);
    const {
        data: chapterUpdateData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyUpdatedChapters(undefined, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const hasNextPage = !!chapterUpdateData?.chapters.pageInfo.hasNextPage;
    const endCursor = chapterUpdateData?.chapters.pageInfo.endCursor;
    const updateEntries = chapterUpdateData?.chapters.nodes ?? [];
    const groupedUpdates = useMemo(() => groupByDate(updateEntries), [updateEntries]);
    const groupCounts: number[] = useMemo(() => groupedUpdates.map((group) => group[1]), [groupedUpdates]);
    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const lastUpdateTimestampCompRef = useRef<HTMLElement>(null);
    const [lastUpdateTimestampCompHeight, setLastUpdateTimestampCompHeight] = useState(0);
    useLayoutEffect(() => {
        setLastUpdateTimestampCompHeight(lastUpdateTimestampCompRef.current?.clientHeight ?? 0);
    }, [lastUpdateTimestampCompRef.current]);

    const { data: lastUpdateTimestampData } = requestManager.useGetLastGlobalUpdateTimestamp({
        /**
         * The {@link UpdateChecker} is responsible for updating the timestamp
         */
        fetchPolicy: 'cache-only',
    });
    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;

    useLayoutEffect(() => {
        setTitle(t('updates.title'));
        setAction(<UpdateChecker />);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, lastUpdateTimestamp]);

    const downloadForChapter = (chapter: Pick<ChapterType, 'sourceOrder'> & ChapterMangaInfo) => {
        const { sourceOrder, mangaId } = chapter;
        return queue.find((q) => sourceOrder === q.chapter.sourceOrder && mangaId === q.manga.id);
    };

    const handleRetry = async (chapter: ChapterIdInfo) => {
        try {
            await requestManager.addChapterToDownloadQueue(chapter.id).response;
        } catch (e) {
            makeToast(t('download.queue.error.label.failed_to_remove'), 'error');
        }
    };

    const downloadChapter = (chapter: ChapterIdInfo) => {
        requestManager
            .addChapterToDownloadQueue(chapter.id)
            .response.catch(() => makeToast(t('global.error.label.failed_to_save_changes'), 'error'));
    };

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({ variables: { offset: updateEntries.length } });
    }, [hasNextPage, endCursor]);

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Updates::refetch'))}
            />
        );
    }

    if (!isLoading && updateEntries.length === 0) {
        return <EmptyViewAbsoluteCentered message={t('updates.error.label.no_updates_available')} />;
    }

    return (
        <>
            <Typography
                ref={lastUpdateTimestampCompRef}
                sx={{
                    marginLeft: '10px',
                    paddingTop: (theme) => ({ [theme.breakpoints.up('sm')]: { paddingTop: '6px' } }),
                }}
            >
                {t('library.settings.global_update.label.last_update', {
                    date: lastUpdateTimestamp ? dateTimeFormatter.format(+lastUpdateTimestamp) : '-',
                })}
            </Typography>
            <StyledGroupedVirtuoso
                heightToSubtract={lastUpdateTimestampCompHeight}
                style={{
                    // override Virtuoso default values and set them with class
                    height: 'undefined',
                }}
                components={{
                    Footer: () => (isLoading ? <LoadingPlaceholder usePadding /> : null),
                }}
                overscan={window.innerHeight * 0.5}
                endReached={loadMore}
                groupCounts={groupCounts}
                groupContent={(index) => (
                    <StyledGroupHeader variant="h5" component="h2" isFirstItem={index === 0}>
                        {groupedUpdates[index][0]}
                    </StyledGroupHeader>
                )}
                itemContent={(index) => {
                    const chapter = updateEntries[index];
                    const { manga } = chapter;
                    const download = downloadForChapter(chapter);

                    return (
                        <StyledGroupItemWrapper key={index}>
                            <Card>
                                <CardActionArea
                                    component={Link}
                                    to={`/manga/${chapter.manga.id}/chapter/${chapter.sourceOrder}`}
                                    state={location.state}
                                    sx={{
                                        color: (theme) => theme.palette.text[chapter.isRead ? 'disabled' : 'primary'],
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex' }}>
                                            <Link to={`/manga/${chapter.manga.id}`} style={{ textDecoration: 'none' }}>
                                                <Avatar
                                                    variant="rounded"
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        flex: '0 0 auto',
                                                        marginRight: 1,
                                                        background: 'transparent',
                                                    }}
                                                >
                                                    <SpinnerImage
                                                        imgStyle={{
                                                            objectFit: 'cover',
                                                            width: '100%',
                                                            height: '100%',
                                                            imageRendering: 'pixelated',
                                                        }}
                                                        spinnerStyle={{ small: true }}
                                                        alt={manga.title}
                                                        src={Mangas.getThumbnailUrl(manga)}
                                                    />
                                                </Avatar>
                                            </Link>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    flexGrow: 1,
                                                    flexShrink: 1,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                <TypographyMaxLines variant="h6" component="h3">
                                                    {manga.title}
                                                </TypographyMaxLines>
                                                <TypographyMaxLines variant="caption" display="block" lines={1}>
                                                    {chapter.name}
                                                </TypographyMaxLines>
                                            </Box>
                                        </Box>
                                        {download && <DownloadStateIndicator download={download} />}
                                        {download?.state === DownloadState.Error && (
                                            <Tooltip title={t('global.button.retry')}>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleRetry(download.chapter);
                                                    }}
                                                    size="large"
                                                >
                                                    <Refresh />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {download == null && !chapter.isDownloaded && (
                                            <Tooltip title={t('chapter.action.download.add.label.action')}>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        downloadChapter(chapter);
                                                    }}
                                                    size="large"
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </StyledGroupItemWrapper>
                    );
                }}
            />
        </>
    );
};
