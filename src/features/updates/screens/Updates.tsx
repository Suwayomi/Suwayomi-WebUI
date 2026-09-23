/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useContentTypeTab } from '@/base/hooks/useContentTypeTab.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { UpdateChecker } from '@/features/updates/components/UpdateChecker.tsx';
import { SyncButton } from '@/features/sync/components/SyncButton.tsx';
import { StyledGroupedVirtuoso } from '@/base/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { dateTimeFormatter, epochToDate, getDateString } from '@/base/utils/DateHelper.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ChapterUpdateCard } from '@/features/updates/components/ChapterUpdateCard.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import mapValues from 'lodash/fp/mapValues';
import difference from 'lodash/fp/difference';
import uniqBy from 'lodash/fp/uniqBy';
import { OffsetComponentWithContainer } from '@/base/OffsetComponent.tsx';
import { useElementSize } from '@mantine/hooks';
import type { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';

export interface UpdatesProps {
    contentType?: SourceContentType;
}

export const Updates: React.FC<UpdatesProps> = ({ contentType: defaultContentType }) => {
    const { t } = useLingui();
    const { activeTab, activeContentType, setTabSearchParam } = useContentTypeTab(defaultContentType);

    useAppTitleAndAction(
        t`Updates`,
        <>
            <SyncButton />
            <UpdateChecker contentType={activeContentType} />
        </>,
    );

    const { ref: headerRef, height: headerHeight } = useElementSize();

    const {
        data: chapterUpdateData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyUpdatedChapters(undefined, {
        fetchPolicy: 'cache-and-network',
        variables: {
            condition: { contentType: activeContentType },
        },
    });
    const hasNextPage = !!chapterUpdateData?.chapters.pageInfo.hasNextPage;
    const allUpdateEntries = chapterUpdateData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;

    const [prevUpdateEntriesCount, setPrevUpdateEntriesCount] = useState(0);

    const [firstUnreadUpdatesByGroup, otherUpdatesByMangaByGroup] = useMemo(() => {
        const groupedEntries = Chapters.groupByDate(allUpdateEntries, 'fetchedAt');

        const mangaIdByGroup = mapValues(
            (groupEntries) => uniqBy('mangaId', groupEntries).map((entry) => entry.mangaId),
            groupedEntries,
        );

        const entriesByMangaByGroup = mapValues(
            (entries) => Object.groupBy(entries!, (entry) => entry.mangaId),
            groupedEntries,
        );

        const firstUnreadEntryByMangaByGroup = mapValues(
            (entriesByManga) =>
                mapValues(
                    (mangaEntries) => [mangaEntries!.findLast((entry) => !entry.isRead) ?? mangaEntries![0]],
                    entriesByManga,
                ),
            entriesByMangaByGroup,
        );
        const firstUnreadEntryByGroup = mapValues(
            (firstUnreadEntryByManga) =>
                Object.values(firstUnreadEntryByManga)
                    .flat()
                    .toSorted((a, b) => {
                        const groupMangaIds = mangaIdByGroup[getDateString(epochToDate(Number(a.fetchedAt)))];

                        return groupMangaIds.indexOf(a.mangaId) - groupMangaIds.indexOf(b.mangaId);
                    }),
            firstUnreadEntryByMangaByGroup,
        );
        const remainingEntriesByMangaByGroup = mapValues(
            (entriesByManga) =>
                mapValues(
                    (mangaEntries) =>
                        difference(
                            mangaEntries!,
                            firstUnreadEntryByMangaByGroup[
                                getDateString(epochToDate(Number(mangaEntries![0].fetchedAt)))
                            ]![mangaEntries![0].mangaId],
                        ),
                    entriesByManga,
                ),
            entriesByMangaByGroup,
        );

        return [Object.entries(firstUnreadEntryByGroup), remainingEntriesByMangaByGroup];
    }, [allUpdateEntries]);

    const firstUnreadUpdatesGroupCounts = useMemo(
        () => firstUnreadUpdatesByGroup.map((updatesByGroup) => updatesByGroup[VirtuosoUtil.ITEMS].length),
        [firstUnreadUpdatesByGroup],
    );
    const firstUnreadUpdatesEntries = useMemo(
        () => firstUnreadUpdatesByGroup.flatMap((updatesByGroup) => updatesByGroup[VirtuosoUtil.ITEMS]),
        [firstUnreadUpdatesByGroup],
    );

    const computeFirstUnreadUpdateItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        firstUnreadUpdatesGroupCounts,
        useCallback((index) => firstUnreadUpdatesByGroup[index][VirtuosoUtil.GROUP], [firstUnreadUpdatesByGroup]),
        useCallback((index) => firstUnreadUpdatesEntries[index].id, [firstUnreadUpdatesEntries]),
    );

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({
            variables: {
                offset: allUpdateEntries.length,
                condition: { contentType: activeContentType },
            },
        }).then(() => setPrevUpdateEntriesCount(firstUnreadUpdatesEntries.length));
    }, [hasNextPage, allUpdateEntries.length, firstUnreadUpdatesEntries.length, activeContentType]);

    const filteredOutAllItemsOfFetchedPage =
        allUpdateEntries.length > 0 && prevUpdateEntriesCount === firstUnreadUpdatesEntries.length;
    useEffect(() => {
        if (filteredOutAllItemsOfFetchedPage && hasNextPage && !isLoading) {
            loadMore();
        }
    }, [isLoading, hasNextPage, filteredOutAllItemsOfFetchedPage, loadMore]);

    const { data: lastUpdateTimestampData } = requestManager.useGetLastContentUpdateTimestamp(activeContentType, {
        fetchPolicy: 'cache-only',
    });
    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;
    const date = lastUpdateTimestamp ? dateTimeFormatter.format(+lastUpdateTimestamp) : '-';

    const renderContent = () => {
        if (error) {
            return (
                <EmptyViewAbsoluteCentered
                    message={t`Unable to load data`}
                    messageExtra={getErrorMessage(error)}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('Updates::refetch'))}
                />
            );
        }
        if (!isLoading && firstUnreadUpdatesEntries.length === 0) {
            return <EmptyViewAbsoluteCentered message={t`You don't have any updates yet.`} />;
        }
        return (
            <StyledGroupedVirtuoso
                key={activeContentType}
                persistKey={`updates-scroll-${activeContentType}`}
                heightToSubtract={headerHeight}
                components={{
                    Footer: () => (isLoading ? <LoadingPlaceholder usePadding /> : null),
                }}
                endReached={loadMore}
                groupCounts={firstUnreadUpdatesGroupCounts}
                groupContent={(index) => (
                    <StyledGroupHeader isFirstItem={index === 0}>
                        <Typography variant="h5" component="h2">
                            {firstUnreadUpdatesByGroup[index][VirtuosoUtil.GROUP]}
                        </Typography>
                    </StyledGroupHeader>
                )}
                computeItemKey={computeFirstUnreadUpdateItemKey}
                itemContent={(index) => (
                    <StyledGroupItemWrapper>
                        <ChapterUpdateCard
                            chapter={firstUnreadUpdatesEntries[index]}
                            otherChapters={
                                otherUpdatesByMangaByGroup[
                                    getDateString(epochToDate(Number(firstUnreadUpdatesEntries[index].fetchedAt)))
                                ][firstUnreadUpdatesEntries[index].mangaId]
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
                            <Tab value="manga" sx={{ textTransform: 'none' }} label={t`Manga Updates`} />
                            <Tab value="light-novel" sx={{ textTransform: 'none' }} label={t`Light Novel Updates`} />
                        </TabsMenu>
                        <Typography
                            sx={{
                                pl: '10px',
                                py: '6px',
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                            }}
                        >
                            {t`Last update: ${date}`}
                        </Typography>
                    </Box>
                }
            >
                {renderContent()}
            </OffsetComponentWithContainer>
        </TabsWrapper>
    );
};
