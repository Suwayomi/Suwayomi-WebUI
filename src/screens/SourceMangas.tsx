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
import { Box, Button, styled, useTheme, useMediaQuery } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FilterListIcon from '@mui/icons-material/FilterList';
import { TranslationKey } from '@/typings';
import requestManager, { AbortableApolloUseMutationPaginatedResponse } from '@/lib/requests/RequestManager.ts';
import { useDebounce } from '@/components/manga/hooks';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import SourceGridLayout from '@/components/source/GridLayouts';
import AppbarSearch from '@/components/util/AppbarSearch';
import SourceOptions from '@/components/source/SourceOptions';
import NavbarContext from '@/components/context/NavbarContext';
import SourceMangaGrid from '@/components/source/SourceMangaGrid';
import {
    GetSourceMangasFetchMutation,
    GetSourceMangasFetchMutationVariables,
    MangaType,
} from '@/lib/graphql/generated/graphql.ts';

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
    FILTER,
}

interface IPos {
    position: number;
    state: any;
    group?: number;
}

const SOURCE_CONTENT_TYPE_TO_ERROR_MSG_KEY: { [contentType in SourceContentType]: TranslationKey } = {
    [SourceContentType.POPULAR]: 'manga.error.label.no_mangas_found',
    [SourceContentType.LATEST]: 'manga.error.label.no_mangas_found',
    [SourceContentType.FILTER]: 'manga.error.label.no_matches',
    [SourceContentType.SEARCH]: 'manga.error.label.no_mangas_found',
};

const getUniqueMangas = (mangas: MangaType[]): MangaType[] => {
    const uniqueMangas: MangaType[] = [];

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
): [
    AbortableApolloUseMutationPaginatedResponse<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>[0],
    AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    >[1][number],
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
            result = requestManager.useSourceSearch(sourceId, searchTerm ?? '', undefined, initialPages);
            break;
        case SourceContentType.FILTER:
            result = requestManager.useSourceSearch(sourceId, undefined, [], initialPages);
            // TODO - update filters to gql
            // result = requestManager.useSourceQuickSearch(
            //     sourceId,
            //     '',
            //     filters.map((filter) => {
            //         const { position, state, group } = filter;
            //
            //         const isPartOfGroup = group !== undefined;
            //         if (isPartOfGroup) {
            //             return {
            //                 position: group,
            //                 state: JSON.stringify({
            //                     position,
            //                     state,
            //                 }),
            //             };
            //         }
            //
            //         return filter;
            //     }),
            //     initialPages,
            //     { disableCache: true },
            // );
            break;
        default:
            throw new Error(`Unknown ContentType "${contentType}"`);
    }

    const pages = result[1]!;
    const lastLoadedPageIndex = pages.findLastIndex((page) => !!page.data?.fetchSourceManga);
    const lastLoadedPage = pages[lastLoadedPageIndex];
    const items = useMemo(
        () =>
            (pages ?? [])
                .map((page) => page.data?.fetchSourceManga.mangas ?? [])
                .reduce((prevList, list) => [...prevList, ...list], []),
        [pages],
    ) as MangaType[];
    const uniqueItems = useMemo(() => getUniqueMangas(items), [items]);

    if (!uniqueItems.length) {
        return [result[0] as any, result[1][result[1].length - 1]];
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
                    mangas: uniqueItems,
                },
            },
        },
    ];
};

export default function SourceMangas() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const { sourceId } = useParams<{ sourceId: string }>();

    const navigate = useNavigate();
    const { contentType: currentLocationContentType = SourceContentType.POPULAR } =
        useLocation<{
            contentType: SourceContentType;
        }>().state ?? {};

    const { options } = useLibraryOptionsContext();
    const [query] = useQueryParam('query', StringParam);
    const [dialogFiltersToApply, setDialogFiltersToApply] = useState<IPos[]>([]);
    const [filtersToApply, setFiltersToApply] = useState<IPos[]>([]);
    const searchTerm = useDebounce(query, 1000);
    const [resetScrollPosition, setResetScrollPosition] = useState(false);
    const [contentType, setContentType] = useState(currentLocationContentType);
    const [loadPage, { data, isLoading, size: lastPageNum, abortRequest }] = useSourceManga(
        sourceId,
        contentType,
        searchTerm,
        filtersToApply,
        isLargeScreen ? 2 : 1,
    );
    const mangas = (data?.fetchSourceManga.mangas as MangaType[]) ?? [];
    const hasNextPage = data?.fetchSourceManga.hasNextPage ?? false;

    const { data: filters = [], mutate: mutateFilters } = requestManager.useGetSourceFilters(sourceId);
    const { data: sourceData } = requestManager.useGetSource(sourceId);
    const source = sourceData?.source;
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);

    const message = !isLoading ? t(SOURCE_CONTENT_TYPE_TO_ERROR_MSG_KEY[contentType]) : undefined;
    const isLocalSource = sourceId === '0';
    const messageExtra = isLocalSource ? (
        <>
            <span>{t('source.local_source.label.checkout')} </span>
            <Link href="https://github.com/Suwayomi/Tachidesk-Server/wiki/Local-Source">
                {t('source.local_source.label.guide')}
            </Link>
        </>
    ) : undefined;

    const updateContentType = useCallback(
        (newContentType: SourceContentType, updateLocationState: boolean = true) => {
            if (updateLocationState) {
                navigate('', { replace: true, state: { contentType: newContentType } });
            }

            setContentType(newContentType);
            setResetScrollPosition(true);
        },
        [setContentType],
    );

    const isSearchTermAvailable = searchTerm && query?.length;
    const setSearchContentType = isSearchTermAvailable && contentType !== SourceContentType.SEARCH;
    if (setSearchContentType) {
        updateContentType(SourceContentType.SEARCH, false);
    }

    const closeSearch = !query?.length && contentType === SourceContentType.SEARCH;
    if (closeSearch) {
        updateContentType(currentLocationContentType, false);
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
        try {
            // required since previous implementation used to set the filters on server side (server caches them), thus, it has to be made sure that they are reset
            await requestManager.resetSourceFilters(sourceId);
            mutateFilters();
        } catch (error) {
            // ignore
        }
        setTriggerDataRefresh(true);
    }, [sourceId]);

    useEffect(
        () => () => {
            if (contentType !== SourceContentType.SEARCH) {
                return;
            }

            // INFO:
            // with strict mode + dev mode the first request will be aborted. due to using SWR there won't be an
            // immediate second request since it's the same key. instead the "second" request will be the error handling of SWR
            abortRequest(new Error(`SourceMangas(${sourceId}): search string changed`));
            setResetScrollPosition(true);
        },
        [searchTerm, contentType],
    );

    // TODO - check when fixing filters
    useEffect(() => {
        if (!triggerDataRefresh) {
            return;
        }

        // refreshData();
        setTriggerDataRefresh(false);
    }, [triggerDataRefresh]);

    useEffect(() => {
        setTitle(source?.displayName ?? t('source.title'));
        setAction(
            <>
                <AppbarSearch />
                <SourceGridLayout />
                {source?.isConfigurable && (
                    <IconButton
                        onClick={() => navigate(`/sources/${sourceId}/configure/`)}
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
                <ContentTypeButton
                    variant={contentType === SourceContentType.LATEST ? 'contained' : 'outlined'}
                    startIcon={<NewReleasesIcon />}
                    onClick={() => updateContentType(SourceContentType.LATEST)}
                >
                    {t('global.button.latest')}
                </ContentTypeButton>
                <ContentTypeButton
                    variant={contentType === SourceContentType.FILTER ? 'contained' : 'outlined'}
                    startIcon={<FilterListIcon />}
                    onClick={() => updateContentType(SourceContentType.FILTER)}
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
            {contentType === SourceContentType.FILTER && (
                <SourceOptions
                    sourceFilter={filters}
                    updateFilterValue={setDialogFiltersToApply}
                    setTriggerUpdate={() => {
                        setFiltersToApply(dialogFiltersToApply);
                        setTriggerDataRefresh(true);
                    }}
                    resetFilterValue={resetFilters}
                    update={dialogFiltersToApply}
                />
            )}
        </StyledGridWrapper>
    );
}
