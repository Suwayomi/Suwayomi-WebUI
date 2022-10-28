/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useContext } from 'react';
import useSWR from 'swr';
import { Box } from '@mui/system';
import MangaDetails from 'components/MangaDetails';
import NavbarContext from 'components/context/NavbarContext';
import { fetcher } from 'util/client';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import ChapterList from 'components/chapter/ChapterList';
import { useParams } from 'react-router-dom';

export default function Manga() {
    const { setTitle } = useContext(NavbarContext);
    useEffect(() => { setTitle('Manga'); }, []); // delegate setting topbar action to MangaDetails

    const { id } = useParams<{ id: string }>();

    const {
        data: manga, error, mutate,
    } = useSWR<IManga>(`/api/v1/manga/${id}/?onlineFetch=false`);
    const fetchOnline = useCallback(async () => {
        const res = await fetcher(`/api/v1/manga/${id}/?onlineFetch=true`);
        mutate(res, { revalidate: false });
    }, [mutate, id]);

    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            {!manga && !error && <LoadingPlaceholder />}
            {manga && <MangaDetails manga={manga} onRefresh={fetchOnline} />}
            <ChapterList id={id} />
        </Box>
    );
}
