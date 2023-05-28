/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SourceMangaGrid from 'components/source/SourceMangaGrid';
import NavbarContext from 'components/context/NavbarContext';
import SettingsIcon from '@mui/icons-material/Settings';
import SourceOptions from 'components/source/SourceOptions';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, StringParam } from 'use-query-params';
import SourceGridLayout from 'components/source/GridLayouts';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import requestManager, { AbortableSWRInfiniteResponse } from 'lib/RequestManager';
import { useDebounce } from 'components/manga/hooks';
import { Box, Button, styled } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IManga, PaginatedMangaList, TranslationKey } from 'typings';

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
        marginTop: `calc(62.5px ${hasContent ? '- 13px' : ''})`,
        // header height - ContentTypeMenu height
        minHeight: 'calc(100vh - 64px - 62.5px)',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            // 62.5px ContentTypeMenu - 8px margin diff header height (56px) (- padding of grid + grid item)
            marginTop: `calc(62.5px - 8px ${hasContent ? '- 13px' : ''})`,
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

type SourceMangaResponse = Omit<AbortableSWRInfiniteResponse<PaginatedMangaList>, 'data'> & {
    data: {
        items: IManga[];
        hasNextPage: boolean;
    };
};

const getUniqueMangas = (mangas: IManga[]): IManga[] => {
    const uniqueMangas: IManga[] = [];

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
): SourceMangaResponse => {
    let result: AbortableSWRInfiniteResponse<PaginatedMangaList>;
    switch (contentType) {
        case SourceContentType.POPULAR:
            result = requestManager.useGetSourcePopularMangas(sourceId, 1);
            break;
        case SourceContentType.LATEST:
            result = requestManager.useGetSourceLatestMangas(sourceId, 1);
            break;
        case SourceContentType.SEARCH:
            result = requestManager.useSourceQuickSearch(sourceId, searchTerm ?? '', [], 1);
            break;
        case SourceContentType.FILTER:
            result = requestManager.useSourceQuickSearch(
                sourceId,
                searchTerm ?? '',
                filters.map((filter) => {
                    const { position, state, group } = filter;

                    const isPartOfGroup = group !== undefined;
                    if (isPartOfGroup) {
                        return {
                            position: group,
                            state: JSON.stringify({
                                position,
                                state,
                            }),
                        };
                    }

                    return filter;
                }),
                1,
            );
            break;
        default:
            throw new Error(`Unknown ContentType "${contentType}"`);
    }

    const pages = result.data;
    const { hasNextPage } = pages?.[pages.length - 1] ?? { hasNextPage: false };
    const items = useMemo(
        () => (pages ?? []).map((page) => page.mangaList).reduce((prevList, list) => [...prevList, ...list], []),
        [pages],
    );
    const uniqueItems = useMemo(() => getUniqueMangas(items), [items]);

    return { ...result, data: { items: uniqueItems, hasNextPage } };
};

export default function SourceMangas() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);

    const { sourceId } = useParams<{ sourceId: string }>();

    const history = useHistory<{ contentType: SourceContentType }>();
    const { contentType: currentLocationContentType = SourceContentType.POPULAR } = history.location.state ?? {};

    const { options } = useLibraryOptionsContext();
    const [query] = useQueryParam('query', StringParam);
    const [dialogFiltersToApply, setDialogFiltersToApply] = useState<IPos[]>([]);
    const [filtersToApply, setFiltersToApply] = useState<IPos[]>([]);
    const searchTerm = useDebounce(query, 1000);
    const [contentType, setContentType] = useState(currentLocationContentType);
    const {
        data: { items: mangas, hasNextPage } = { items: [], hasNextPage: false },
        isLoading,
        size: lastPageNum,
        setSize: setPages,
        mutate: refreshData,
        abortRequest,
        isValidating,
    } = useSourceManga(sourceId, contentType, searchTerm, filtersToApply);
    const { data: filters = [], mutate: mutateFilters } = requestManager.useGetSourceFilters(sourceId);
    const { data: source } = requestManager.useGetSource(sourceId);
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);

    const isValidatingMangasForFilter = !isLoading && isValidating && contentType === SourceContentType.FILTER;

    const message = !isLoading ? (t(SOURCE_CONTENT_TYPE_TO_ERROR_MSG_KEY[contentType]) as string) : undefined;
    const isLocalSource = sourceId === '0';
    const messageExtra = isLocalSource ? (
        <>
            <span>{t('source.local_source.label.checkout')} </span>
            <Link href="https://github.com/Suwayomi/Tachidesk-Server/wiki/Local-Source">
                {t('source.local_source.label.guide')}
            </Link>
        </>
    ) : undefined;

    const isSearchTermAvailable = searchTerm && query?.length;
    const setSearchContentType = isSearchTermAvailable && contentType !== SourceContentType.SEARCH;
    if (setSearchContentType) {
        setContentType(SourceContentType.SEARCH);
    }

    const closeSearch = !query?.length && contentType === SourceContentType.SEARCH;
    if (closeSearch) {
        setContentType(currentLocationContentType);
    }

    let wasLoadMoreTriggered = false;
    const setLastPageNum = useCallback(() => {
        if (!hasNextPage || wasLoadMoreTriggered) {
            return;
        }

        wasLoadMoreTriggered = true;
        setPages(lastPageNum + 1);
    }, [setPages, hasNextPage, lastPageNum]);

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

    const updateContentType = useCallback(
        (newContentType: SourceContentType) => {
            history.replace(sourceId, { contentType: newContentType });
            setContentType(newContentType);
        },
        [setContentType],
    );

    useEffect(
        () => () => {
            if (contentType !== SourceContentType.SEARCH) {
                return;
            }

            abortRequest(new Error(`SourceMangas(${sourceId}): search string changed`));
        },
        [searchTerm, contentType],
    );

    useEffect(() => {
        if (!triggerDataRefresh) {
            return;
        }

        refreshData();
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
    }, [t, source]);

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
                mangas={isValidatingMangasForFilter ? [] : mangas}
                hasNextPage={hasNextPage}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                message={message}
                messageExtra={messageExtra}
                isLoading={isLoading || isValidatingMangasForFilter}
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
