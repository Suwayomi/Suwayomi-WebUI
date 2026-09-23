/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useContentTypeTab } from '@/base/hooks/useContentTypeTab.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { StyledGroupedVirtuoso } from '@/base/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ChapterHistoryCard } from '@/features/history/components/ChapterHistoryCard.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import uniqBy from 'lodash/fp/uniqBy';
import mapValues from 'lodash/fp/mapValues';
import { epochToDate, getDateString } from '@/base/utils/DateHelper.ts';
import difference from 'lodash/fp/difference';
import type { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { OffsetComponentWithContainer } from '@/base/OffsetComponent.tsx';
import { useElementSize } from '@mantine/hooks';

export interface HistoryProps {
    contentType?: SourceContentType;
}

export const History: React.FC<HistoryProps> = ({ contentType: defaultContentType }) => {
    const { t } = useLingui();
    useAppTitle(t`History`);

    const { ref: headerRef, height: headerHeight } = useElementSize();

    const { activeTab, activeContentType, setTabSearchParam } = useContentTypeTab(defaultContentType);

    const {
        data: chapterHistoryData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyReadChapters(undefined, {
        fetchPolicy: 'cache-and-network',
        variables: {
            condition: { contentType: activeContentType },
        },
    });
    const hasNextPage = !!chapterHistoryData?.chapters.pageInfo.hasNextPage;

    const allReadEntries = chapterHistoryData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;
    const readEntries = useMemo(() => uniqBy('mangaId', allReadEntries), [allReadEntries]);

    const [prevReadEntriesLength, setPrevReadEntriesLength] = useState(0);

    const [lastReadEntriesByGroup, otherEntriesByMangaByGroup] = useMemo(() => {
        const groupedEntries = Chapters.groupByDate(allReadEntries, 'lastReadAt');

        const mangaIdByGroup = mapValues(
            (groupEntries) => uniqBy('mangaId', groupEntries).map((entry) => entry.mangaId),
            groupedEntries,
        );

        const entriesByMangaByGroup = mapValues(
            (entries) => Object.groupBy(entries!, (entry) => entry.mangaId),
            groupedEntries,
        );

        const lastReadEntryByMangaByGroup = mapValues(
            (entriesByManga) => mapValues((mangaEntries) => [mangaEntries![0]], entriesByManga),
            entriesByMangaByGroup,
        );

        const lastReadEntryByGroup = mapValues(
            (lastReadEntryByManga) =>
                Object.values(lastReadEntryByManga)
                    .flat()
                    .toSorted((a, b) => {
                        const groupMangaIds = mangaIdByGroup[getDateString(epochToDate(Number(a.lastReadAt)))];

                        return groupMangaIds.indexOf(a.mangaId) - groupMangaIds.indexOf(b.mangaId);
                    }),
            lastReadEntryByMangaByGroup,
        );

        const remainingEntriesByMangaByGroup = mapValues(
            (entriesByManga) =>
                mapValues(
                    (mangaEntries) =>
                        difference(
                            mangaEntries!,
                            lastReadEntryByMangaByGroup[
                                getDateString(epochToDate(Number(mangaEntries![0].lastReadAt)))
                            ]![mangaEntries![0].mangaId],
                        ),
                    entriesByManga,
                ),
            entriesByMangaByGroup,
        );

        return [Object.entries(lastReadEntryByGroup), remainingEntriesByMangaByGroup];
    }, [allReadEntries]);

    const filteredOutAllItemsOfFetchedPage = allReadEntries.length > 0 && readEntries.length === prevReadEntriesLength;

    const lastReadEntriesGroupCounts = useMemo(
        () => lastReadEntriesByGroup.flatMap((entriesByGroup) => entriesByGroup[VirtuosoUtil.ITEMS].length),
        [lastReadEntriesByGroup],
    );
    const lastReadEntries = useMemo(
        () => lastReadEntriesByGroup.flatMap((entriesByGroup) => entriesByGroup[VirtuosoUtil.ITEMS]),
        [lastReadEntriesByGroup],
    );

    const computeLastReadEntryItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        lastReadEntriesGroupCounts,
        useCallback((index) => lastReadEntriesByGroup[index][VirtuosoUtil.GROUP], [lastReadEntriesByGroup]),
        useCallback((index) => lastReadEntries[index].id, [lastReadEntries]),
    );

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({
            variables: {
                offset: allReadEntries.length,
                condition: { contentType: activeContentType },
            },
        }).then(() => setPrevReadEntriesLength(readEntries.length));
    }, [hasNextPage, allReadEntries.length, readEntries.length, activeContentType]);

    useEffect(() => {
        if (filteredOutAllItemsOfFetchedPage && hasNextPage && !isLoading) {
            loadMore();
        }
    }, [filteredOutAllItemsOfFetchedPage, isLoading, hasNextPage, loadMore]);

    const renderContent = () => {
        if (error) {
            return (
                <EmptyViewAbsoluteCentered
                    message={t`Unable to load data`}
                    messageExtra={getErrorMessage(error)}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('History::refetch'))}
                />
            );
        }
        if (!isLoading && readEntries.length === 0) {
            return <EmptyViewAbsoluteCentered message={t`You have not read any series yet.`} />;
        }
        return (
            <StyledGroupedVirtuoso
                key={activeContentType}
                persistKey={`history-scroll-${activeContentType}`}
                heightToSubtract={headerHeight}
                components={{
                    Footer: () => (isLoading ? <LoadingPlaceholder usePadding /> : null),
                }}
                endReached={loadMore}
                groupCounts={lastReadEntriesGroupCounts}
                groupContent={(index) => (
                    <StyledGroupHeader isFirstItem={index === 0}>
                        <Typography variant="h5" component="h2">
                            {lastReadEntriesByGroup[index][VirtuosoUtil.GROUP]}
                        </Typography>
                    </StyledGroupHeader>
                )}
                computeItemKey={computeLastReadEntryItemKey}
                itemContent={(index) => (
                    <StyledGroupItemWrapper>
                        <ChapterHistoryCard
                            chapter={lastReadEntries[index]}
                            otherChapters={
                                otherEntriesByMangaByGroup[
                                    getDateString(epochToDate(Number(lastReadEntries[index].lastReadAt)))
                                ][lastReadEntries[index].mangaId]
                            }
                        />
                    </StyledGroupItemWrapper>
                )}
            />
        );
    };

    return (
        <TabsWrapper>
            <OffsetComponentWithContainer
                sx={{ zIndex: 2 }}
                component={
                    <Box ref={headerRef} sx={{ backgroundColor: 'background.default' }}>
                        <TabsMenu
                            variant="fullWidth"
                            value={activeTab}
                            onChange={(_, newTab) => setTabSearchParam(newTab, 'replaceIn')}
                        >
                            <Tab value="manga" sx={{ textTransform: 'none' }} label={t`Manga History`} />
                            <Tab value="light-novel" sx={{ textTransform: 'none' }} label={t`Light Novel History`} />
                        </TabsMenu>
                    </Box>
                }
            >
                {renderContent()}
            </OffsetComponentWithContainer>
        </TabsWrapper>
    );
};
