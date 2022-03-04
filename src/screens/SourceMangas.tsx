/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SourceMangaGrid from 'components/source/SourceMangaGrid';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import SettingsIcon from '@mui/icons-material/Settings';
import SourceOptions from 'components/source/SourceOptions';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, StringParam } from 'use-query-params';

interface IPos {
    position: number
    state: any
    group?: number
}

export default function SourceMangas(props: { popular: boolean }) {
    const { setTitle, setAction } = useContext(NavbarContext);
    const history = useHistory();

    const { sourceId } = useParams<{ sourceId: string }>();
    const [isConfigurable, setIsConfigurable] = useState<boolean>(false);
    const [mangas, setMangas] = useState<IMangaCard[]>([]);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [lastPageNum, setLastPageNum] = useState<number>(1);
    const [fetched, setFetched] = useState<boolean>(false);

    const [Search, setSearch] = useState<boolean>();
    const [query, setquery] = useQueryParam('query', StringParam);
    const [reset, setReset] = React.useState(2);
    const [update, setUpdate] = useState<IPos[]>([]);
    const [triggerUpdate, setTriggerUpdate] = useState<number>(2);
    const [Data, SetData] = useState<ISourceFilters[]>();

    const [Init, setInit] = useState<undefined | null>();
    const [Noreset, setNoreset] = useQueryParam('R');

    function makeFilters() {
        client.get(`/api/v1/source/${sourceId}/filters`)
            .then((response) => response.data)
            .then((data: ISourceFilters[]) => {
                SetData(data);
            });
    }

    useEffect(() => {
        setTitle('Source'); // title is later set after a fetch but we set it here once
    }, []);

    useEffect(() => {
        client.get(`/api/v1/source/${sourceId}`)
            .then((response) => response.data)
            .then((data: ISource) => {
                setTitle(data.displayName);
                setIsConfigurable(data.isConfigurable);
            });
    }, []);

    useEffect(() => {
        if (triggerUpdate === 2) {
            return;
        }
        if (triggerUpdate === 0) {
            setTriggerUpdate(1);
            return;
        }
        if (update.length > 0) {
            const rep = update;
            setUpdate([]);
            Promise.all(rep.map(async (e: IPos) => {
                const { position, state, group }: IPos = e;
                await client.post(`/api/v1/source/${sourceId}/filters`,
                    JSON.stringify(group === undefined ? {
                        position,
                        state,
                    } : {
                        position: group,
                        state: JSON.stringify({
                            position,
                            state,
                        }),
                    }));
            }))
                .then(() => {
                    setTriggerUpdate(0);
                    makeFilters();
                });
        } else {
            setFetched(false);
            setMangas([]);
            setLastPageNum(0);
            if (Noreset === undefined && Search) { setNoreset(null); }
        }
    }, [triggerUpdate]);

    useEffect(() => {
        if (reset === 0) {
            setquery(undefined);
            setNoreset(undefined);
            setReset(1);
        } else if (Noreset === undefined) {
            client.get(`/api/v1/source/${sourceId}/filters?reset=true`)
                .then(() => {
                    makeFilters();
                    setSearch(false);
                    if (reset === 1) {
                        setTriggerUpdate(0);
                    }
                });
            return;
        }
        makeFilters();
    }, [reset]);

    useEffect(() => {
        setAction(
            <>
                <AppbarSearch />
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
            </>
            ,
        );
    }, [isConfigurable]);

    useEffect(() => {
        if (query) {
            setSearch(true);
        } else { setSearch(false); }
        if (Noreset === undefined) { setInit(null); }
    }, [query]);

    useEffect(() => {
        if (Search !== undefined && query !== undefined && Init === null) {
            const delayDebounceFn = setTimeout(() => {
                setTriggerUpdate(0);
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        }
        if (Search !== undefined) { setInit(null); }
        return () => {};
    }, [Search, query]);

    useEffect(() => {
        if (lastPageNum !== 0) {
            const sourceType = props.popular ? 'popular' : 'latest';
            client.get(`/api/v1/source/${sourceId}/${query !== undefined || Search || Noreset === null ? 'search' : sourceType}${query !== undefined || Search || Noreset === null ? `?searchTerm=${query || ''}&pageNum=${lastPageNum}` : `/${lastPageNum}`}`)
                .then((response) => response.data)
                .then((data: { mangaList: IManga[], hasNextPage: boolean }) => {
                    setMangas([
                        ...mangas,
                        ...data.mangaList.map((it) => ({
                            title: it.title,
                            thumbnailUrl: it.thumbnailUrl,
                            id: it.id,
                        }))]);
                    setHasNextPage(data.hasNextPage);
                    setFetched(true);
                });
        } else { setLastPageNum(1); }
    }, [lastPageNum]);

    let message;
    let messageExtra;

    if (fetched) {
        message = 'No manga was found!';
        if (sourceId === '0') {
            messageExtra = (
                <>
                    <span>Check out </span>
                    <a href="https://github.com/Suwayomi/Tachidesk-Server/wiki/Local-Source">Local source guide</a>
                </>
            );
        }
    }

    return (
        <>
            <SourceMangaGrid
                mangas={mangas}
                hasNextPage={hasNextPage}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                message={message}
                messageExtra={messageExtra}
                isLoading={!fetched}
            />
            {Data !== undefined && (
                <SourceOptions
                    sourceFilter={Data}
                    updateFilterValue={setUpdate}
                    resetFilterValue={setReset}
                    setTriggerUpdate={setTriggerUpdate}
                    setSearch={setSearch}
                    update={update}
                />
            )}
        </>
    );
}
