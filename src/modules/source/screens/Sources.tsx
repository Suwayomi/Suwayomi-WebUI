/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Fragment, useLayoutEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { sourceDefualtLangs, langSortCmp, DefaultLanguage } from '@/modules/core/utils/Languages.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { SourceCard } from '@/modules/source/components/SourceCard.tsx';
import { LangSelect } from '@/modules/core/components/inputs/LangSelect.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { SourceType } from '@/lib/graphql/generated/graphql.ts';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

function sourceToLangList(sources: Pick<SourceType, 'id' | 'lang'>[]) {
    const result = new Set<string>();

    sources.forEach((source) => {
        const isLocalSource = Number(source.id) === 0;
        const lang = isLocalSource ? DefaultLanguage.OTHER : source.lang;

        result.add(lang);
    });

    return [...result].sort(langSortCmp);
}

function groupByLang<Source extends Pick<SourceType, 'id' | 'name' | 'lang'>>(
    sources: Source[],
): Record<string, Source[]> {
    const result: Record<string, Source[]> = {};

    sources.forEach((source) => {
        const isLocalSource = Number(source.id) === 0;
        const lang = isLocalSource ? DefaultLanguage.OTHER : source.lang;

        result[lang] ??= [];
        result[lang].push(source);
    });

    Object.values(result).forEach((langSources) => langSources.sort((a, b) => a.name.localeCompare(b.name)));

    return result;
}

export function Sources() {
    const { t } = useTranslation();
    const { setAction } = useNavBarContext();

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const {
        data,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetSourceList({ notifyOnNetworkStatusChange: true });
    const sources = data?.sources.nodes;

    const areSourcesFromDifferentRepos = useMemo(() => {
        if (!sources || !!sources?.length) {
            return false;
        }

        const { repo } = sources[0].extension;
        return sources.some((source) => source.extension.repo !== repo);
    }, [sources]);

    const navigate = useNavigate();

    useLayoutEffect(() => {
        setAction(
            <>
                <CustomTooltip title={t('search.title.global_search')}>
                    <IconButton onClick={() => navigate(AppRoutes.sources.childRoutes.searchAll.path)} color="inherit">
                        <TravelExploreIcon />
                    </IconButton>
                </CustomTooltip>
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={sourceToLangList(sources ?? [])}
                />
            </>,
        );

        return () => {
            setAction(null);
        };
    }, [t, shownLangs, sources]);

    if (isLoading) return <LoadingPlaceholder />;

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Sources::refetch'))}
            />
        );
    }

    if (sources?.length === 0) {
        return <EmptyViewAbsoluteCentered message={t('source.error.label.no_sources_found')} />;
    }

    return (
        <>
            {Object.entries(groupByLang(sources ?? []))
                .sort((a, b) => langSortCmp(a[0], b[0]))
                .map(
                    ([lang, list]) =>
                        (lang === DefaultLanguage.OTHER || shownLangs.includes(lang)) && (
                            <Fragment key={lang}>
                                <Typography
                                    key={lang}
                                    variant="h5"
                                    component="h2"
                                    sx={{
                                        paddingLeft: 3,
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {translateExtensionLanguage(lang)}
                                </Typography>
                                {list
                                    .filter((source) => {
                                        const isLangOther = lang === DefaultLanguage.OTHER;
                                        if (isLangOther) {
                                            const isLocalSource = Number(source.id) === 0;
                                            const isLangShown = shownLangs.includes(lang);

                                            const isLangOtherSourceShown = isLangShown || isLocalSource;
                                            if (!isLangOtherSourceShown) {
                                                return false;
                                            }
                                        }

                                        return showNsfw || !source.isNsfw;
                                    })
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
