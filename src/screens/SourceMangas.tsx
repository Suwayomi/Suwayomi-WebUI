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
import SourceGridLayout from 'components/source/GridLayouts';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import { IManga, IMangaCard, ISource, ISourceFilters } from 'typings';
import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';

interface IPos {
    position: number;
    state: any;
    group?: number;
}

export default function SourceMangas({ popular }: { popular: boolean }) {
    const { t } = useTranslation();
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

    const { options } = useLibraryOptionsContext();

    function makeFilters() {
        client
            .get(`/api/v1/source/${sourceId}/filters`)
            .then((response) => response.data)
            .then((data: ISourceFilters[]) => {
                SetData(data);
            });
    }

    useEffect(() => {
        setTitle(t('source.title')); // title is later set after a fetch but we set it here once
    }, [t]);

    useEffect(() => {
        client
            .get(`/api/v1/source/${sourceId}`)
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
            client
                .post(
                    `/api/v1/source/${sourceId}/filters`,
                    rep.map((e: IPos) => {
                        const { position, state, group }: IPos = e;
                        return group === undefined
                            ? {
                                  position,
                                  state,
                              }
                            : {
                                  position: group,
                                  state: JSON.stringify({
                                      position,
                                      state,
                                  }),
                              };
                    }),
                )
                .then(() => {
                    setTriggerUpdate(0);
                    makeFilters();
                });
        } else {
            setFetched(false);
            setMangas([]);
            setLastPageNum(0);
            if (Noreset === undefined && Search) {
                setNoreset(null);
            }
        }
    }, [triggerUpdate]);

    useEffect(() => {
        if (reset === 0) {
            setquery(undefined);
            setNoreset(undefined);
            setReset(1);
        } else if (Noreset === undefined) {
            client.get(`/api/v1/source/${sourceId}/filters?reset=true`).then(() => {
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
                <SourceGridLayout />
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
            </>,
        );

        return () => {
            setAction(null);
        };
    }, [isConfigurable]);

    useEffect(() => {
        if (query) {
            setSearch(true);
        } else {
            setSearch(false);
        }
        if (Noreset === undefined) {
            setInit(null);
        }
    }, [query]);

    useEffect(() => {
        if (Search !== undefined && query !== undefined && Init === null) {
            const delayDebounceFn = setTimeout(() => {
                setTriggerUpdate(0);
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        }
        if (Search !== undefined) {
            setInit(null);
        }
        return () => {};
    }, [Search, query]);

    useEffect(() => {
        if (lastPageNum !== 0) {
            const sourceType = popular ? 'popular' : 'latest';
            client
                .get(
                    `/api/v1/source/${sourceId}/${
                        query !== undefined || Search || Noreset === null ? 'search' : sourceType
                    }${
                        query !== undefined || Search || Noreset === null
                            ? `?searchTerm=${query || ''}&pageNum=${lastPageNum}`
                            : `/${lastPageNum}`
                    }`,
                )
                .then((response) => response.data)
                .then((data: { mangaList: IManga[]; hasNextPage: boolean }) => {
                    setMangas([
                        ...mangas,
                        ...data.mangaList.map((it) => ({
                            title: it.title,
                            thumbnailUrl: it.thumbnailUrl,
                            id: it.id,
                            inLibrary: it.inLibrary,
                            genre: it.genre,
                            inLibraryAt: it.inLibraryAt,
                            lastReadAt: it.lastReadAt,
                        })),
                    ]);
                    setHasNextPage(data.hasNextPage);
                    setFetched(true);
                });
        } else {
            setLastPageNum(1);
        }
    }, [lastPageNum]);

    let message;
    let messageExtra;

    if (fetched) {
        message = t('manga.error.label.no_mangas_found');
        if (sourceId === '0') {
            messageExtra = (
                <>
                    <span>{t('source.local_source.label.checkout')} </span>
                    <Link href="https://github.com/Suwayomi/Tachidesk-Server/wiki/Local-Source">
                        {t('source.local_source.label.guide')}
                    </Link>
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
                gridLayout={options.SourcegridLayout}
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
