/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DownloadIcon from '@mui/icons-material/Download';
import { Box, CardActionArea, styled, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t as translate } from 'i18next';
import { GroupedVirtuoso } from 'react-virtuoso';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { EmptyView } from '@/components/util/EmptyView';
import { DownloadStateIndicator } from '@/components/molecules/DownloadStateIndicator';
import { DownloadType } from '@/lib/graphql/generated/graphql.ts';
import { TChapter } from '@/typings.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { UpdateChecker } from '@/components/library/UpdateChecker.tsx';

const StyledGroupedVirtuoso = styled(GroupedVirtuoso, { shouldForwardProp: (prop) => prop !== 'heightToSubtract' })<{
    heightToSubtract: number;
}>(({ theme, heightToSubtract }) => ({
    // 64px header
    height: `calc(100vh - 64px - ${heightToSubtract}px)`,
    [theme.breakpoints.down('sm')]: {
        // 64px header (margin); 64px menu (margin);
        height: `calc(100vh - 64px - 64px - ${heightToSubtract}px)`,
    },
}));

const StyledGroupHeader = styled(Typography, { shouldForwardProp: (prop) => prop !== 'isFirstItem' })<{
    isFirstItem: boolean;
}>(({ theme, isFirstItem }) => ({
    paddingLeft: '24px',
    // 16px - 10px (bottom padding of the group items)
    paddingTop: '6px',
    paddingBottom: '16px',
    fontWeight: 700,
    textTransform: 'uppercase',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        // 16px - 8px (margin of header)
        paddingTop: isFirstItem ? '8px' : '6px',
    },
}));

const StyledGroupItemWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== 'isLastItem' })<{
    isLastItem: boolean;
}>(({ isLastItem }) => ({
    padding: '0 10px',
    paddingBottom: isLastItem ? '0' : '10px',
}));

function epochToDate(epoch: number) {
    const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epoch);
    return date;
}

function isTheSameDay(first: Date, second: Date) {
    return (
        first.getDate() === second.getDate() &&
        first.getMonth() === second.getMonth() &&
        first.getFullYear() === second.getFullYear()
    );
}

function getDateString(date: Date) {
    const today = new Date();
    if (isTheSameDay(today, date)) return translate('global.date.label.today');
    // calculate yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isTheSameDay(yesterday, date)) return translate('global.date.label.yesterday');
    return date.toLocaleDateString();
}

const groupByDate = (updates: TChapter[]): [date: string, items: number][] => {
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
        fetchMore,
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
    const queue = (downloaderData?.downloadStatus.queue as DownloadType[]) ?? [];

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

    useEffect(() => {
        setTitle(t('updates.title'));

        setAction(<UpdateChecker />);
    }, [t, lastUpdateTimestamp]);

    const downloadForChapter = (chapter: TChapter) => {
        const {
            sourceOrder,
            manga: { id: mangaId },
        } = chapter;
        return queue.find((q) => sourceOrder === q.chapter.sourceOrder && mangaId === q.chapter.manga.id);
    };

    const downloadChapter = (chapter: TChapter) => {
        requestManager.addChapterToDownloadQueue(chapter.id);
    };

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({ variables: { offset: updateEntries.length } });
    }, [hasNextPage, endCursor]);

    if (!isLoading && updateEntries.length === 0) {
        return <EmptyView message={t('updates.error.label.no_updates_available')} />;
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
                    date: lastUpdateTimestamp ? new Date(+lastUpdateTimestamp).toLocaleString() : '-',
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
                    <StyledGroupHeader variant="h5" isFirstItem={index === 0}>
                        {groupedUpdates[index][0]}
                    </StyledGroupHeader>
                )}
                itemContent={(index) => {
                    const chapter = updateEntries[index];
                    const { manga } = chapter;
                    const download = downloadForChapter(chapter);

                    return (
                        <StyledGroupItemWrapper key={index} isLastItem={index === updateEntries.length - 1}>
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
                                            padding: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex' }}>
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    flex: '0 0 auto',
                                                    marginRight: 2,
                                                    imageRendering: 'pixelated',
                                                }}
                                                src={requestManager.getValidImgUrlFor(manga.thumbnailUrl ?? '')}
                                            />
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="h5" component="h2">
                                                    {manga.title}
                                                </Typography>
                                                <Typography variant="caption" display="block" gutterBottom>
                                                    {chapter.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {download && <DownloadStateIndicator download={download} />}
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
