/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import LangSelect from 'components/navbar/action/LangSelect';
import SourceCard from 'components/SourceCard';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import {
    sourceDefualtLangs, sourceForcedDefaultLangs, langCodeToName, langSortCmp,
} from 'util/language';
import useLocalStorage from 'util/useLocalStorage';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import { IconButton } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useHistory } from 'react-router-dom';

/**
 * Given a list of sources, return a list of languages
 * @param {ISource[]} sources - An array of sources.
 * @returns An array of strings.
 */
function sourceToLangList(sources: ISource[]) {
    const result: string[] = [];

    sources.forEach((source) => {
        if (result.indexOf(source.lang) === -1) { result.push(source.lang); }
    });

    result.sort(langSortCmp);
    return result;
}

/**
 * Given an array of sources, group them by language
 * @param {ISource[]} sources - An array of sources.
 * @returns An object with the language as the key and the sources as the value.
 */
function groupByLang(sources: ISource[]) {
    const result = {} as any;
    sources.forEach((source) => {
        if (result[source.lang] === undefined) { result[source.lang] = [] as ISource[]; }
        result[source.lang].push(source);
    });

    return result;
}

export default function Sources() {
    const { setTitle, setAction } = useContext(NavbarContext);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const [sources, setSources] = useState<ISource[]>([]);
    const [fetched, setFetched] = useState<boolean>(false);

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
                <IconButton
                    onClick={() => history.push('/sources/all/search/')}
                    size="large"
                >
                    <TravelExploreIcon />
                </IconButton>
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources)}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [shownLangs, sources]);

    useEffect(() => {
        client.get('/api/v1/source/list')
            .then((response) => response.data)
            .then((data) => { setSources(data); setFetched(true); });
    }, []);

    if (sources.length === 0) {
        if (fetched) return (<h3>No sources found. Install Some Extensions first.</h3>);
        return <LoadingPlaceholder />;
    }
    return (
        <>
            {/* eslint-disable-next-line max-len */}
            {Object.entries(groupByLang(sources)).sort((a, b) => langSortCmp(a[0], b[0])).map(([lang, list]) => (
                shownLangs.indexOf(lang) !== -1 && (
                    <React.Fragment key={lang}>
                        <h1 key={lang} style={{ marginLeft: 25 }}>{langCodeToName(lang)}</h1>
                        {(list as ISource[])
                            .filter((source) => showNsfw || !source.isNsfw)
                            .map((source) => (
                                <SourceCard
                                    key={source.id}
                                    source={source}
                                />
                            ))}
                    </React.Fragment>
                )
            ))}
        </>
    );
}
