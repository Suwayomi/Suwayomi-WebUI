/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useQueryParam, StringParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import { Box, Button, styled, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FilterListIcon from '@mui/icons-material/FilterList';
import { TPartialManga, TranslationKey } from '@/typings';
import {
    requestManager,
    AbortableApolloUseMutationPaginatedResponse,
    SPECIAL_ED_SOURCES,
} from '@/lib/requests/RequestManager.ts';
import { useDebounce } from '@/util/useDebounce.ts';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { SourceGridLayout } from '@/components/source/SourceGridLayout';
import { AppbarSearch } from '@/components/util/AppbarSearch';
import { SourceOptions } from '@/components/source/SourceOptions';
import { SourceMangaGrid } from '@/components/source/SourceMangaGrid';
import {
    GetSourceMangasFetchMutation,
    GetSourceMangasFetchMutationVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';

const ContentTypeMenu = styled('div')(({ theme }) => ({
    display: 'flex',
    position: 'fixed',
    top: '64px',
    width: '100%',
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        top: '56px', // header height
    },
}));

const ContentTypeButton = styled(Button)(() => ({
    marginTop: '13px',
    marginBottom: '13px',
    marginLeft: '13px',
}));

const StyledGridWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== 'hasContent' })<{ hasContent: boolean }>(
    ({ theme, hasContent }) => ({
        // 62.5px ContentTypeMenu height (- padding of grid + grid item)
        marginTop: `calc(62.5px ${hasContent ? '- 8px' : ''})`,
        // header height - ContentTypeMenu height
        minHeight: 'calc(100vh - 64px - 62.5px)',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            // 62.5px ContentTypeMenu - 8px margin diff header height (56px) (- padding of grid item)
            marginTop: `calc(62.5px - 8px ${hasContent ? '- 8px' : ''})`,
            // header height (+ 8px margin) - footer height - ContentTypeMenu height
            minHeight: 'calc(100vh - 64px - 64px - 62.5px)',
        },
    }),
);

export enum SourceContentType {
    POPULAR,
    LATEST,
    SEARCH,
}

interface IPos {
    type: 'selectState' | 'textState' | 'checkBoxState' | 'triState' | 'sortState';
    position: number;
    state: any;
    group?: number;
}

const SOURCE_CONTENT_TYPE_TO_ERROR_MSG_KEY: { [contentType in SourceContentType]: TranslationKey } = {
    [SourceContentType.POPULAR]: 'manga.error.label.no_mangas_found',
    [SourceContentType.LATEST]: 'manga.error.label.no_mangas_found',
    [SourceContentType.SEARCH]: 'manga.error.label.no_matches',
};

const getUniqueMangas = (mangas: TPartialManga[]): TPartialManga[] => {
    const uniqueMangas: TPartialManga[] = [];

    mangas.forEach((manga) => {
        const isDuplicate = uniqueMangas.some((uniqueManga) => uniqueManga.id === manga.id);
        if (!isDuplicate) {
            uniqueMangas.push(manga);
        }
    });

    return uniqueMangas;
};

const useSourceManga = (
    sourceId: string,
    contentType: SourceContentType,
    searchTerm: string | null | undefined,
    filters: IPos[],
    initialPages: number,
    hideLibraryEntries: boolean,
): [
    AbortableApolloUseMutationPaginatedResponse<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>[0],
    AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    >[1][number] & { filteredOutAllItemsOfFetchedPage: boolean },
] => {
    let result: AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    >;
    switch (contentType) {
        case SourceContentType.POPULAR:
            result = requestManager.useGetSourcePopularMangas(sourceId, initialPages);
            break;
        case SourceContentType.LATEST:
            result = requestManager.useGetSourceLatestMangas(sourceId, initialPages);
            break;
        case SourceContentType.SEARCH:
            result = requestManager.useSourceSearch(
                sourceId,
                searchTerm ?? '',
                filters.map((filter) => {
                    const { position, state, group } = filter;

                    const isPartOfGroup = group !== undefined;
                    if (isPartOfGroup) {
                        return {
                            position: group,
                            groupChange: {
                                position,
                                [filter.type]: state,
                            },
                        };
                    }

                    return {
                        position,
                        [filter.type]: state,
                    };
                }),
                initialPages,
            );
            break;
        default:
            throw new Error(`Unknown ContentType "${contentType}"`);
    }

    const pages = result[1]!;
    const lastLoadedPageIndex = pages.findLastIndex((page) => !!page.data?.fetchSourceManga);
    const lastLoadedPage = pages[lastLoadedPageIndex];

    const isPageLoading = pages.slice(-1)[0].isLoading;
    let filteredOutAllItemsOfFetchedPage = !isPageLoading;
    const items = useMemo(() => {
        type FetchItemsResult = GetSourceMangasFetchMutation['fetchSourceManga']['mangas'];
        let allItems: FetchItemsResult = [];

        pages.forEach((page, index) => {
            const pageItems = page.data?.fetchSourceManga.mangas ?? ([] as FetchItemsResult);
            const uniqueItems = getUniqueMangas([...allItems, ...pageItems]);
            const uniquePageItems = pageItems.filter(
                (pageItem) => !!uniqueItems.find((uniqueItem) => uniqueItem.id === pageItem.id),
            );
            const nonLibraryItems = uniquePageItems.filter((item) => !hideLibraryEntries || !item.inLibrary);
            // const nonLibraryItems = uniquePageItems;

            const isLastPage = !isPageLoading && pages.length === index + 1;
            filteredOutAllItemsOfFetchedPage = isLastPage && !nonLibraryItems.length && !!pageItems.length;
            allItems = [...allItems, ...nonLibraryItems];
        });

        return allItems;
    }, [pages, hideLibraryEntries]);

    if (lastLoadedPageIndex === -1) {
        return [result[0], { ...result[1][result[1].length - 1], filteredOutAllItemsOfFetchedPage }];
    }

    return [
        result[0],
        {
            ...pages[pages.length - 1],
            data: {
                ...lastLoadedPage!.data,
                fetchSourceManga: {
                    ...lastLoadedPage!.data!.fetchSourceManga,
                    hasNextPage:
                        pages.length > lastLoadedPageIndex + 1
                            ? false
                            : lastLoadedPage!.data!.fetchSourceManga.hasNextPage,
                    mangas: items,
                },
            },
            filteredOutAllItemsOfFetchedPage,
        },
    ];
};

export function SourceMangas() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    const { sourceId } = useParams<{ sourceId: string }>();

    const navigate = useNavigate();
    const { search } = useLocation();
    const {
        contentType: currentLocationContentType = SourceContentType.POPULAR,
        filtersToApply: currentLocationFiltersToApply = [],
        clearCache = false,
    } = useLocation<{
        contentType: SourceContentType;
        filtersToApply: IPos[];
        clearCache: boolean;
        search: string;
    }>().state ?? {};

    useSetDefaultBackTo('sources');

    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    const {
        settings: { hideLibraryEntries },
    } = useMetadataServerSettings();

    const { options } = useLibraryOptionsContext();
    const [query] = useQueryParam('query', StringParam);
    const [dialogFiltersToApply, setDialogFiltersToApply] = useState<IPos[]>(currentLocationFiltersToApply);
    const [filtersToApply, setFiltersToApply] = useState<IPos[]>(currentLocationFiltersToApply);
    const searchTerm = useDebounce(query, 1000);
    const [resetScrollPosition, setResetScrollPosition] = useState(false);
    const [contentType, setContentType] = useState(currentLocationContentType);
    const [loadPage, { data, isLoading: loading, size: lastPageNum, abortRequest, filteredOutAllItemsOfFetchedPage }] =
        useSourceManga(sourceId, contentType, searchTerm, filtersToApply, 1, hideLibraryEntries);
    const isLoading = loading || filteredOutAllItemsOfFetchedPage;
    const mangas = data?.fetchSourceManga.mangas ?? [];
    const hasNextPage = data?.fetchSourceManga.hasNextPage ?? false;

    const { data: sourceData } = requestManager.useGetSource(sourceId);
    const source = sourceData?.source;
    const filters = source?.filters ?? [];

    const message = !isLoading ? t(SOURCE_CONTENT_TYPE_TO_ERROR_MSG_KEY[contentType]) : undefined;
    const isLocalSource = sourceId === '0';
    const messageExtra = isLocalSource ? (
        <>
            <span>{t('source.local_source.label.checkout')} </span>
            <Link href="https://github.com/Suwayomi/Suwayomi-Server/wiki/Local-Source">
                {t('source.local_source.label.guide')}
            </Link>
        </>
    ) : undefined;

    const updateContentType = useCallback(
        (
            newContentType: SourceContentType,
            { updateLocationState = true, search: newSearch }: { updateLocationState?: boolean; search?: string } = {},
        ) => {
            if (updateLocationState) {
                navigate(
                    { pathname: '', search: newSearch },
                    {
                        replace: true,
                        state: {
                            contentType: newContentType,
                        },
                    },
                );
            }

            setContentType(newContentType);
            setResetScrollPosition(true);
        },
        [setContentType],
    );

    const updateLocationFilters = useCallback(
        (updatedFilters: IPos[]) => {
            if (contentType === SourceContentType.SEARCH) {
                navigate(
                    { pathname: '', search },
                    {
                        replace: true,
                        state: {
                            contentType,
                            filtersToApply: updatedFilters,
                        },
                    },
                );
            }
        },
        [contentType, search],
    );

    const isSearchTermAvailable = searchTerm && query?.length;
    const setSearchContentType = isSearchTermAvailable && contentType !== SourceContentType.SEARCH;
    if (setSearchContentType) {
        updateContentType(SourceContentType.SEARCH, { search });
    }

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        loadPage(lastPageNum + 1);
    }, [lastPageNum, hasNextPage, contentType]);

    const resetFilters = useCallback(async () => {
        setDialogFiltersToApply([]);
        setFiltersToApply([]);
        updateLocationFilters([]);
        setResetScrollPosition(true);
    }, [sourceId, contentType, updateLocationFilters]);

    useEffect(() => {
        if (filteredOutAllItemsOfFetchedPage && hasNextPage && !loading) {
            loadPage(lastPageNum + 1);
        }
    }, [filteredOutAllItemsOfFetchedPage, loading]);

    useEffect(() => {
        if (!clearCache) {
            return;
        }

        const requiresClear = SPECIAL_ED_SOURCES.REVALIDATION.includes(sourceId);
        if (!requiresClear) {
            return;
        }

        requestManager.clearBrowseCacheFor(sourceId);
        navigate('', {
            replace: true,
            state: { contentType: currentLocationContentType, filters: currentLocationFiltersToApply },
        });
    }, [clearCache]);

    useEffect(
        () => () => {
            if (contentType !== SourceContentType.SEARCH || isFirstRender) {
                return;
            }
            // INFO:
            // with strict mode + dev mode the first request will be aborted. due to using SWR there won't be an
            // immediate second request since it's the same key. instead the "second" request will be the error handling of SWR
            abortRequest(new Error(`SourceMangas(${sourceId}): search string changed`));
            setResetScrollPosition(true);
        },
        [searchTerm],
    );

    useEffect(() => {
        setTitle(source?.displayName ?? t('source.title'));
        setAction(
            <>
                <AppbarSearch />
                <SourceGridLayout />
                {source?.isConfigurable && (
                    <Tooltip title={t('settings.title')}>
                        <IconButton
                            onClick={() => navigate(`/sources/${sourceId}/configure/`)}
                            aria-label="display more actions"
                            edge="end"
                            color="inherit"
                            size="large"
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </>,
        );

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, source]);

    useEffect(() => {
        if (!resetScrollPosition) {
            return;
        }

        window.scrollTo(0, 0);
        setResetScrollPosition(false);
    }, [resetScrollPosition]);

    return (
        <StyledGridWrapper hasContent={!!mangas.length}>
            <ContentTypeMenu>
                <ContentTypeButton
                    variant={contentType === SourceContentType.POPULAR ? 'contained' : 'outlined'}
                    startIcon={<FavoriteIcon />}
                    onClick={() => updateContentType(SourceContentType.POPULAR)}
                >
                    {t('global.button.popular')}
                </ContentTypeButton>
                {source?.supportsLatest === undefined || source.supportsLatest ? (
                    <ContentTypeButton
                        disabled={!source?.supportsLatest}
                        variant={contentType === SourceContentType.LATEST ? 'contained' : 'outlined'}
                        startIcon={<NewReleasesIcon />}
                        onClick={() => updateContentType(SourceContentType.LATEST)}
                    >
                        {t('global.button.latest')}
                    </ContentTypeButton>
                ) : null}
                <ContentTypeButton
                    variant={contentType === SourceContentType.SEARCH ? 'contained' : 'outlined'}
                    startIcon={<FilterListIcon />}
                    onClick={() => updateContentType(SourceContentType.SEARCH)}
                >
                    {t('global.button.filter')}
                </ContentTypeButton>
            </ContentTypeMenu>
            <SourceMangaGrid
                key={contentType}
                mangas={mangas}
                hasNextPage={hasNextPage}
                loadMore={loadMore}
                message={message}
                messageExtra={messageExtra}
                isLoading={isLoading}
                gridLayout={options.SourcegridLayout}
            />
            {contentType === SourceContentType.SEARCH && (
                <SourceOptions
                    sourceFilter={filters}
                    updateFilterValue={setDialogFiltersToApply}
                    setTriggerUpdate={() => {
                        setFiltersToApply(dialogFiltersToApply);
                        updateLocationFilters(dialogFiltersToApply);
                    }}
                    resetFilterValue={resetFilters}
                    update={dialogFiltersToApply}
                />
            )}
        </StyledGridWrapper>
    );
}
