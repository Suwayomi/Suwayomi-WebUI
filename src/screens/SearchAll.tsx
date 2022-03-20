/*
* Copyright (C) Contributors to the Suwayomi project
*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { Card } from '@mui/material';
import { useHistory } from 'react-router-dom';
import NavbarContext from 'components/context/NavbarContext';
import MangaGrid from 'components/MangaGrid';
import LangSelect from 'components/navbar/action/LangSelect';
import AppbarSearch from 'components/util/AppbarSearch';
import React, { useContext, useEffect, useState } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';
import client from 'util/client';
import {
    langCodeToName, langSortCmp, sourceDefualtLangs, sourceForcedDefaultLangs,
} from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import PQueue from 'p-queue/dist/index';

function sourceToLangList(sources: ISource[]) {
    const result: string[] = [];

    sources.forEach((source) => {
        if (result.indexOf(source.lang) === -1) { result.push(source.lang); }
    });

    result.sort(langSortCmp);
    return result;
}

export default function SearchAll() {
    const [query] = useQueryParam('query', StringParam);
    const { setTitle, setAction } = useContext(NavbarContext);
    const [triggerUpdate, setTriggerUpdate] = useState<number>(2);
    const [mangas, setMangas] = useState<any>({});

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const [sources, setSources] = useState<ISource[]>([]);
    const [fetched, setFetched] = useState<any>({});
    const [FetchedSources, setFetchedSources] = useState<any>({});

    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const [ResetUI, setResetUI] = useState<number>(0);

    const limit = new PQueue({ concurrency: 5 });

    useEffect(() => {
        setTitle('Global Search');
        setAction(
            <>
                <AppbarSearch />
            </>
            ,
        );
    }, []);

    useEffect(() => {
        client.get('/api/v1/source/list')
            .then((response) => response.data)
            .then((data) => {
                setSources(data.sort((a: { displayName: string; }, b: { displayName: string; }) => {
                    if (a.displayName < b.displayName) { return -1; }
                    if (a.displayName > b.displayName) { return 1; }
                    return 0;
                })); setFetchedSources(true);
            });
    }, []);

    async function doIT(elem: any[]) {
        elem.map((ele) => limit.add(async () => {
            const response = await client.get(`/api/v1/source/${ele.id}/search?searchTerm=${query || ''}&pageNum=1`);
            const data = await response.data;
            const tmp = mangas;
            tmp[ele.id] = data.mangaList;
            setMangas(tmp);
            const tmp2 = fetched;
            tmp2[ele.id] = true;
            setFetched(tmp2);
            setResetUI(1);
        }));
    }

    useEffect(() => {
        if (triggerUpdate === 2) {
            return;
        }
        if (triggerUpdate === 0) {
            setTriggerUpdate(1);
            return;
        }
        setFetched({});
        setMangas({});
        // eslint-disable-next-line max-len
        doIT(sources.filter(({ lang }) => shownLangs.indexOf(lang) !== -1).filter((source) => showNsfw || !source.isNsfw));
    }, [triggerUpdate]);

    useEffect(() => {
        if (ResetUI === 1) {
            setResetUI(0);
        }
    }, [ResetUI]);

    useEffect(() => {
        if (query && FetchedSources) {
            const delayDebounceFn = setTimeout(() => {
                setTriggerUpdate(0);
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        }
        return () => {};
    }, [query, shownLangs, sources]);

    useEffect(() => {
        // make sure all of forcedDefaultLangs() exists in shownLangs
        sourceForcedDefaultLangs().forEach((forcedLang) => {
            let hasLang = false;
            shownLangs.forEach((lang) => {
                if (lang === forcedLang) hasLang = true;
            });
            if (!hasLang) {
                setShownLangs((shownLangsCopy) => {
                    shownLangsCopy.push(forcedLang);
                    return shownLangsCopy;
                });
            }
        });
    }, []);

    useEffect(() => {
        setTitle('Sources');
        setAction(
            <>
                <AppbarSearch
                    autoOpen
                />
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources)}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [shownLangs, sources]);

    const history = useHistory();

    const redirectTo = (e: any, to: string) => {
        history.push(to);

        // prevent parent tags from getting the event
        e.stopPropagation();
    };
    if (query) {
        return (
            <>
                {/* eslint-disable-next-line max-len */}
                {sources.filter(({ lang }) => shownLangs.indexOf(lang) !== -1).filter((source) => showNsfw || !source.isNsfw).sort((a, b) => {
                    const af = fetched[a.id];
                    const bf = fetched[b.id];
                    if (af && !bf) { return -1; }
                    if (!af && bf) { return 1; }
                    if (!af && !bf) { return 0; }

                    const al = mangas[a.id].length === 0;
                    const bl = mangas[b.id].length === 0;
                    if (al && !bl) { return 1; }
                    if (bl && !al) { return -1; }
                    return 0;
                }).map(({ lang, id, displayName }) => (
                    (
                        <>
                            <Card
                                sx={{
                                    margin: '10px',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                    },
                                    '&:active': {
                                        backgroundColor: 'action.selected',
                                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                                    },
                                }}
                                onClick={(e) => redirectTo(e, `/sources/${id}/popular/?R&query=${query}`)}
                            >
                                <h1
                                    key={lang}
                                    style={{ margin: '25px 0px 0px 25px' }}
                                >
                                    {displayName}
                                </h1>
                                <p
                                    style={{ margin: '0px 0px 25px 25px' }}
                                >
                                    {langCodeToName(lang)}
                                </p>
                            </Card>
                            <MangaGrid
                                mangas={mangas[id] || []}
                                isLoading={!fetched[id]}
                                hasNextPage={false}
                                lastPageNum={lastPageNum}
                                setLastPageNum={setLastPageNum}
                                horisontal
                                noFaces
                                message={fetched[id] ? 'No manga was found!' : undefined}
                            />
                        </>
                    )
                ))}

            </>
        );
    }
    return (<></>);
}
