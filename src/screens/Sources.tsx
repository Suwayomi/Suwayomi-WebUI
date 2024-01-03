/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Fragment, useContext, useEffect, useMemo } from 'react';
import { IconButton, Tooltip, Typography } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ISource, TPartialSource } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useLocalStorage';
import { sourceDefualtLangs, sourceForcedDefaultLangs, langSortCmp } from '@/util/language';
import { translateExtensionLanguage } from '@/screens/util/Extensions';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { SourceCard } from '@/components/SourceCard';
import { LangSelect } from '@/components/navbar/action/LangSelect';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';

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

export function Sources() {
    const { t } = useTranslation();
    const { setAction } = useContext(NavBarContext);

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data, loading: isLoading } = requestManager.useGetSourceList();
    const sources = data?.sources.nodes;

    const areSourcesFromDifferentRepos = useMemo(() => {
        if (!sources || !!sources?.length) {
            return false;
        }

        const { repo } = sources[0].extension;
        return sources.some((source) => source.extension.repo !== repo);
    }, [sources]);

    const navigate = useNavigate();

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
        setAction(
            <>
                <Tooltip title={t('search.title.global_search')}>
                    <IconButton onClick={() => navigate('/sources/all/search/')} size="large">
                        <TravelExploreIcon />
                    </IconButton>
                </Tooltip>
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources ?? [])}
                    forcedLangs={sourceForcedDefaultLangs()}
                />
            </>,
        );
    }, [t, shownLangs, sources]);

    if (isLoading) return <LoadingPlaceholder />;

    if (sources?.length === 0) {
        return <h3>{t('source.error.label.no_sources_found')}</h3>;
    }

    return (
        <>
            {Object.entries(groupByLang(sources ?? []))
                .sort((a, b) => langSortCmp(a[0], b[0]))
                .map(
                    ([lang, list]) =>
                        shownLangs.indexOf(lang) !== -1 && (
                            <Fragment key={lang}>
                                <Typography
                                    key={lang}
                                    variant="h4"
                                    style={{
                                        paddingLeft: '24px',
                                        paddingTop: '6px',
                                        paddingBottom: '16px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {translateExtensionLanguage(lang)}
                                </Typography>
                                {(list as TPartialSource[])
                                    .filter((source) => showNsfw || !source.isNsfw)
                                    .map((source) => (
                                        <SourceCard
                                            key={source.id}
                                            source={source}
                                            showSourceRepo={areSourcesFromDifferentRepos}
                                        />
                                    ))}
                            </Fragment>
                        ),
                )}
        </>
    );
}
