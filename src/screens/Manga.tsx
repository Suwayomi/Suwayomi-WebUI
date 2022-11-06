/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { CircularProgress, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import NavbarContext from 'components/context/NavbarContext';
import ChapterList from 'components/manga/ChapterList';
import ChaptersToolbarMenu from 'components/manga/ChaptersToolbarMenu';
import { useRefreshManga } from 'components/manga/hooks';
import MangaDetails from 'components/manga/MangaDetails';
import MangaToolbarMenu from 'components/manga/MangaToolbarMenu';
import { useChapterOptions } from 'components/manga/util';
import { NavbarToolbar } from 'components/navbar/DefaultNavBar';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import React, {
    useContext, useEffect, useRef,
} from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'util/client';

const AUTOFETCH_AGE = 60 * 60 * 24; // 24 hours

const Manga: React.FC = () => {
    const { setTitle } = useContext(NavbarContext);
    const { id } = useParams<{ id: string }>();
    const autofetchedRef = useRef(false);

    const { data: manga, error, loading } = useQuery<IManga>(`/api/v1/manga/${id}/?onlineFetch=false`);
    const {
        data: chaptersData,
        mutate: mutateChapters,
        loading: loadingChapters,
    } = useQuery<IChapter[]>(`/api/v1/manga/${id}/chapters?onlineFetch=false`);

    const [refresh, { loading: refreshing }] = useRefreshManga(id);

    useEffect(() => {
        // Automatically fetch manga from source if data is older then 24 hours
        // Automatic fetch is done only once, to prevent issues when server does
        // not update age for some reason (ie. error on source side)
        if (manga == null) return;
        if (
            manga.inLibrary
            && (manga.age > AUTOFETCH_AGE || manga.chaptersAge > AUTOFETCH_AGE)
            && autofetchedRef.current === false
        ) {
            autofetchedRef.current = true;
            refresh();
        }
    }, [manga]);

    useEffect(() => {
        setTitle(manga?.title ?? 'Manga');
    }, [manga?.title]);

    const [options, dispatch] = useChapterOptions(id);

    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            <NavbarToolbar>
                {refreshing && (
                    <IconButton disabled>
                        <CircularProgress size={16} />
                    </IconButton>
                )}
                {chaptersData && (
                    <ChaptersToolbarMenu options={options} optionsDispatch={dispatch} />
                )}
                {manga && (
                    <MangaToolbarMenu manga={manga} onRefresh={refresh} refreshing={refreshing} />
                )}
            </NavbarToolbar>

            {loading && <LoadingPlaceholder />}

            {error && <EmptyView message="Could not load manga" messageExtra={error.message ?? error} />}

            {manga && (
                <MangaDetails
                    manga={manga}
                />
            )}
            {chaptersData && (
                <ChapterList
                    id={id}
                    chapters={chaptersData}
                    onRefresh={() => mutateChapters()}
                    options={options}
                    loading={loadingChapters}
                />
            )}
        </Box>
    );
};

export default Manga;
