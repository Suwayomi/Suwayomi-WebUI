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
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { isNetworkRequestInFlight } from '@apollo/client/utilities';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/views/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ChapterList } from '@/views/chapter/components/ChapterList.tsx';
import { useRefreshManga } from '@/controllers/manga/hooks/useRefreshManga.ts';
import { MangaDetails } from '@/views/manga/components/details/MangaDetails.tsx';
import { MangaToolbarMenu } from '@/views/manga/components/MangaToolbarMenu.tsx';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import type { GetMangaScreenQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_SCREEN } from '@/lib/graphql/manga/MangaQuery.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { STABLE_EMPTY_OBJECT } from '@/models/base/Base.constants.ts';
import { useAppTitleAndAction } from '@/controllers/navigation-bar/hooks/useAppTitleAndAction.ts';
import type { MangaLocationState } from '@/models/manga/Manga.types.ts';

export const Manga: React.FC = () => {
    const { t } = useLingui();
    const { id } = useParams<{ id: string }>();
    const { mode } = useLocation<MangaLocationState>().state ?? STABLE_EMPTY_OBJECT;

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
        if (manga == null) {
            return;
        }

        const doFetch = !autofetchedRef.current && !manga.initialized;
        if (doFetch) {
            autofetchedRef.current = true;
            refresh();
        }
    }, [manga]);

    useAppTitleAndAction(
        manga?.title ?? t`Manga`,
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
            }}
        >
            {!!error && !isValidating && !refreshing && (
                <CustomTooltip
                    title={
                        <>
                            {t`Could not load manga`}
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
        [t, error, isValidating, refreshing, manga, refresh],
    );

    if (error && !manga) {
        return <EmptyViewAbsoluteCentered message={t`Could not load manga`} messageExtra={getErrorMessage(error)} />;
    }
    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            {isLoading && <LoadingPlaceholder />}

            {manga && <MangaDetails manga={manga} mode={mode} />}
            {manga && <ChapterList manga={manga} isRefreshing={refreshing} />}
        </Box>
    );
};
