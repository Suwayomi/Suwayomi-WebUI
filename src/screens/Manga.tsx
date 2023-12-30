/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Warning } from '@mui/icons-material';
import { CircularProgress, IconButton, Stack, Tooltip, Box } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isNetworkRequestInFlight } from '@apollo/client/core/networkStatus';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext';
import { ChapterList } from '@/components/chapter/ChapterList.tsx';
import { useRefreshManga } from '@/components/manga/hooks';
import { MangaDetails } from '@/components/manga/MangaDetails';
import { MangaToolbarMenu } from '@/components/manga/MangaToolbarMenu';
import { EmptyView } from '@/components/util/EmptyView';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';

const AUTOFETCH_AGE = 1000 * 60 * 60 * 24; // 24 hours

export const Manga: React.FC = () => {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavBarContext);
    const { id } = useParams<{ id: string }>();
    const autofetchedRef = useRef(false);

    const { data, error, loading: isLoading, networkStatus, refetch } = requestManager.useGetManga(id);
    const isValidating = isNetworkRequestInFlight(networkStatus);
    const manga = data?.manga;

    const [refresh, { loading: refreshing }] = useRefreshManga(id);
    useSetDefaultBackTo('library');

    useEffect(() => {
        // Automatically fetch manga from source if data is older then 24 hours OR manga is not initialized yet
        // Automatic fetch is done only once, to prevent issues when server does
        // not update age for some reason (ie. error on source side)
        if (manga == null) return;

        const isOutdated =
            Date.now() - Number(manga.lastFetchedAt) * 1000 > AUTOFETCH_AGE ||
            Date.now() - Number(manga.chaptersLastFetchedAt) * 1000 > AUTOFETCH_AGE;
        const refetchBecauseOutdated = manga.inLibrary && isOutdated;

        const doFetch = !autofetchedRef.current && (refetchBecauseOutdated || !manga.initialized);
        if (doFetch) {
            autofetchedRef.current = true;
            refresh();
        }
    }, [manga]);

    useEffect(() => {
        setTitle(manga?.title ?? t('manga.title'));
        setAction(null);
    }, [t, manga?.title]);

    useEffect(() => {
        setAction(
            <Stack direction="row" alignItems="center">
                {error && !isValidating && !refreshing && (
                    <Tooltip
                        title={
                            <>
                                {t('manga.error.label.request_failure')}
                                <br />
                                {error.message ?? error}
                            </>
                        }
                    >
                        <IconButton onClick={() => refetch()}>
                            <Warning color="error" />
                        </IconButton>
                    </Tooltip>
                )}
                {manga && (refreshing || isValidating) && (
                    <IconButton disabled>
                        <CircularProgress size={16} />
                    </IconButton>
                )}
                {manga && <MangaToolbarMenu manga={manga} onRefresh={refresh} refreshing={refreshing} />}
            </Stack>,
        );
    }, [t, error, isValidating, refreshing, manga, refresh]);

    if (error && !manga) {
        return <EmptyView message={t('manga.error.label.request_failure')} messageExtra={error.message ?? error} />;
    }
    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            {isLoading && <LoadingPlaceholder />}

            {manga && <MangaDetails manga={manga} />}
            {manga && <ChapterList manga={manga} isRefreshing={refreshing} />}
        </Box>
    );
};
