/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationSourceList } from '@/features/migration/components/MigrationSourceList.tsx';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { useCallback, useMemo } from 'react';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { arrayMove } from '@dnd-kit/sortable';
import Fab from '@mui/material/Fab';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import PushPinIcon from '@mui/icons-material/PushPin';
import IconButton from '@mui/material/IconButton';
import { SelectableCollectionSelectMode } from '@/base/collection/components/SelectableCollectionSelectMode.tsx';
import { Sources } from '@/features/source/services/Sources.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

export const MigrationSelectDestinationSources = () => {
    const { t } = useLingui();
    const currentSourceId = MigrationManager.useSourceId();

    const {
        settings: { browseLanguages, showNsfw },
        loading: areSettingsLoading,
        request: { error: settingsError, refetch: refetchSettings },
    } = useMetadataServerSettings();

    const {
        data,
        loading: areSourcesLoading,
        error: sourceError,
        refetch: refetchSources,
    } = requestManager.useGetSourceList({
        notifyOnNetworkStatusChange: true,
    });

    const allSources = data?.sources.nodes ?? STABLE_EMPTY_ARRAY;
    const sources = useMemo(
        () =>
            Sources.filter(allSources, {
                languages: browseLanguages,
                isNsfw: showNsfw ? undefined : false,
            }),
        [allSources, browseLanguages, showNsfw],
    );
    const sourceIds = useMemo(() => Sources.getIds(sources), [sources]);
    const pinnedSourceIds = useMemo(() => Sources.getIds(Sources.filter(sources, { pinned: true })), [sources]);
    const enabledSourceIds = useMemo(() => Sources.getIds(Sources.filter(sources, { enabled: true })), [sources]);

    const {
        selectedItemIds,
        areAllItemsSelected,
        areNoItemsSelected,
        handleSelectAll,
        setSelectionForKey,
        handleSelection,
    } = useSelectableCollection<SourceIdInfo['id']>(sources.length ?? 0, {
        currentKey: 'default',
        initialState: useMemo(
            () => ({
                default: pinnedSourceIds,
            }),
            [pinnedSourceIds],
        ),
    });

    useAppTitleAndAction(
        t`Select destination sources`,
        <>
            <CustomTooltip title={t`Select pinned sources`}>
                <IconButton color="inherit" onClick={() => setSelectionForKey('default', pinnedSourceIds)}>
                    <PushPinIcon />
                </IconButton>
            </CustomTooltip>
            <CustomTooltip title={t`Select enabled sources`}>
                <IconButton color="inherit" onClick={() => setSelectionForKey('default', enabledSourceIds)}>
                    <ToggleOnIcon />
                </IconButton>
            </CustomTooltip>
            <SelectableCollectionSelectMode
                isActive
                isCancelable={false}
                areAllItemsSelected={areAllItemsSelected}
                areNoItemsSelected={areNoItemsSelected}
                onSelectAll={(selectAll) =>
                    handleSelectAll(selectAll, [...new Set([...selectedItemIds, ...sourceIds])])
                }
                onModeChange={(checked) => {
                    handleSelectAll(checked, [...new Set([...selectedItemIds, ...sourceIds])]);
                }}
            />
        </>,
        [
            setSelectionForKey,
            selectedItemIds,
            pinnedSourceIds,
            enabledSourceIds,
            areAllItemsSelected,
            areNoItemsSelected,
            handleSelectAll,
            sourceIds,
        ],
    );

    const handlePriorityChange = useCallback(
        (oldIndex: number, newIndex: number) => {
            setSelectionForKey('default', arrayMove(selectedItemIds, oldIndex, newIndex));
        },
        [selectedItemIds, setSelectionForKey],
    );

    const loading = areSourcesLoading || areSettingsLoading;
    if (loading) {
        return <LoadingPlaceholder />;
    }

    const error = settingsError ?? sourceError;
    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load sources`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (settingsError) {
                        refetchSettings().catch(
                            defaultPromiseErrorHandler('MigrationSelectingSources::refetchSettings'),
                        );
                    }

                    if (sourceError) {
                        refetchSources().catch(defaultPromiseErrorHandler('MigrationSelectingSources::refetchSources'));
                    }
                }}
            />
        );
    }

    return (
        <>
            <MigrationSourceList
                sources={sources}
                selectedSourceIds={selectedItemIds}
                handleSelection={handleSelection}
                handlePriorityChange={handlePriorityChange}
                currentSourceId={currentSourceId}
            />
            <Fab
                variant="extended"
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: (theme) => theme.spacing(2),
                    right: (theme) => theme.spacing(2),
                }}
                onClick={() => MigrationManager.startSearch(selectedItemIds)}
            >
                {t`Start Search`}
            </Fab>
        </>
    );
};
