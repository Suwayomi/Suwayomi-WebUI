/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, {
    useCallback, useEffect, useContext, useState, useRef,
} from 'react';
import useSWR from 'swr';
import { Box } from '@mui/system';
import MangaDetails from 'components/MangaDetails';
import NavbarContext from 'components/context/NavbarContext';
import { fetcher } from 'util/client';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import ChapterList from 'components/chapter/ChapterList';
import { useParams } from 'react-router-dom';

const AUTOFETCH_AGE = 60 * 60 * 24; // 24 hours

export default function Manga() {
    const { setTitle } = useContext(NavbarContext);
    const { id } = useParams<{ id: string }>();
    const autofetchedRef = useRef(false);

    const { data: manga, error, mutate: mutateManga } = useSWR<IManga>(`/api/v1/manga/${id}/?onlineFetch=false`);
    const { data: chaptersData, mutate: mutateChapters } = useSWR<IChapter[]>(`/api/v1/manga/${id}/chapters?onlineFetch=false`);

    const [fetchingOnline, setFetchingOnline] = useState(false);
    const fetchOnline = useCallback(async () => {
        setFetchingOnline(true);
        await Promise.all([
            fetcher(`/api/v1/manga/${id}/?onlineFetch=true`)
                .then((res) => mutateManga(res, { revalidate: false })),
            fetcher(`/api/v1/manga/${id}/chapters?onlineFetch=true`)
                .then((res) => mutateChapters(res, { revalidate: false })),
        ]);
        setFetchingOnline(false);
    }, [mutateManga, mutateChapters, id]);

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
            fetchOnline();
        }
    }, [manga]);

    useEffect(() => {
        setTitle(manga?.title ?? 'Manga');
    }, [manga?.title]);

    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            {!manga && !error && <LoadingPlaceholder />}
            {manga && (
                <MangaDetails
                    refreshing={fetchingOnline}
                    manga={manga}
                    onRefresh={fetchOnline}
                />
            )}
            <ChapterList id={id} chaptersData={chaptersData} onRefresh={() => mutateChapters()} />
        </Box>
    );
}
