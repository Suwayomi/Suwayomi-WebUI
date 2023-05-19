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
import React, { useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { langSortCmp, sourceDefualtLangs, sourceForcedDefaultLangs } from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import { ISource } from 'typings';
import { useTranslation } from 'react-i18next';
import { translateExtensionLanguage } from 'screens/util/Extensions';
import requestManager from 'lib/RequestManager';
import { useDebounce } from 'components/manga/hooks';

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

const TRIGGER_SEARCH_THRESHOLD = 1000; // ms

const SourceSearchPreview = ({ source }: { source: ISource }) => {
    const { t } = useTranslation();
    const [query] = useQueryParam('query', StringParam);
    const searchString = useDebounce(query, TRIGGER_SEARCH_THRESHOLD);
    const skipRequest = !searchString;

    const { id, displayName, lang } = source;
    const {
        data: searchResult,
        size,
        setSize,
        isLoading,
        error,
    } = requestManager.useSourceSearch(id, searchString ?? '', 1, { skipRequest });
    const mangas = !isLoading ? searchResult?.[0]?.mangaList ?? [] : [];
    const noMangasFound = !isLoading && !mangas.length;

    if (!isLoading && !searchString) {
        return null;
    }

    let errorMessage: string | undefined;
    if (error) {
        errorMessage = t('search.error.label.source_search_failed');
    } else if (noMangasFound) {
        errorMessage = t('manga.error.label.no_mangas_found');
    }

    return (
        <>
            <Card sx={{ margin: '10px' }}>
                <CardActionArea component={Link} to={`/sources/${id}/popular/?R&query=${query}`} sx={{ p: 3 }}>
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
};

const SearchAll: React.FC = () => {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavbarContext);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data: sources = [] } = requestManager.useGetSourceList();

    const sourcesSortedByName = useMemo(() => [...sources].sort(compareSourceByName), [sources]);
    const sourcesFilteredByLang = useMemo(
        () => sourcesSortedByName.filter((source) => shownLangs.includes(source.lang)),
        [sourcesSortedByName, shownLangs],
    );
    const visibleSources = useMemo(
        () => sourcesFilteredByLang.filter((source) => showNsfw || !source.isNsfw),
        [sourcesFilteredByLang, showNsfw],
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
            {visibleSources.map((source) => (
                <SourceSearchPreview key={source.id} source={source} />
            ))}
        </>
    );
};

export default SearchAll;
