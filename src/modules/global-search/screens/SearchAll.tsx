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
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { langSortCmp, sourceDefualtLangs } from '@/modules/core/utils/Languages.ts';
import { AppbarSearch } from '@/modules/core/components/AppbarSearch.tsx';
import { LangSelect } from '@/modules/core/components/inputs/LangSelect.tsx';
import { useDebounce } from '@/modules/core/hooks/useDebounce.ts';
import { MangaCardProps } from '@/modules/manga/Manga.types.ts';
import { EmptyView } from '@/modules/core/components/placeholder/EmptyView.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { BaseMangaGrid } from '@/modules/manga/components/BaseMangaGrid.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { Sources } from '@/modules/source/services/Sources.ts';
import { SourceIdInfo } from '@/modules/source/Source.types.ts';

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
    sourceA: SourceIdInfo,
    sourceB: SourceIdInfo,
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
            source: SourceIdInfo,
            isLoading: boolean,
            hasResults: boolean,
            emptySearch: boolean,
        ) => void;
        searchString: string | null | undefined;
        emptyQuery: boolean;
    } & Pick<MangaCardProps, 'mode'>) => {
        const { t } = useTranslation();

        const { id, displayName, lang } = source;

        const currentSearchString = useRef(searchString);
        const currentAbortRequest = useRef<(reason: any) => void>(() => {});

        const didSearchChange = currentSearchString.current !== searchString;
        if (didSearchChange) {
            currentSearchString.current = searchString;
            currentAbortRequest.current(new Error(`SourceSearchPreview(${id}, ${displayName}): search string changed`));
        }

        const [refetch, results] = requestManager.useSourceSearch(id, searchString ?? '', undefined, 1, {
            skipRequest: !searchString,
            addAbortSignal: true,
        });

        const { data: searchResult, isLoading, error, abortRequest } = results[0]!;
        currentAbortRequest.current = abortRequest;

        const mangas = searchResult?.fetchSourceManga?.mangas ?? [];
        const noMangasFound = !error && !isLoading && !mangas.length;

        useEffect(() => {
            onSearchRequestFinished(source, isLoading, !noMangasFound, !searchString);
        }, [isLoading, noMangasFound, searchString]);

        let errorMessage: string | undefined;
        if (error) {
            errorMessage = t('search.error.label.source_search_failed');
        } else if (noMangasFound) {
            errorMessage = t('manga.error.label.no_mangas_found');
        }

        if ((!isLoading && !searchString) || emptyQuery) {
            return null;
        }

        return (
            <>
                <Card sx={{ mb: 1 }}>
                    <CardActionArea
                        component={Link}
                        to={`${AppRoutes.sources.childRoutes.browse.path(id)}?query=${searchString}`}
                        sx={{ p: 3 }}
                    >
                        <Typography variant="h5">{displayName}</Typography>
                        <Typography variant="caption">{translateExtensionLanguage(lang)}</Typography>
                    </CardActionArea>
                </Card>
                {errorMessage ? (
                    <EmptyView
                        sx={{ alignItems: 'start', height: undefined }}
                        noFaces
                        message={errorMessage}
                        messageExtra={getErrorMessage(error)}
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
                        gridWrapperProps={{ sx: { px: 0 } }}
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

    const { setTitle, setAction } = useNavBarContext();

    const { pathname, state } = useLocation<{ mangaTitle?: string }>();
    const isMigrateMode = pathname.startsWith('/migrate/source');

    const mangaTitle = state?.mangaTitle;

    const [query] = useQueryParam('query', StringParam);
    const searchString = useDebounce(query, TRIGGER_SEARCH_THRESHOLD);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data, loading, error, refetch } = requestManager.useGetSourceList({ notifyOnNetworkStatusChange: true });
    const sources = useMemo(() => data?.sources.nodes ?? [], [data?.sources.nodes]);
    const [sourceToLoadingStateMap, setSourceToLoadingStateMap] = useState<SourceToLoadingStateMap>(new Map());
    const debouncedSourceToLoadingStateMap = useDebounce(sourceToLoadingStateMap, 500);

    const sourcesSortedByName = useMemo(() => [...sources].sort(compareSourceByName), [sources]);
    const sourcesFilteredByLang = useMemo(
        () => sourcesSortedByName.filter((source) => shownLangs.includes(source.lang) || Sources.isLocalSource(source)),
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
        ({ id }: SourceIdInfo, isLoading: boolean, hasResults: boolean, emptySearch: boolean) => {
            setSourceToLoadingStateMap((currentMap) => {
                const mapCopy = new Map(currentMap);
                mapCopy.set(id, { isLoading, hasResults, emptySearch });
                return mapCopy;
            });
        },
        [setSourceToLoadingStateMap],
    );

    useLayoutEffect(() => {
        setTitle(t(isMigrateMode ? 'migrate.search.title' : 'search.title.global_search', { title: mangaTitle }));
        setAction(
            <>
                <AppbarSearch isClosable={false} />
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources)}
                />
            </>,
        );

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, shownLangs, setShownLangs, sources]);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SearchAll::refetch'))}
            />
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            {sourcesSortedByResult.map((source, index) => (
                <Box key={source.id} sx={{ pb: index + 1 !== sourcesSortedByResult.length ? 2 : 0 }}>
                    <SourceSearchPreview
                        source={source}
                        onSearchRequestFinished={updateSourceLoadingState}
                        searchString={searchString}
                        emptyQuery={!query}
                        mode={isMigrateMode ? 'migrate.select' : 'source'}
                    />
                </Box>
            ))}
        </Box>
    );
};
