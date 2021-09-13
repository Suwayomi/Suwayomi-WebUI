/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MangaGrid from 'components/manga/MangaGrid';
import NavbarContext from 'context/NavbarContext';
import client from 'util/client';
import SettingsIcon from '@mui/icons-material/Settings';

export default function SourceMangas(props: { popular: boolean }) {
    const { setTitle, setAction } = useContext(NavbarContext);
    const history = useHistory();

    const { sourceId } = useParams<{ sourceId: string }>();
    const [isConfigurable, setIsConfigurable] = useState<boolean>(false);
    const [mangas, setMangas] = useState<IMangaCard[]>([]);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [lastPageNum, setLastPageNum] = useState<number>(1);

    useEffect(() => {
        setTitle('Source'); // title is deligated to `MangaGrid` but we set it here once
    }, []);

    useEffect(() => {
        setAction(
            <>
                {isConfigurable && (
                    <IconButton
                        onClick={() => history.push(`/sources/${sourceId}/configure/`)}
                        aria-label="display more actions"
                        edge="end"
                        color="inherit"
                        size="large"
                    >
                        <SettingsIcon />
                    </IconButton>
                )}
            </>,
        );
    }, [isConfigurable]);

    useEffect(() => {
        client.get(`/api/v1/source/${sourceId}`)
            .then((response) => response.data)
            .then((data: ISource) => {
                setTitle(data.name);
                setIsConfigurable(data.isConfigurable);
            });
    }, []);

    useEffect(() => {
        const sourceType = props.popular ? 'popular' : 'latest';
        client.get(`/api/v1/source/${sourceId}/${sourceType}/${lastPageNum}`)
            .then((response) => response.data)
            .then((data: { mangaList: IManga[], hasNextPage: boolean }) => {
                setMangas([
                    ...mangas,
                    ...data.mangaList.map((it) => ({
                        title: it.title, thumbnailUrl: it.thumbnailUrl, id: it.id,
                    }))]);
                setHasNextPage(data.hasNextPage);
            });
    }, [lastPageNum]);

    return (
        <MangaGrid
            mangas={mangas}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
        />
    );
}
