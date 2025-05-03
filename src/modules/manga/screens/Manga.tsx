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
import Box from '@mui/material/Box';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isNetworkRequestInFlight } from '@apollo/client/core/networkStatus';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterList } from '@/modules/chapter/components/ChapterList.tsx';
import { useRefreshManga } from '@/modules/manga/hooks/useRefreshManga.ts';
import { MangaDetails } from '@/modules/manga/components/MangaDetails.tsx';
import { MangaToolbarMenu } from '@/modules/manga/components/MangaToolbarMenu.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { GetMangaScreenQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_SCREEN } from '@/lib/graphql/queries/MangaQuery.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export const Manga: React.FC = () => {
    const { t } = useTranslation();

    const { setTitle, setAction } = useNavBarContext();
    const { id } = useParams<{ id: string }>();
    const autofetchedRef = useRef(false);

    const {
        data,
        error: mangaError,
        loading: isLoading,
        networkStatus,
        refetch,
    } = requestManager.useGetManga<GetMangaScreenQuery>(GET_MANGA_SCREEN, id);
    const isValidating = isNetworkRequestInFlight(networkStatus);
    const manga = data?.manga;

    const [refresh, { loading: refreshing, error: refreshError }] = useRefreshManga(id);

    const error = mangaError ?? refreshError;

    useEffect(() => {
        if (manga == null) return;

        const doFetch = !autofetchedRef.current && !manga.initialized;
        if (doFetch) {
            autofetchedRef.current = true;
            refresh();
        }
    }, [manga]);

    useLayoutEffect(() => {
        setTitle(manga?.title ?? t('manga.title_one'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, manga?.title]);

    useLayoutEffect(() => {
        setAction(
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                }}
            >
                {error && !isValidating && !refreshing && (
                    <CustomTooltip
                        title={
                            <>
                                {t('manga.error.label.request_failure')}
                                <br />
                                {getErrorMessage(error)}
                            </>
                        }
                    >
                        <IconButton onClick={() => refetch()}>
                            <Warning color="error" />
                        </IconButton>
                    </CustomTooltip>
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
        return (
            <EmptyViewAbsoluteCentered
                message={t('manga.error.label.request_failure')}
                messageExtra={getErrorMessage(error)}
            />
        );
    }
    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            {isLoading && <LoadingPlaceholder />}

            {manga && <MangaDetails manga={manga} />}
            {manga && <ChapterList manga={manga} isRefreshing={refreshing} />}
        </Box>
    );
};
