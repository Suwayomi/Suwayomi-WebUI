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
import { sourceDefualtLangs } from '@/modules/core/utils/Languages.ts';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { SourceCard } from '@/modules/source/components/SourceCard.tsx';
import { LanguageSelect } from '@/modules/core/components/inputs/LanguageSelect.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { Sources as SourceService } from '@/modules/source/services/Sources.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';

export function Sources() {
    const { t } = useTranslation();
    const { setAction } = useNavBarContext();

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', sourceDefualtLangs());
    const {
        settings: { showNsfw },
    } = useMetadataServerSettings();

    const {
        data,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetSourceList({ notifyOnNetworkStatusChange: true });
    const sources = data?.sources.nodes;
    const filteredSources = useMemo(
        () => SourceService.filter(sources ?? [], { showNsfw, languages: shownLangs, keepLocalSource: true }),
        [sources, shownLangs],
    );
    const sourcesByLanguageTuple = useMemo(
        () => Object.entries(SourceService.groupByLanguage(filteredSources)),
        [filteredSources],
    );

    const sourceLanguages = useMemo(() => SourceService.getLanguages(sources ?? []), [sources]);
    const areSourcesFromDifferentRepos = useMemo(
        () => SourceService.areFromMultipleRepos(filteredSources),
        [filteredSources],
    );

    const navigate = useNavigate();

    useLayoutEffect(() => {
        setAction(
            <>
                <CustomTooltip title={t('search.title.global_search')}>
                    <IconButton onClick={() => navigate(AppRoutes.sources.childRoutes.searchAll.path)} color="inherit">
                        <TravelExploreIcon />
                    </IconButton>
                </CustomTooltip>
                <LanguageSelect
                    selectedLanguages={shownLangs}
                    setSelectedLanguages={setShownLangs}
                    languages={sourceLanguages}
                />
            </>,
        );

        return () => {
            setAction(null);
        };
    }, [t, shownLangs, sourceLanguages]);

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
            {sourcesByLanguageTuple.map(([languages, sourcesOfLanguage]) => (
                <Fragment key={languages}>
                    <Typography
                        key={languages}
                        variant="h5"
                        component="h2"
                        sx={{
                            paddingLeft: 3,
                            paddingTop: 1,
                            paddingBottom: 2,
                            fontWeight: 'bold',
                        }}
                    >
                        {translateExtensionLanguage(languages)}
                    </Typography>
                    {sourcesOfLanguage.map((source) => (
                        <SourceCard key={source.id} source={source} showSourceRepo={areSourcesFromDifferentRepos} />
                    ))}
                </Fragment>
            ))}
        </>
    );
}
