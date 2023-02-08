/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect } from 'react';
import LangSelect from 'components/navbar/action/LangSelect';
import SourceCard from 'components/SourceCard';
import NavbarContext from 'components/context/NavbarContext';
import { sourceDefualtLangs, sourceForcedDefaultLangs, langCodeToName, langSortCmp } from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import { IconButton } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useHistory } from 'react-router-dom';
import { useQuery } from 'util/client';

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

function groupByLang(sources: ISource[]) {
    const result = {} as any;
    sources.forEach((source) => {
        if (result[source.lang] === undefined) {
            result[source.lang] = [] as ISource[];
        }
        result[source.lang].push(source);
    });

    return result;
}

export default function Sources() {
    const { setTitle, setAction } = useContext(NavbarContext);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data: sources, loading } = useQuery<ISource[]>('/api/v1/source/list');

    const history = useHistory();

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
                <IconButton onClick={() => history.push('/sources/all/search/')} size="large">
                    <TravelExploreIcon />
                </IconButton>
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources ?? [])}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [shownLangs, sources]);

    if (loading) return <LoadingPlaceholder />;

    if (sources?.length === 0) {
        return <h3>No sources found. Install Some Extensions first.</h3>;
    }

    return (
        <>
            {/* eslint-disable-next-line max-len */}
            {Object.entries(groupByLang(sources ?? []))
                .sort((a, b) => langSortCmp(a[0], b[0]))
                .map(
                    ([lang, list]) =>
                        shownLangs.indexOf(lang) !== -1 && (
                            <React.Fragment key={lang}>
                                <h1 key={lang} style={{ marginLeft: 25 }}>
                                    {langCodeToName(lang)}
                                </h1>
                                {(list as ISource[])
                                    .filter((source) => showNsfw || !source.isNsfw)
                                    .map((source) => (
                                        <SourceCard key={source.id} source={source} />
                                    ))}
                            </React.Fragment>
                        ),
                )}
        </>
    );
}
