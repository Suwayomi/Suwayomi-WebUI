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
import Typography from '@mui/material/Typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ButtonBase from '@mui/material/ButtonBase';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { SourceCard } from '@/features/browse/sources/components/SourceCard.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Sources as SourceService } from '@/features/source/services/Sources.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useAppAction } from '@/features/navigation-bar/hooks/useAppAction.ts';
import { StyledGroupedVirtuoso } from '@/base/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { SourceLanguageSelect } from '@/features/source/components/SourceLanguageSelect.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

export function Sources({ tabsMenuHeight }: { tabsMenuHeight: number }) {
    const { t } = useLingui();

    const { languages: shownLangs, setLanguages: setShownLangs } = SourceService.useLanguages();
    const {
        settings: { showNsfw },
    } = useMetadataServerSettings();

    const { data, loading: isLoading, error, refetch } = requestManager.useGetSourceList();
    const sources = data?.sources.nodes ?? STABLE_EMPTY_ARRAY;
    const filteredSources = useMemo(
        () =>
            SourceService.filter(sources, {
                isNsfw: showNsfw ? undefined : false,
                languages: shownLangs,
                keepLocalSource: true,
                enabled: true,
            }),
        [sources, shownLangs, showNsfw],
    );
    const sourceGroups = useMemo(() => SourceService.groupByFirstLetter(filteredSources), [filteredSources]);
    const [collapsedGroups, setCollapsedGroups] = useLocalStorage<string[]>('sources-collapsed-groups', []);
    const toggleGroup = (group: string) =>
        setCollapsedGroups(
            collapsedGroups.includes(group)
                ? collapsedGroups.filter((collapsedGroup) => collapsedGroup !== group)
                : [...collapsedGroups, group],
        );

    const sourceLanguages = useMemo(
        () =>
            SourceService.getLanguages(
                SourceService.filter(sources, { isNsfw: showNsfw ? undefined : false, removeLocalSource: true }),
                { excludeLocalSource: true },
            ),
        [sources, showNsfw],
    );
    const areSourcesFromDifferentRepos = useMemo(
        () => SourceService.areFromMultipleStores(filteredSources),
        [filteredSources],
    );
    // a collapsed group keeps its header and has no items
    const shownSourceGroups = useMemo(
        () => sourceGroups.map(([group, sourcesOfGroup]) => (collapsedGroups.includes(group) ? [] : sourcesOfGroup)),
        [sourceGroups, collapsedGroups],
    );
    const visibleSources = useMemo(() => shownSourceGroups.flat(), [shownSourceGroups]);

    const groupCounts = useMemo(() => shownSourceGroups.map((group) => group.length), [shownSourceGroups]);
    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => sourceGroups[index][0], [sourceGroups]),
        useCallback(
            (index, groupIndex) => `${sourceGroups[groupIndex][0]}_${visibleSources[index].id}`,
            [sourceGroups, visibleSources],
        ),
    );

    const navigate = useNavigate();

    useAppAction(
        <>
            <CustomTooltip title={t`Global Search`}>
                <IconButton onClick={() => navigate(AppRoutes.sources.children.searchAll.path())} color="inherit">
                    <TravelExploreIcon />
                </IconButton>
            </CustomTooltip>
            <SourceLanguageSelect
                selectedLanguages={shownLangs}
                setSelectedLanguages={setShownLangs}
                languages={sourceLanguages}
            />
        </>,
        [t, shownLangs, sourceLanguages, showNsfw],
    );

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Sources::refetch'))}
            />
        );
    }

    if (sources?.length === 0) {
        return <EmptyViewAbsoluteCentered message={t`No sources found. Install Some extensions first.`} />;
    }

    return (
        <StyledGroupedVirtuoso
            persistKey="sources"
            heightToSubtract={tabsMenuHeight}
            overscan={window.innerHeight * 0.5}
            groupCounts={groupCounts}
            computeItemKey={computeItemKey}
            groupContent={(index) => {
                const [group] = sourceGroups[index];
                const isCollapsed = collapsedGroups.includes(group);
                const isLetter = group.length === 1;

                return (
                    <StyledGroupHeader isFirstItem={!index}>
                        <ButtonBase
                            onClick={() => toggleGroup(group)}
                            aria-expanded={!isCollapsed}
                            sx={{ width: '100%', justifyContent: 'space-between', pr: 2 }}
                        >
                            <Typography variant="h5" component="h2">
                                {isLetter ? group : translateExtensionLanguage(group)}
                            </Typography>
                            {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                        </ButtonBase>
                    </StyledGroupHeader>
                );
            }}
            itemContent={(index) => {
                const source = visibleSources[index];

                // GroupedVirtuoso bug: with only empty groups it still asks for an item
                if (!source) {
                    return null;
                }

                return (
                    <StyledGroupItemWrapper>
                        <SourceCard source={source} showSourceRepo={areSourcesFromDifferentRepos} showLanguage />
                    </StyledGroupItemWrapper>
                );
            }}
        />
    );
}
