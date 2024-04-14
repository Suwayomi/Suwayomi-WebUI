/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Warning from '@mui/icons-material/Warning';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import React, { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isNetworkRequestInFlight } from '@apollo/client/core/networkStatus';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext';
import { ChapterList } from '@/components/chapter/ChapterList.tsx';
import { useRefreshManga } from '@/components/manga/useRefreshManga.ts';
import { MangaDetails } from '@/components/manga/MangaDetails';
import { MangaToolbarMenu } from '@/components/manga/MangaToolbarMenu';
import { EmptyView } from '@/components/util/EmptyView';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';

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
        if (manga == null) return;

        const doFetch = !autofetchedRef.current && !manga.initialized;
        if (doFetch) {
            autofetchedRef.current = true;
            refresh();
        }
    }, [manga]);

    useEffect(() => {
        setTitle(manga?.title ?? t('manga.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
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

        return () => {
            setAction(null);
        };
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
