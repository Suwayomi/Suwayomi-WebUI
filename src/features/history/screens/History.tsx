/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import React, { useCallback, useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
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
import type { GetChaptersHistoryQuery } from '@/lib/graphql/generated/graphql.ts';
type HistoryNode = NonNullable<GetChaptersHistoryQuery['chapters']['nodes']>[number];

export const History: React.FC = () => {
    const { t } = useLingui();

    useAppTitle(t`History`);

    const {
        data: chapterHistoryData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyReadChapters(undefined, {
        fetchPolicy: 'cache-and-network',
    });
    const hasNextPage = !!chapterHistoryData?.chapters.pageInfo.hasNextPage;
    const endCursor = chapterHistoryData?.chapters.pageInfo.endCursor;
    const readEntries = chapterHistoryData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;

    const groupedHistory = useMemo(() => {
        const groups = Object.entries(Chapters.groupByManga(readEntries as HistoryNode[]));

        return groups.map(([key, value]) => {
            const sortedChapters = [...value.chapters].sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));

            const firstChapterName = sortedChapters[0]?.name;
            const lastChapterName = sortedChapters[sortedChapters.length - 1]?.name;

            let chapterRange = '';
            if (firstChapterName && lastChapterName) {
                chapterRange =
                    firstChapterName === lastChapterName
                        ? ` (${firstChapterName})`
                        : ` (${firstChapterName} - ${lastChapterName})`;
            }

            return {
                key,
                manga: value.manga,
                chapters: value.chapters,
                chapterRange,
            };
        });
    }, [readEntries]);

    const groupCounts = useMemo(() => groupedHistory.map((g) => g.chapters.length), [groupedHistory]);

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => groupedHistory[index].manga.id.toString(), [groupedHistory]),
        useCallback((index) => readEntries[index].id.toString(), [readEntries]),
    );

    const loadMore = useCallback(() => {
        if (!hasNextPage || isLoading) {return;}
        fetchMore({ variables: { after: endCursor } });
    }, [hasNextPage, endCursor, fetchMore, isLoading]);

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
            persistKey="history"
            components={{
                Footer: () => (isLoading ? <LoadingPlaceholder usePadding /> : null),
            }}
            overscan={window.innerHeight * 0.5}
            endReached={loadMore}
            groupCounts={groupCounts}
            groupContent={(index) => (
                <StyledGroupHeader isFirstItem={index === 0}>
                    <Typography variant="h5" component="h2">
                        {groupedHistory[index].manga.title}
                        {groupedHistory[index].chapterRange}
                    </Typography>
                </StyledGroupHeader>
            )}
            computeItemKey={computeItemKey}
            itemContent={(index) => (
                <StyledGroupItemWrapper>
                    <ChapterHistoryCard chapter={readEntries[index]} />
                </StyledGroupItemWrapper>
            )}
        />
    );
};
