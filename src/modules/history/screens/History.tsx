/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { StyledGroupedVirtuoso } from '@/modules/core/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/modules/core/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { epochToDate, getDateString } from '@/util/DateHelper.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { ChapterHistoryCard } from '@/modules/history/components/ChapterHistoryCard.tsx';

const groupByDate = (histories: Pick<ChapterType, 'lastReadAt'>[]): [date: string, items: number][] => {
    if (!histories.length) {
        return [];
    }

    const dateToItemMap = new Map<string, number>();
    histories.forEach((item) => {
        const date = getDateString(epochToDate(Number(item.lastReadAt)));
        dateToItemMap.set(date, (dateToItemMap.get(date) ?? 0) + 1);
    });

    return [...dateToItemMap.entries()];
};

export const History = ({ tabsMenuHeight }: { tabsMenuHeight: number }) => {
    const { t } = useTranslation();

    const { setTitle } = useNavBarContext();
    const {
        data: chapterHistoryData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyReadChapters(undefined, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const hasNextPage = !!chapterHistoryData?.chapters.pageInfo.hasNextPage;
    const endCursor = chapterHistoryData?.chapters.pageInfo.endCursor;
    const readEntries = chapterHistoryData?.chapters.nodes ?? [];
    const groupedHistory = useMemo(() => groupByDate(readEntries), [readEntries]);
    const groupCounts: number[] = useMemo(() => groupedHistory.map((group) => group[1]), [groupedHistory]);

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => groupedHistory[index][0], [groupedHistory]),
        useCallback((index) => readEntries[index].id, [readEntries]),
    );

    useLayoutEffect(() => {
        setTitle(t('history.title'));

        return () => {
            setTitle('');
        };
    }, [t]);

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({ variables: { offset: readEntries.length } });
    }, [hasNextPage, endCursor]);

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('History::refetch'))}
            />
        );
    }

    if (!isLoading && readEntries.length === 0) {
        return <EmptyViewAbsoluteCentered message={t('history.error.label.no_history_available')} />;
    }

    return (
        <StyledGroupedVirtuoso
            heightToSubtract={tabsMenuHeight}
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
                <StyledGroupHeader isFirstItem={index === 0}>
                    <Typography variant="h5" component="h2">
                        {groupedHistory[index][0]}
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
