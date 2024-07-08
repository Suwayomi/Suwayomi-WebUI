/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { langSortCmp, sourceDefualtLangs, sourceForcedDefaultLangs } from '@/util/language';
import { translateExtensionLanguage } from '@/screens/util/Extensions';
import { AppbarSearch } from '@/components/util/AppbarSearch';
import { LangSelect } from '@/components/navbar/action/LangSelect';
import { useDebounce } from '@/util/useDebounce.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { MangaCardProps } from '@/components/manga/MangaCard.types.tsx';
import { EmptyView } from '@/components/util/EmptyView';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { BaseMangaGrid } from '@/components/source/BaseMangaGrid.tsx';

type SourceLoadingState = { isLoading: boolean; hasResults: boolean; emptySearch: boolean };
type SourceToLoadingStateMap = Map<string, SourceLoadingState>;

function sourceToLangList(sources: Pick<SourceType, 'lang'>[]) {
    const result: string[] = [];

    sources.forEach((source) => {
        if (result.indexOf(source.lang) === -1) {
            result.push(source.lang);
        }
    });

    result.sort(langSortCmp);
    return result;
}

const compareSourceByName = (
    sourceA: Pick<SourceType, 'displayName'>,
    sourceB: Pick<SourceType, 'displayName'>,
): -1 | 0 | 1 => {
    if (sourceA.displayName < sourceB.displayName) {
        return -1;
    }
    if (sourceA.displayName > sourceB.displayName) {
        return 1;
    }
    return 0;
};

const compareSourcesBySearchResult = (
    sourceA: Pick<SourceType, 'id'>,
    sourceB: Pick<SourceType, 'id'>,
    sourceToFetchedStateMap: SourceToLoadingStateMap,
): -1 | 0 | 1 => {
    const isSourceAFetched = !sourceToFetchedStateMap.get(sourceA.id)?.isLoading;
    const isSourceBFetched = !sourceToFetchedStateMap.get(sourceB.id)?.isLoading;
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
        mode,
    }: {
        source: Pick<SourceType, 'id' | 'displayName' | 'lang'>;
        onSearchRequestFinished: (
            source: Pick<SourceType, 'id'>,
            isLoading: boolean,
            hasResults: boolean,
            emptySearch: boolean,
        ) => void;
        searchString: string | null | undefined;
        emptyQuery: boolean;
    } & Pick<MangaCardProps, 'mode'>) => {
        const { t } = useTranslation();

        const { id, displayName, lang } = source;
        const [refetch, results] = requestManager.useSourceSearch(id, searchString ?? '', undefined, 1, {
            skipRequest: !searchString,
            addAbortSignal: true,
        });
        const { data: searchResult, isLoading, error, abortRequest } = results[0]!;
        const mangas = searchResult?.fetchSourceManga?.mangas ?? [];
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
                // INFO:
                // with strict mode + dev mode the first request will be aborted. due to using SWR there won't be an
                // immediate second request since it's the same key. instead the "second" request will be the error handling of SWR
                abortRequest(new Error(`SourceSearchPreview(${id}, ${displayName}): search string changed`));
            },
            [searchString],
        );

        if ((!isLoading && !searchString) || emptyQuery) {
            return null;
        }

        return (
            <>
                <Card sx={{ margin: '10px' }}>
                    <CardActionArea component={Link} to={`/sources/${id}?query=${searchString}`} sx={{ p: 3 }}>
                        <Typography variant="h5">{displayName}</Typography>
                        <Typography variant="caption">{translateExtensionLanguage(lang)}</Typography>
                    </CardActionArea>
                </Card>
                {errorMessage ? (
                    <EmptyView
                        sx={{ alignItems: 'start' }}
                        noFaces
                        message={errorMessage}
                        messageExtra={error && error.message}
                        retry={
                            error
                                ? () =>
                                      refetch(1).catch(
                                          defaultPromiseErrorHandler(`SourceSearchPreview(${source.id})::refetch`),
                                      )
                                : undefined
                        }
                    />
                ) : (
                    <BaseMangaGrid
                        mangas={mangas}
                        isLoading={isLoading}
                        hasNextPage={false}
                        loadMore={() => undefined}
                        horizontal
                        noFaces
                        message={errorMessage}
                        inLibraryIndicator
                        mode={mode}
                    />
                )}
            </>
        );
    },
);

export const SearchAll: React.FC = () => {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavBarContext);

    const { pathname, state } = useLocation<{ mangaTitle?: string }>();
    const isMigrateMode = pathname.startsWith('/migrate/source');

    const mangaTitle = state?.mangaTitle;

    const [query] = useQueryParam('query', StringParam);
    const searchString = useDebounce(query, TRIGGER_SEARCH_THRESHOLD);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data, loading, error, refetch } = requestManager.useGetSourceList({ notifyOnNetworkStatusChange: true });
    const sources = data?.sources.nodes ?? [];
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
        ({ id }: Pick<SourceType, 'id'>, isLoading: boolean, hasResults: boolean, emptySearch: boolean) => {
            setSourceToLoadingStateMap((currentMap) => {
                const mapCopy = new Map(currentMap);
                mapCopy.set(id, { isLoading, hasResults, emptySearch });
                return mapCopy;
            });
        },
        [setSourceToLoadingStateMap],
    );

    useEffect(() => {
        setTitle(t(isMigrateMode ? 'migrate.search.title' : 'search.title.global_search', { title: mangaTitle }));
        setAction(
            <>
                <AppbarSearch isClosable={false} />
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources)}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, shownLangs, setShownLangs, sources]);

    useEffect(() => {
        // make sure all of forcedDefaultLangs() exists in shownLangs
        const missingDefaultLangs = sourceForcedDefaultLangs().filter(
            (defaultLang) => !shownLangs.includes(defaultLang),
        );
        setShownLangs([...shownLangs, ...missingDefaultLangs]);
    }, []);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SearchAll::refetch'))}
            />
        );
    }

    return (
        <>
            {sourcesSortedByResult.map((source) => (
                <SourceSearchPreview
                    key={source.id}
                    source={source}
                    onSearchRequestFinished={updateSourceLoadingState}
                    searchString={searchString}
                    emptyQuery={!query}
                    mode={isMigrateMode ? 'migrate.select' : 'source'}
                />
            ))}
        </>
    );
};
