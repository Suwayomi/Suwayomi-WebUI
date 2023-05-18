/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Card, CardActionArea, Typography } from '@mui/material';
import NavbarContext from 'components/context/NavbarContext';
import MangaGrid from 'components/MangaGrid';
import LangSelect from 'components/navbar/action/LangSelect';
import AppbarSearch from 'components/util/AppbarSearch';
import PQueue from 'p-queue';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { langSortCmp, sourceDefualtLangs, sourceForcedDefaultLangs } from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import { IManga, ISource, SourceSearchResult } from 'typings';
import { useTranslation } from 'react-i18next';
import { translateExtensionLanguage } from 'screens/util/Extensions';
import requestManager from 'lib/RequestManager';

type SourceToMangasMap = { [source: string]: IManga[] };
type SourceToFetchedStateMap = { [source: string]: boolean };

function sourceToLangList(sources: ISource[]) {
    const result: string[] = [];

    sources.forEach((source) => {
        if (result.indexOf(source.lang) === -1) {
            result.push(source.lang);
        }
    });

    result.sort(langSortCmp);
    return result;
}

const SearchAll: React.FC = () => {
    const { t } = useTranslation();

    const [query] = useQueryParam('query', StringParam);
    const { setTitle, setAction } = useContext(NavbarContext);
    const [triggerUpdate, setTriggerUpdate] = useState<number>(2);
    const [sourceToMangasMap, setSourceToMangasMap] = useState<SourceToMangasMap>({});

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data: sources = [], isLoading: isLoadingSources } = requestManager.useGetSourceList();
    const sortedSources = useMemo(
        () =>
            sources.sort((sourceA: { displayName: string }, sourceB: { displayName: string }) => {
                if (sourceA.displayName < sourceB.displayName) {
                    return -1;
                }
                if (sourceA.displayName > sourceB.displayName) {
                    return 1;
                }
                return 0;
            }),
        [sources],
    );

    const [sourceToFetchedStateMap, setSourceToFetchedStateMap] = useState<SourceToFetchedStateMap>({});

    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const [resetUI, setResetUI] = useState<number>(0);

    const searchRequestsQueue = new PQueue({ concurrency: 5 });

    useEffect(() => {
        setTitle(t('search.title.global_search'));
        setAction(<AppbarSearch />);
    }, [t]);

    async function performSearch(sourcesToSearchIn: ISource[]) {
        sourcesToSearchIn.map((source) =>
            searchRequestsQueue.add(async () => {
                const response = await requestManager
                    .getClient()
                    .get<SourceSearchResult>(`/api/v1/source/${source.id}/search?searchTerm=${query || ''}&pageNum=1`);
                const searchResult = await response.data;
                const tmpMangas = sourceToMangasMap;
                tmpMangas[source.id] = searchResult.mangaList;
                setSourceToMangasMap(tmpMangas);
                const tmpFetched = sourceToFetchedStateMap;
                tmpFetched[source.id] = true;
                setSourceToFetchedStateMap(tmpFetched);
                setResetUI(1);
            }),
        );
    }

    useEffect(() => {
        if (triggerUpdate === 2) {
            return;
        }
        if (triggerUpdate === 0) {
            setTriggerUpdate(1);
            return;
        }
        setSourceToFetchedStateMap({});
        setSourceToMangasMap({});
        performSearch(
            sortedSources
                .filter(({ lang }) => shownLangs.indexOf(lang) !== -1)
                .filter((source) => showNsfw || !source.isNsfw),
        );
    }, [triggerUpdate]);

    useEffect(() => {
        if (resetUI === 1) {
            setResetUI(0);
        }
    }, [resetUI]);

    useEffect(() => {
        if (query && !isLoadingSources) {
            const delayDebounceFn = setTimeout(() => {
                setTriggerUpdate(0);
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        }
        return () => {};
    }, [query, shownLangs, sortedSources]);

    useEffect(() => {
        // make sure all of forcedDefaultLangs() exists in shownLangs
        sourceForcedDefaultLangs().forEach((forcedLang) => {
            let includedInShownLangs = false;
            shownLangs.forEach((lang) => {
                if (lang === forcedLang) includedInShownLangs = true;
            });
            if (!includedInShownLangs) {
                setShownLangs((shownLangsCopy) => {
                    shownLangsCopy.push(forcedLang);
                    return shownLangsCopy;
                });
            }
        });
    }, []);

    useEffect(() => {
        setTitle(t('source.title'));
        setAction(
            <>
                <AppbarSearch autoOpen />
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sortedSources)}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [t, shownLangs, sortedSources]);

    if (query) {
        return (
            <>
                {sortedSources
                    .filter(({ lang }) => shownLangs.indexOf(lang) !== -1)
                    .filter((source) => showNsfw || !source.isNsfw)
                    .sort((sourceA, sourceB) => {
                        const isSourceAFetched = sourceToFetchedStateMap[sourceA.id];
                        const isSourceBFetched = sourceToFetchedStateMap[sourceB.id];
                        if (isSourceAFetched && !isSourceBFetched) {
                            return -1;
                        }
                        if (!isSourceAFetched && isSourceBFetched) {
                            return 1;
                        }
                        if (!isSourceAFetched && !isSourceBFetched) {
                            return 0;
                        }

                        const isSourceASearchResultEmpty = sourceToMangasMap[sourceA.id].length === 0;
                        const isSourceBSearchResultEmpty = sourceToMangasMap[sourceB.id].length === 0;
                        if (isSourceASearchResultEmpty && !isSourceBSearchResultEmpty) {
                            return 1;
                        }
                        if (isSourceBSearchResultEmpty && !isSourceASearchResultEmpty) {
                            return -1;
                        }
                        return 0;
                    })
                    .map(({ lang, id, displayName }) => (
                        <>
                            <Card sx={{ margin: '10px' }}>
                                <CardActionArea
                                    component={Link}
                                    to={`/sources/${id}/popular/?R&query=${query}`}
                                    sx={{ p: 3 }}
                                >
                                    <Typography variant="h5">{displayName}</Typography>
                                    <Typography variant="caption">{translateExtensionLanguage(lang)}</Typography>
                                </CardActionArea>
                            </Card>
                            <MangaGrid
                                mangas={sourceToMangasMap[id] || []}
                                isLoading={!sourceToFetchedStateMap[id]}
                                hasNextPage={false}
                                lastPageNum={lastPageNum}
                                setLastPageNum={setLastPageNum}
                                horizontal
                                noFaces
                                message={
                                    sourceToFetchedStateMap[id] ? t('manga.error.label.no_mangas_found') : undefined
                                }
                                inLibraryIndicator
                            />
                        </>
                    ))}
            </>
        );
    }

    return null;
};

export default SearchAll;
