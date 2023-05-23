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
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { langSortCmp, sourceDefualtLangs, sourceForcedDefaultLangs } from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import { ISource } from 'typings';
import { useTranslation } from 'react-i18next';
import { translateExtensionLanguage } from 'screens/util/Extensions';
import requestManager from 'lib/RequestManager';
import { useDebounce } from 'components/manga/hooks';

type SourceLoadingState = { isLoading: boolean; hasResults: boolean; emptySearch: boolean };
type SourceToLoadingStateMap = Map<string, SourceLoadingState>;

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

const compareSourceByName = (sourceA: ISource, sourceB: ISource): -1 | 0 | 1 => {
    if (sourceA.displayName < sourceB.displayName) {
        return -1;
    }
    if (sourceA.displayName > sourceB.displayName) {
        return 1;
    }
    return 0;
};

const compareSourcesBySearchResult = (
    sourceA: ISource,
    sourceB: ISource,
    sourceToFetchedStateMap: SourceToLoadingStateMap,
): -1 | 0 | 1 => {
    const isSourceAFetched = !sourceToFetchedStateMap.get(sourceA.id)?.isLoading ?? true;
    const isSourceBFetched = !sourceToFetchedStateMap.get(sourceB.id)?.isLoading ?? true;
    if (isSourceAFetched && !isSourceBFetched) {
        return -1;
    }
    if (!isSourceAFetched && isSourceBFetched) {
        return 1;
    }
    if (!isSourceAFetched && !isSourceBFetched) {
        return 0;
    }

    const isSourceASearchResultEmpty = !sourceToFetchedStateMap.get(sourceA.id)?.hasResults;
    const isSourceBSearchResultEmpty = !sourceToFetchedStateMap.get(sourceB.id)?.hasResults;
    if (isSourceASearchResultEmpty && !isSourceBSearchResultEmpty) {
        return 1;
    }
    if (isSourceBSearchResultEmpty && !isSourceASearchResultEmpty) {
        return -1;
    }

    return 0;
};
const TRIGGER_SEARCH_THRESHOLD = 1000; // ms

const SourceSearchPreview = React.memo(
    ({
        source,
        onSearchRequestFinished,
        searchString,
        emptyQuery,
    }: {
        source: ISource;
        onSearchRequestFinished: (
            source: ISource,
            isLoading: boolean,
            hasResults: boolean,
            emptySearch: boolean,
        ) => void;
        searchString: string | null | undefined;
        emptyQuery: boolean;
    }) => {
        const { t } = useTranslation();
        const skipRequest = !searchString;

        const { id, displayName, lang } = source;
        const {
            data: searchResult,
            size,
            setSize,
            isLoading,
            error,
            abortRequest,
        } = requestManager.useSourceSearch(id, searchString ?? '', 1, { skipRequest });
        const mangas = !isLoading ? searchResult?.[0]?.mangaList ?? [] : [];
        const noMangasFound = !isLoading && !mangas.length;

        useEffect(() => {
            onSearchRequestFinished(source, isLoading, !noMangasFound, !searchString);
        }, [isLoading, noMangasFound, searchString]);

        let errorMessage: string | undefined;
        if (error) {
            errorMessage = t('search.error.label.source_search_failed');
        } else if (noMangasFound) {
            errorMessage = t('manga.error.label.no_mangas_found');
        }

        useEffect(
            () => () => {
                abortRequest(
                    new Error(`SourceSearchPreview(${source.id}, ${source.displayName}): search string changed`),
                );
            },
            [searchString],
        );

        if ((!isLoading && !searchString) || emptyQuery) {
            return null;
        }

        return (
            <>
                <Card sx={{ margin: '10px' }}>
                    <CardActionArea
                        component={Link}
                        to={`/sources/${id}/popular/?R&query=${searchString}`}
                        sx={{ p: 3 }}
                    >
                        <Typography variant="h5">{displayName}</Typography>
                        <Typography variant="caption">{translateExtensionLanguage(lang)}</Typography>
                    </CardActionArea>
                </Card>
                <MangaGrid
                    mangas={mangas}
                    isLoading={isLoading}
                    hasNextPage={false}
                    lastPageNum={size}
                    setLastPageNum={setSize}
                    horizontal
                    noFaces
                    message={errorMessage}
                    inLibraryIndicator
                />
            </>
        );
    },
);

const SearchAll: React.FC = () => {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavbarContext);

    const [query] = useQueryParam('query', StringParam);
    const searchString = useDebounce(query, TRIGGER_SEARCH_THRESHOLD);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data: sources = [] } = requestManager.useGetSourceList();
    const [sourceToLoadingStateMap, setSourceToLoadingStateMap] = useState<SourceToLoadingStateMap>(new Map());
    const debouncedSourceToLoadingStateMap = useDebounce(sourceToLoadingStateMap, 500);

    const sourcesSortedByName = useMemo(() => [...sources].sort(compareSourceByName), [sources]);
    const sourcesFilteredByLang = useMemo(
        () => sourcesSortedByName.filter((source) => shownLangs.includes(source.lang)),
        [sourcesSortedByName, shownLangs],
    );
    const sourcesFilteredByNsfw = useMemo(
        () => sourcesFilteredByLang.filter((source) => showNsfw || !source.isNsfw),
        [sourcesFilteredByLang, showNsfw],
    );
    const sourcesSortedByResult = useMemo(
        () =>
            [...sourcesFilteredByNsfw].sort((sourceA, sourceB) =>
                compareSourcesBySearchResult(sourceA, sourceB, debouncedSourceToLoadingStateMap),
            ),
        [sourcesFilteredByNsfw, debouncedSourceToLoadingStateMap],
    );

    const updateSourceLoadingState = useCallback(
        ({ id }: ISource, isLoading: boolean, hasResults: boolean, emptySearch: boolean) => {
            setSourceToLoadingStateMap((currentMap) => {
                const mapCopy = new Map(currentMap);
                mapCopy.set(id, { isLoading, hasResults, emptySearch });
                return mapCopy;
            });
        },
        [setSourceToLoadingStateMap],
    );

    useEffect(() => {
        setTitle(t('search.title.global_search'));
        setAction(
            <>
                <AppbarSearch autoOpen />
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources)}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [t, shownLangs, setShownLangs, sources]);

    useEffect(() => {
        // make sure all of forcedDefaultLangs() exists in shownLangs
        const missingDefaultLangs = sourceForcedDefaultLangs().filter(
            (defaultLang) => !shownLangs.includes(defaultLang),
        );
        setShownLangs([...shownLangs, ...missingDefaultLangs]);
    }, []);

    return (
        <>
            {sourcesSortedByResult.map((source) => (
                <SourceSearchPreview
                    key={source.id}
                    source={source}
                    onSearchRequestFinished={updateSourceLoadingState}
                    searchString={searchString}
                    emptyQuery={!query}
                />
            ))}
        </>
    );
};

export default SearchAll;
