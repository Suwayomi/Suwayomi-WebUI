/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { MigrationManager, useMigrationSourceId, useMigrationEntries } from '@/features/migration/MigrationManager.ts';
import type { SourceItem } from '@/features/migration/components/MigrationSourcePriorityList.tsx';
import { MigrationSourcePriorityList } from '@/features/migration/components/MigrationSourcePriorityList.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

export const MigrationSelectingSources = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const currentSourceId = useMigrationSourceId();
    const entries = useMigrationEntries();
    const isSingleManga = MigrationManager.isSingleManga();

    const { data, loading, error, refetch } = requestManager.useGetSourceList({
        notifyOnNetworkStatusChange: true,
    });

    const initialSources = useMemo((): SourceItem[] => {
        if (!data?.sources.nodes) {
            return [];
        }

        return data.sources.nodes.map((source) => ({
            id: source.id,
            name: source.name,
            lang: source.lang,
            iconUrl: source.iconUrl,
            enabled: source.id !== currentSourceId,
            isCurrentSource: source.id === currentSourceId,
        }));
    }, [data, currentSourceId]);

    const [sources, setSources] = useState<SourceItem[]>([]);

    // Initialize sources from query data when available
    if (sources.length === 0 && initialSources.length > 0) {
        setSources(initialSources);
    }

    useAppTitleAndAction(t`Select destination sources`, undefined, []);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load sources`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('MigrationSelectingSources::refetch'))}
            />
        );
    }

    const enabledSourceIds = sources.filter((s) => s.enabled).map((s) => s.id);

    const handleStartSearch = () => {
        MigrationManager.startSearch(enabledSourceIds);

        if (isSingleManga) {
            // Single manga: navigate to SearchAll for the first entry
            const [entry] = Object.values(entries);
            if (entry) {
                navigate(
                    AppRoutes.migrate.childRoutes.legacySearch.path(entry.sourceId, entry.mangaId, entry.mangaTitle),
                    { state: { mangaTitle: entry.mangaTitle } },
                );
            }
        }
        // Multi: phase advances to SEARCHING, MigrationProcess re-renders
    };

    return (
        <>
            <Stack sx={{ p: 2, gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {t`Drag to reorder source priority. Uncheck sources to exclude them.`}
                </Typography>
            </Stack>
            <MigrationSourcePriorityList sources={sources} onSourcesChange={setSources} />
            <Stack
                direction="row"
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    zIndex: 1,
                }}
            >
                <Button variant="contained" disabled={enabledSourceIds.length === 0} onClick={handleStartSearch}>
                    {isSingleManga ? t`Search` : t`Start Search`}
                </Button>
            </Stack>
        </>
    );
};
