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
import { ISource } from 'typings';
import { useTranslation } from 'react-i18next';
import { translateExtensionLanguage } from 'screens/util/Extensions';
import requestManager from 'lib/RequestManager';

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
    const [mangas, setMangas] = useState<any>({});

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data: unsortedSources = [], isLoading: FetchedSources } = requestManager.useGetSourceList();
    const sources = useMemo(
        () =>
            unsortedSources.sort((a: { displayName: string }, b: { displayName: string }) => {
                if (a.displayName < b.displayName) {
                    return -1;
                }
                if (a.displayName > b.displayName) {
                    return 1;
                }
                return 0;
            }),
        [unsortedSources],
    );

    const [fetched, setFetched] = useState<any>({});

    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const [ResetUI, setResetUI] = useState<number>(0);

    const limit = new PQueue({ concurrency: 5 });

    useEffect(() => {
        setTitle(t('search.title.global_search'));
        setAction(<AppbarSearch />);
    }, [t]);

    async function doIT(elem: any[]) {
        elem.map((ele) =>
            limit.add(async () => {
                const response = await requestManager
                    .getClient()
                    .get(`/api/v1/source/${ele.id}/search?searchTerm=${query || ''}&pageNum=1`);
                const data = await response.data;
                const tmp = mangas;
                tmp[ele.id] = data.mangaList;
                setMangas(tmp);
                const tmp2 = fetched;
                tmp2[ele.id] = true;
                setFetched(tmp2);
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
        setFetched({});
        setMangas({});
        doIT(
            sources
                .filter(({ lang }) => shownLangs.indexOf(lang) !== -1)
                .filter((source) => showNsfw || !source.isNsfw),
        );
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
        setTitle(t('source.title'));
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
    }, [t, shownLangs, sources]);

    if (query) {
        return (
            <>
                {sources
                    .filter(({ lang }) => shownLangs.indexOf(lang) !== -1)
                    .filter((source) => showNsfw || !source.isNsfw)
                    .sort((a, b) => {
                        const af = fetched[a.id];
                        const bf = fetched[b.id];
                        if (af && !bf) {
                            return -1;
                        }
                        if (!af && bf) {
                            return 1;
                        }
                        if (!af && !bf) {
                            return 0;
                        }

                        const al = mangas[a.id].length === 0;
                        const bl = mangas[b.id].length === 0;
                        if (al && !bl) {
                            return 1;
                        }
                        if (bl && !al) {
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
                                mangas={mangas[id] || []}
                                isLoading={!fetched[id]}
                                hasNextPage={false}
                                lastPageNum={lastPageNum}
                                setLastPageNum={setLastPageNum}
                                horizontal
                                noFaces
                                message={fetched[id] ? t('manga.error.label.no_mangas_found') : undefined}
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
