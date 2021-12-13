/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState, useContext } from 'react';
import { Box } from '@mui/system';
import MangaDetails from 'components/MangaDetails';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import ChapterList from 'components/ChapterList';
import { useParams } from 'react-router-dom';

export default function Manga() {
    const { setTitle } = useContext(NavbarContext);
    useEffect(() => { setTitle('Manga'); }, []); // delegate setting topbar action to MangaDetails

    const { id } = useParams<{ id: string }>();

    const [manga, setManga] = useState<IManga>();

    useEffect(() => {
        if (manga === undefined || !manga.freshData) {
            client.get(`/api/v1/manga/${id}/?onlineFetch=${manga !== undefined}`)
                .then((response) => response.data)
                .then((data: IManga) => {
                    setManga(data);
                    setTitle(data.title);
                });
        }
    }, [manga]);

    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            <LoadingPlaceholder
                shouldRender={manga !== undefined}
                component={MangaDetails}
                componentProps={{ manga }}
            />

            <ChapterList id={id} />
        </Box>
    );
}
