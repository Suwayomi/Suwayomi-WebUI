/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DownloadIcon from '@mui/icons-material/Download';
import { CardActionArea } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, styled } from '@mui/system';
import NavbarContext from 'components/context/NavbarContext';
import DownloadStateIndicator from 'components/molecules/DownloadStateIndicator';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { IChapter, IMangaChapter, IQueue } from 'typings';
import { useTranslation } from 'react-i18next';
import { t as translate } from 'i18next';
import requestManager from 'lib/RequestManager';
import { GroupedVirtuoso } from 'react-virtuoso';

type GroupedUpdateItem = { item: IMangaChapter; globalIdx: number };
type GroupedUpdate = [date: string, items: GroupedUpdateItem[]];

const StyledGroupedVirtuoso = styled(GroupedVirtuoso)(({ theme }) => ({
    // 64px header
    height: 'calc(100vh - 64px)',
    [theme.breakpoints.down('sm')]: {
        // 64px header (margin); 64px menu (margin);
        height: 'calc(100vh - 64px - 64px)',
    },
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

function groupByDate(updates: IMangaChapter[]): GroupedUpdate[] {
    if (updates.length === 0) return [];

    const groups: { [date: string]: GroupedUpdateItem[] } = {};
    updates.forEach((item, globalIdx) => {
        const key = getDateString(epochToDate(item.chapter.fetchedAt));
        if (groups[key] === undefined) groups[key] = [];
        groups[key].push({ item, globalIdx });
    });

    return Object.keys(groups).map((key) => [key, groups[key]]);
}

const initialQueue = {
    status: 'Stopped',
    queue: [],
} as IQueue;

const Updates: React.FC = () => {
    const { t } = useTranslation();
    const history = useHistory();

    const { setTitle, setAction } = useContext(NavbarContext);
    const {
        data: pages = [{ hasNextPage: false, page: [] }],
        isLoading,
        size: loadedPages,
        setSize: setPages,
    } = requestManager.useGetRecentlyUpdatedChapters();
    const { hasNextPage } = pages[pages.length - 1];
    const updateEntries = useMemo(
        () => pages.map((page) => page.page).reduce((lastPageChapters, chapters) => [...lastPageChapters, ...chapters]),
        [pages],
    );
    const groupedUpdates = useMemo(() => groupByDate(updateEntries), [updateEntries]);
    const groupCounts: number[] = useMemo(() => groupedUpdates.map((group) => group[1].length), [groupedUpdates]);

    const [, setWsClient] = useState<WebSocket>();
    const [{ queue }, setQueueState] = useState<IQueue>(initialQueue);

    useEffect(() => {
        const wsc = requestManager.getDownloadWebSocket();
        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as IQueue;
            setQueueState(data);
        };

        setWsClient(wsc);

        return () => wsc.close();
    }, []);

    useEffect(() => {
        setTitle(t('updates.title'));

        setAction(null);
    }, [t]);

    if (!isLoading && updateEntries.length === 0) {
        return <EmptyView message={t('updates.error.label.no_updates_available')} />;
    }

    const downloadForChapter = (chapter: IChapter) => {
        const { index, mangaId } = chapter;
        return queue.find((q) => index === q.chapterIndex && mangaId === q.mangaId);
    };

    const downloadChapter = (chapter: IChapter) => {
        requestManager.addChapterToDownloadQueue(chapter.mangaId, chapter.index);
    };

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        setPages(loadedPages + 1);
    }, [hasNextPage, loadedPages]);

    return (
        <StyledGroupedVirtuoso
            style={{
                // override Virtuoso default values and set them with class
                height: 'undefined',
            }}
            components={{
                Footer: () => (isLoading ? <LoadingPlaceholder /> : null),
            }}
            overscan={window.innerHeight * 0.5}
            endReached={loadMore}
            groupCounts={groupCounts}
            groupContent={(index) => (
                <Typography
                    variant="h5"
                    sx={{
                        ml: 3,
                        my: 2,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                    }}
                >
                    {groupedUpdates[index][0]}
                </Typography>
            )}
            itemContent={(index) => {
                const { chapter, manga } = updateEntries[index];
                const download = downloadForChapter(chapter);

                return (
                    <Card key={index}>
                        <CardActionArea
                            component={Link}
                            to={{
                                pathname: `/manga/${chapter.mangaId}/chapter/${chapter.index}`,
                                state: history.location.state,
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
                                        src={requestManager.getValidImgUrlFor(manga.thumbnailUrl)}
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
                                {download == null && !chapter.downloaded && (
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
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                );
            }}
        />
    );
};

export default Updates;
