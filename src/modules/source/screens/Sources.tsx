/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { DefaultLanguage, getDefaultLanguages } from '@/modules/core/utils/Languages.ts';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { SourceCard } from '@/modules/source/components/SourceCard.tsx';
import { LanguageSelect } from '@/modules/core/components/inputs/LanguageSelect.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Sources as SourceService } from '@/modules/source/services/Sources.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { useAppAction } from '@/modules/navigation-bar/hooks/useAppAction.ts';
import { StyledGroupedVirtuoso } from '@/modules/core/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { StyledGroupHeader } from '@/modules/core/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';

export function Sources({ tabsMenuHeight }: { tabsMenuHeight: number }) {
    const { t } = useTranslation();

    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownSourceLangs', getDefaultLanguages());
    const {
        settings: { showNsfw, lastUsedSourceId },
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
    const sourcesByLanguage = useMemo(() => {
        const lastUsedSource = SourceService.getLastUsedSource(lastUsedSourceId, filteredSources);
        const groupedByLanguageTuple = Object.entries(SourceService.groupByLanguage(filteredSources));

        if (lastUsedSource) {
            return [
                [DefaultLanguage.LAST_USED_SOURCE, [lastUsedSource]],
                ...groupedByLanguageTuple,
            ] satisfies typeof groupedByLanguageTuple;
        }

        return groupedByLanguageTuple;
    }, [filteredSources]);

    const sourceLanguages = useMemo(() => SourceService.getLanguages(sources ?? []), [sources]);
    const areSourcesFromDifferentRepos = useMemo(
        () => SourceService.areFromMultipleRepos(filteredSources),
        [filteredSources],
    );
    const visibleSources = useMemo(
        () => sourcesByLanguage.map(([, sourcesOfLanguage]) => sourcesOfLanguage).flat(1),
        [sourcesByLanguage],
    );

    const groupCounts = useMemo(
        () => sourcesByLanguage.map((sourceGroup) => sourceGroup[1].length),
        [sourcesByLanguage],
    );
    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => sourcesByLanguage[index][0], [sourcesByLanguage]),
        useCallback(
            (index, groupIndex) => `${sourcesByLanguage[groupIndex][0]}_${visibleSources[index].id}`,
            [visibleSources],
        ),
    );

    const navigate = useNavigate();

    useAppAction(
        <>
            <CustomTooltip title={t('search.title.global_search')}>
                <IconButton onClick={() => navigate(AppRoutes.sources.childRoutes.searchAll.path())} color="inherit">
                    <TravelExploreIcon />
                </IconButton>
            </CustomTooltip>
            <LanguageSelect
                selectedLanguages={shownLangs}
                setSelectedLanguages={setShownLangs}
                languages={sourceLanguages}
            />
        </>,
        [t, shownLangs, sourceLanguages],
    );

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
        <StyledGroupedVirtuoso
            persistKey="sources"
            heightToSubtract={tabsMenuHeight}
            overscan={window.innerHeight * 0.5}
            groupCounts={groupCounts}
            computeItemKey={computeItemKey}
            groupContent={(index) => {
                const [language] = sourcesByLanguage[index];

                return (
                    <StyledGroupHeader isFirstItem={!index}>
                        <Typography variant="h5" component="h2">
                            {translateExtensionLanguage(language)}
                        </Typography>
                    </StyledGroupHeader>
                );
            }}
            itemContent={(index) => {
                const source = visibleSources[index];

                return (
                    <StyledGroupItemWrapper>
                        <SourceCard source={source} showSourceRepo={areSourcesFromDifferentRepos} />
                    </StyledGroupItemWrapper>
                );
            }}
        />
    );
}
